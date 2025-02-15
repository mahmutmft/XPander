const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');
const quests = require('../config/quests.js');
const { calculateLevel } = require('../utils/levelSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Quest management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View available quests'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a quest')
                .addStringOption(option =>
                    option.setName('quest_id')
                        .setDescription('The ID of the quest to start')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check your active quests'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset all your active quests')),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        
        // Get all available quests
        const availableQuests = [
            ...quests.daily,
            ...quests.weekly,  // Add weekly quests
            ...quests.achievements,
            ...quests.main
        ];

        // Get user's completed quests with cooldowns
        db.all(`
            SELECT uq.quest_id,
                   CASE 
                       WHEN q.cooldown = 'daily' THEN datetime(uq.completed_at, '+1 minute')
                       WHEN q.cooldown = 'weekly' THEN datetime(uq.completed_at, '+7 days')
                       ELSE NULL 
                   END as reset_time
            FROM user_quests uq
            JOIN quests q ON uq.quest_id = q.quest_id
            WHERE uq.user_id = ? AND uq.completed = 1`,
            [interaction.user.id],
            async (err, completedQuests) => {
                if (err) {
                    console.error('Error checking cooldowns:', err);
                    return await interaction.respond([]);
                }

                const completionMap = new Map(
                    (completedQuests || []).map(q => [q.quest_id, q.reset_time])
                );

                // Filter out quests on cooldown
                const availableChoices = availableQuests.filter(quest => {
                    const resetTime = completionMap.get(quest.id);
                    return !resetTime || new Date() >= new Date(resetTime);
                });

                const choices = availableChoices.map(quest => ({
                    name: `${quest.title} (${quest.reward_coins}🪙, ${quest.reward_xp}XP)`,
                    value: quest.id
                }));

                const filtered = choices.filter(choice => 
                    choice.name.toLowerCase().includes(focusedValue) ||
                    choice.value.toLowerCase().includes(focusedValue)
                );

                await interaction.respond(filtered.slice(0, 25));
            }
        );
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'list':
                await handleQuestList(interaction);
                break;
            case 'start':
                await handleQuestStart(interaction);
                break;
            case 'status':
                await handleQuestStatus(interaction);
                break;
            case 'reset':
                await handleQuestReset(interaction);
                break;
        }
    }
};

async function handleQuestList(interaction) {
    try {
        // Get user's completed quests
        db.all(`
            SELECT uq.quest_id,
                   CASE 
                       WHEN q.cooldown = 'daily' THEN datetime(uq.completed_at, '+1 minute')
                       WHEN q.cooldown = 'weekly' THEN datetime(uq.completed_at, '+7 days')
                       ELSE NULL 
                   END as reset_time
            FROM user_quests uq
            JOIN quests q ON uq.quest_id = q.quest_id
            WHERE uq.user_id = ? AND uq.completed = 1`,
            [interaction.user.id],
            async (err, completedQuests) => {
                if (err) {
                    console.error('Database error:', err);
                    return await interaction.reply({
                        content: 'An error occurred while fetching quests.',
                        ephemeral: true
                    });
                }

                // Initialize empty Map if no completed quests
                const completionMap = new Map(
                    (completedQuests || []).map(q => [q.quest_id, q.reset_time])
                );

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('📜 Available Quests')
                    .setDescription('Here are the quests you can undertake:');

                // Add daily quests with cooldown info
                const dailyQuestList = quests.daily.map(q => {
                    const resetTime = completionMap.get(q.id);
                    const status = resetTime && new Date() < new Date(resetTime) 
                        ? `\n⏳ Available at ${resetTime}` 
                        : '\n✅ Available now!';
                    return `**${q.title}**\n${q.description}\nRewards: ${q.reward_coins}🪙, ${q.reward_xp}XP${status}`;
                }).join('\n\n');
                embed.addFields({ name: '📅 Daily Quests', value: dailyQuestList || 'No daily quests available' });

                // Add weekly quests with cooldown info
                const weeklyQuestList = quests.weekly.map(q => {
                    const resetTime = completionMap.get(q.id);
                    const status = resetTime && new Date() < new Date(resetTime) 
                        ? `\n⏳ Available at ${resetTime}` 
                        : '\n✅ Available now!';
                    return `**${q.title}**\n${q.description}\nRewards: ${q.reward_coins}🪙, ${q.reward_xp}XP${status}`;
                }).join('\n\n');
                embed.addFields({ name: '📆 Weekly Quests', value: weeklyQuestList || 'No weekly quests available' });

                // Add other categories without cooldown info
                const mainQuestList = quests.main.map(q => 
                    `**${q.title}**\n${q.description}\nRewards: ${q.reward_coins}🪙, ${q.reward_xp}XP`
                ).join('\n\n');
                embed.addFields({ name: '⚔️ Main Quests', value: mainQuestList || 'No main quests available' });

                const achievementList = quests.achievements.map(q => 
                    `**${q.title}**\n${q.description}\nRewards: ${q.reward_coins}🪙, ${q.reward_xp}XP`
                ).join('\n\n');
                embed.addFields({ name: '🏆 Achievements', value: achievementList || 'No achievements available' });

                await interaction.reply({ embeds: [embed] });
            }
        );
    } catch (error) {
        console.error('Error in quest list:', error);
        await interaction.reply({ 
            content: 'An error occurred while fetching quests.', 
            ephemeral: true 
        });
    }
}

async function handleQuestStart(interaction) {
    const questId = interaction.options.getString('quest_id');

    try {
        // Check if user exists and get quest data
        db.get(`
            SELECT u.user_id, u.xp, 
                   q.type, q.cooldown, q.title, q.description, 
                   q.requirement_count, q.reward_coins, q.reward_xp
            FROM users u
            JOIN quests q ON q.quest_id = ?
            WHERE u.user_id = ?`,
            [questId, interaction.user.id],
            async (err, userData) => {
                if (err) {
                    console.error('Database error:', err);
                    return await interaction.reply({
                        content: 'Error checking user data!',
                        ephemeral: true
                    });
                }

                if (!userData) {
                    return await interaction.reply({
                        content: 'You need to register first! Use `/register`',
                        ephemeral: true
                    });
                }

                // Check cooldown
                db.get(`
                    SELECT uq.completed_at, q.type 
                    FROM user_quests uq
                    JOIN quests q ON q.quest_id = uq.quest_id
                    WHERE uq.user_id = ? 
                    AND uq.quest_id = ? 
                    AND uq.completed = 1 
                    AND (
                        (q.type = 'daily' AND date(uq.completed_at) = date('now'))
                        OR 
                        (q.type = 'weekly' AND date(uq.completed_at, 'weekday 0', '-7 days') = date('now', 'weekday 0', '-7 days'))
                    )`,
                    [interaction.user.id, questId],
                    async (err, lastCompletion) => {
                        if (err) {
                            console.error('Database error:', err);
                            return await interaction.reply({
                                content: 'Error checking quest status!',
                                ephemeral: true
                            });
                        }

                        if (lastCompletion) {
                            const cooldownType = userData.type === 'weekly' ? 'week' : 'day';
                            return await interaction.reply({
                                content: `⏳ You have already completed this quest this ${cooldownType}! Try again ${cooldownType === 'week' ? 'next week' : 'tomorrow'}.`,
                                ephemeral: true
                            });
                        }

                        // Start the quest
                        db.run('INSERT INTO user_quests (user_id, quest_id, progress) VALUES (?, ?, 0)',
                            [interaction.user.id, questId],
                            async (err) => {
                                if (err) {
                                    console.error('Database error:', err);
                                    return await interaction.reply({
                                        content: 'Failed to start quest!',
                                        ephemeral: true
                                    });
                                }

                                const embed = new EmbedBuilder()
                                    .setColor(0x0099FF)
                                    .setTitle('Quest Started!')
                                    .setDescription(`**${userData.title}**\n${userData.description}`)
                                    .addFields(
                                        { name: 'Objective', value: `Progress: 0/${userData.requirement_count}` },
                                        { name: 'Rewards', value: `💰 ${userData.reward_coins} coins\n✨ ${userData.reward_xp} XP` }
                                    );

                                await interaction.reply({ embeds: [embed] });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error in quest command:', error);
        await interaction.reply({
            content: 'An error occurred while processing the quest command.',
            ephemeral: true
        });
    }
}

async function handleQuestStatus(interaction) {
    try {
        db.all('SELECT uq.*, q.title, q.description, q.requirement_count FROM user_quests uq JOIN quests q ON uq.quest_id = q.quest_id WHERE uq.user_id = ? AND uq.completed = 0',
            [interaction.user.id],
            async (err, activeQuests) => {
                if (err) {
                    console.error('Database error:', err);
                    return await interaction.reply({
                        content: 'An error occurred while fetching your quests.',
                        ephemeral: true
                    });
                }

                if (!activeQuests || activeQuests.length === 0) {
                    return await interaction.reply({
                        content: 'You have no active quests! Use `/quest list` to find new quests.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('📋 Your Active Quests')
                    .setDescription('Here are your current quests in progress:');

                activeQuests.forEach(quest => {
                    const progress = Math.min(quest.progress, quest.requirement_count);
                    const progressBar = createProgressBar(progress, quest.requirement_count);
                    
                    embed.addFields({
                        name: quest.title,
                        value: `${quest.description}\n${progressBar} (${progress}/${quest.requirement_count})`
                    });
                });

                await interaction.reply({ embeds: [embed] });
            }
        );
    } catch (error) {
        console.error('Error in quest status:', error);
        await interaction.reply({
            content: 'An error occurred while checking quest status.',
            ephemeral: true
        });
    }
}

async function handleQuestReset(interaction) {
    try {
        db.run('DELETE FROM user_quests WHERE user_id = ? AND completed = 0',
            [interaction.user.id],
            async (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return await interaction.reply({
                        content: 'An error occurred while resetting quests.',
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content: '✅ All active quests have been reset. You can start new quests now!',
                    ephemeral: true
                });
            }
        );
    } catch (error) {
        console.error('Error in quest reset:', error);
        await interaction.reply({
            content: 'An error occurred while resetting quests.',
            ephemeral: true
        });
    }
}

function createProgressBar(current, max, length = 10) {
    const progress = Math.floor((current / max) * length);
    const filled = '█'.repeat(progress);
    const empty = '░'.repeat(length - progress);
    return filled + empty;
} 
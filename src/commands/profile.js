const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');
const { calculateLevel, calculateXpNeeded } = require('../utils/levelSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your or another user\'s RPG profile')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose profile you want to view')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            db.get('SELECT * FROM users WHERE user_id = ?', [targetUser.id], async (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return await interaction.reply({ 
                        content: 'An error occurred while fetching the profile!', 
                        ephemeral: true 
                    });
                }

                if (!row) {
                    return await interaction.reply({ 
                        content: targetUser.id === interaction.user.id ? 
                            'You need to register first! Use `/register`' : 
                            'This user hasn\'t registered yet!', 
                        ephemeral: true 
                    });
                }

                const level = calculateLevel(row.xp);
                const xpNeeded = calculateXpNeeded(row.xp);

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${targetUser.username}'s Profile`)
                    .setThumbnail(targetUser.displayAvatarURL())
                    .addFields(
                        { name: 'Level', value: level.toString(), inline: true },
                        { name: 'XP', value: `${row.xp} (${xpNeeded} until next level)`, inline: true },
                        { name: 'Coins', value: `${row.coins} 🪙`, inline: true },
                        { name: 'Member Since', value: new Date(row.created_at).toLocaleDateString() }
                    )
                    .setFooter({ text: 'XPander RPG' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            });
        } catch (error) {
            console.error('Error in profile command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing the profile.', 
                ephemeral: true 
            });
        }
    },
}; 
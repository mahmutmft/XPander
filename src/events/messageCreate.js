const { Events } = require('discord.js');
const db = require('../database/db.js');
const { calculateLevel } = require('../utils/levelSystem.js');

// Cooldown map for XP only
const xpCooldowns = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const userId = message.author.id;
        
        // Handle quest progress immediately (no cooldown)
        handleQuestProgress(message, userId);

        // Handle XP with cooldown
        if (!xpCooldowns.has(userId) || Date.now() > xpCooldowns.get(userId)) {
            handleXP(message, userId);
            xpCooldowns.set(userId, Date.now() + 60000); // 1 minute cooldown for XP
        }
    },
};

function handleXP(message, userId) {
    const xpGain = Math.floor(Math.random() * 11) + 15;

    db.get('SELECT xp, level FROM users WHERE user_id = ?', [userId], (err, row) => {
        if (err || !row) return;

        const oldLevel = calculateLevel(row.xp);
        const newXp = row.xp + xpGain;
        const newLevel = calculateLevel(newXp);

        db.run('UPDATE users SET xp = ? WHERE user_id = ?', [newXp, userId], (err) => {
            if (err) return;

            if (newLevel > oldLevel) {
                message.channel.send({
                    content: `🎉 Congratulations ${message.author}! You've reached level **${newLevel}**!`
                }).catch(console.error);
            }
        });
    });
}

function handleQuestProgress(message, userId) {
    db.get(`
        SELECT uq.id, uq.progress, uq.quest_id, q.requirement_count, q.title, q.reward_coins, q.reward_xp
        FROM user_quests uq 
        JOIN quests q ON uq.quest_id = q.quest_id 
        WHERE uq.user_id = ? 
        AND uq.completed = 0 
        AND q.requirement_type = 'messages'
        LIMIT 1`,
        [userId],
        (err, quest) => {
            if (err || !quest) return;

            const newProgress = quest.progress + 1;
            console.log(`Updating quest ${quest.quest_id} progress: ${quest.progress} -> ${newProgress}`);

            db.run('UPDATE user_quests SET progress = ? WHERE id = ?',
                [newProgress, quest.id],
                (err) => {
                    if (err) return;

                    if (newProgress >= quest.requirement_count) {
                        db.run('UPDATE user_quests SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
                            [quest.id]);
                        
                        db.run('UPDATE users SET coins = coins + ?, xp = xp + ? WHERE user_id = ?',
                            [quest.reward_coins, quest.reward_xp, userId]);

                        message.channel.send({
                            content: `🎉 <@${userId}> completed quest: **${quest.title}**!\nRewards: ${quest.reward_coins}🪙, ${quest.reward_xp}XP`
                        }).catch(console.error);
                    }
                }
            );
        }
    );
} 
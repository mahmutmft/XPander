const { Events } = require('discord.js');
const db = require('../database/db.js');
const { calculateLevel } = require('../utils/levelSystem.js');

// Cooldown map to prevent XP farming
const xpCooldowns = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const userId = message.author.id;
        
        // Check cooldown (1 minute)
        if (xpCooldowns.has(userId)) {
            const cooldownEnd = xpCooldowns.get(userId);
            if (Date.now() < cooldownEnd) return;
        }

        // Set cooldown
        xpCooldowns.set(userId, Date.now() + 60000);

        // Random XP between 15-25
        const xpGain = Math.floor(Math.random() * 11) + 15;

        db.get('SELECT xp, level FROM users WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return;
            }

            if (!row) return; // User not registered

            const oldLevel = calculateLevel(row.xp);
            const newXp = row.xp + xpGain;
            const newLevel = calculateLevel(newXp);

            db.run('UPDATE users SET xp = ? WHERE user_id = ?', [newXp, userId], (err) => {
                if (err) {
                    console.error('Error updating XP:', err);
                    return;
                }

                // Level up notification
                if (newLevel > oldLevel) {
                    message.channel.send({
                        content: `🎉 Congratulations ${message.author}! You've reached level **${newLevel}**!`
                    }).catch(console.error);
                }
            });
        });
    },
}; 
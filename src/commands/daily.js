const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

const DAILY_AMOUNT = 100; // Daily reward amount
const COOLDOWN_HOURS = 24; // Hours until next daily claim

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily coins reward'),
    async execute(interaction) {
        try {
            db.get('SELECT coins, last_daily FROM users WHERE user_id = ?', 
                [interaction.user.id], 
                async (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({ 
                            content: 'An error occurred while checking daily status!', 
                            ephemeral: true 
                        });
                    }

                    if (!row) {
                        return await interaction.reply({ 
                            content: 'You need to register first! Use `/register`', 
                            ephemeral: true 
                        });
                    }

                    const now = new Date();
                    const lastDaily = row.last_daily ? new Date(row.last_daily) : new Date(0);
                    const timeDiff = now - lastDaily;
                    const hoursLeft = COOLDOWN_HOURS - (timeDiff / (1000 * 60 * 60));

                    if (hoursLeft > 0) {
                        const hours = Math.floor(hoursLeft);
                        const minutes = Math.floor((hoursLeft % 1) * 60);
                        return await interaction.reply({ 
                            content: `You can claim your daily reward in ${hours}h ${minutes}m!`, 
                            ephemeral: true 
                        });
                    }

                    // Update coins and last_daily
                    const newCoins = row.coins + DAILY_AMOUNT;
                    db.run('UPDATE users SET coins = ?, last_daily = CURRENT_TIMESTAMP WHERE user_id = ?',
                        [newCoins, interaction.user.id],
                        async (err) => {
                            if (err) {
                                console.error('Database error:', err);
                                return await interaction.reply({ 
                                    content: 'Failed to claim daily reward!', 
                                    ephemeral: true 
                                });
                            }

                            await interaction.reply({ 
                                content: `🎉 You claimed your daily reward of ${DAILY_AMOUNT} 🪙!\nNew balance: ${newCoins} 🪙`, 
                                ephemeral: false 
                            });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error in daily command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing your daily reward.', 
                ephemeral: true 
            });
        }
    },
}; 
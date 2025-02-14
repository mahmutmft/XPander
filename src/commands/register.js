const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register your profile in the RPG system'),
    async execute(interaction) {
        try {
            // Check if user already exists
            db.get('SELECT user_id FROM users WHERE user_id = ?', 
                [interaction.user.id], 
                async (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({ 
                            content: 'An error occurred while checking registration!', 
                            ephemeral: true 
                        });
                    }

                    if (row) {
                        return await interaction.reply({ 
                            content: 'You are already registered!', 
                            ephemeral: true 
                        });
                    }

                    // Register new user
                    db.run('INSERT INTO users (user_id, username) VALUES (?, ?)',
                        [interaction.user.id, interaction.user.username],
                        async (err) => {
                            if (err) {
                                console.error('Database error:', err);
                                return await interaction.reply({ 
                                    content: 'Failed to register!', 
                                    ephemeral: true 
                                });
                            }

                            await interaction.reply({ 
                                content: '✅ Successfully registered! Welcome to XPander RPG!', 
                                ephemeral: true 
                            });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error in register command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing your registration.', 
                ephemeral: true 
            });
        }
    },
}; 
const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s coin balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose balance you want to check')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            db.get('SELECT coins FROM users WHERE user_id = ?', [targetUser.id], async (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return await interaction.reply({ 
                        content: 'An error occurred while fetching the balance!', 
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

                await interaction.reply({ 
                    content: `${targetUser.username}'s balance: ${row.coins} 🪙`, 
                    ephemeral: false 
                });
            });
        } catch (error) {
            console.error('Error in balance command:', error);
            await interaction.reply({ 
                content: 'An error occurred while checking the balance.', 
                ephemeral: true 
            });
        }
    },
}; 
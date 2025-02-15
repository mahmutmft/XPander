const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

const DEV_ID = '1182694996483264656'; // Your Discord ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Developer commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('coins')
                .setDescription('Set coins (Dev only)')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of coins')
                        .setRequired(true))),

    async execute(interaction) {
        // Check if user is developer
        if (interaction.user.id !== DEV_ID) {
            return await interaction.reply({
                content: '❌ This command is only for developers!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'coins') {
            const amount = interaction.options.getInteger('amount');

            db.run('UPDATE users SET coins = ? WHERE user_id = ?',
                [amount, interaction.user.id],
                async (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({
                            content: 'Error setting coins!',
                            ephemeral: true
                        });
                    }

                    await interaction.reply({
                        content: `✅ Set coins to ${amount}🪙`,
                        ephemeral: true
                    });
                }
            );
        }
    },
}; 
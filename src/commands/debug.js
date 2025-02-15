const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debug commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('quests')
                .setDescription('List all quests in database')),

    async execute(interaction) {
        if (!interaction.options.getSubcommand() === 'quests') return;

        db.all('SELECT * FROM quests', async (err, quests) => {
            if (err) {
                console.error('Database error:', err);
                return await interaction.reply({
                    content: 'Error fetching quests!',
                    ephemeral: true
                });
            }

            const questList = quests.map(q => 
                `${q.quest_id}: ${q.title} (${q.type})`
            ).join('\n');

            await interaction.reply({
                content: `Quests in database:\n\`\`\`\n${questList}\n\`\`\``,
                ephemeral: true
            });
        });
    }
}; 
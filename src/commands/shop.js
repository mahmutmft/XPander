const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const shopItems = require('../config/shopItems.js');
const db = require('../database/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse the shop for items'),
    async execute(interaction) {
        try {
            // Create category selection menu
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('shop_category')
                        .setPlaceholder('Select a category')
                        .addOptions([
                            {
                                label: 'Weapons',
                                description: 'View available weapons',
                                value: 'weapons',
                                emoji: '⚔️'
                            },
                            {
                                label: 'Armor',
                                description: 'View available armor',
                                value: 'armor',
                                emoji: '🛡️'
                            },
                            {
                                label: 'Consumables',
                                description: 'View potions and other consumables',
                                value: 'consumables',
                                emoji: '🧪'
                            }
                        ])
                );

            // Create initial embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🏪 XPander Shop')
                .setDescription('Welcome to the shop! Select a category to view items.')
                .addFields(
                    { name: 'Categories', value: '⚔️ Weapons\n🛡️ Armor\n🧪 Consumables' }
                )
                .setFooter({ text: 'Use /buy [item] to purchase an item' });

            const response = await interaction.reply({ 
                embeds: [embed], 
                components: [row], 
                fetchReply: true 
            });

            // Create a collector for the selection menu
            const collector = response.createMessageComponentCollector({
                componentType: 3, // SELECT_MENU
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ 
                        content: 'This menu is not for you!', 
                        ephemeral: true 
                    });
                }

                const category = i.values[0];
                const items = shopItems[category];

                const categoryEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`🏪 XPander Shop - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                    .setDescription('Here are the available items:');

                items.forEach(item => {
                    categoryEmbed.addFields({
                        name: `${item.emoji} ${item.name} - ${item.price} 🪙`,
                        value: `ID: \`${item.id}\`\n${item.description}\nLevel Required: ${item.level_required}`
                    });
                });

                await i.update({ 
                    embeds: [categoryEmbed], 
                    components: [row] 
                });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        row.components[0].setDisabled(true)
                    );
                interaction.editReply({ 
                    components: [disabledRow] 
                }).catch(console.error);
            });

        } catch (error) {
            console.error('Error in shop command:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: 'An error occurred while opening the shop.', 
                    ephemeral: true 
                });
            }
        }
    },
}; 
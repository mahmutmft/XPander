const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');
const items = require('../config/items.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory'),

    async execute(interaction) {
        try {
            // Check if user exists
            db.get('SELECT user_id FROM users WHERE user_id = ?', 
                [interaction.user.id], 
                async (err, user) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({
                            content: 'Error checking inventory!',
                            ephemeral: true
                        });
                    }

                    if (!user) {
                        return await interaction.reply({
                            content: 'You need to register first! Use `/register`',
                            ephemeral: true
                        });
                    }

                    // Get user's inventory
                    db.all('SELECT item_id, quantity, equipped, durability FROM inventory WHERE user_id = ?',
                        [interaction.user.id],
                        async (err, userItems) => {
                            if (err) {
                                console.error('Database error:', err);
                                return await interaction.reply({
                                    content: 'Error fetching inventory!',
                                    ephemeral: true
                                });
                            }

                            if (!userItems || userItems.length === 0) {
                                return await interaction.reply({
                                    content: 'Your inventory is empty!',
                                    ephemeral: true
                                });
                            }

                            const embed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle(`${interaction.user.username}'s Inventory`)
                                .setThumbnail(interaction.user.displayAvatarURL())
                                .setFooter({ text: 'Use /use [item] to use or equip items' });

                            // Group items by type
                            const groupedItems = {};
                            userItems.forEach(item => {
                                const itemData = items[item.item_id];
                                if (!itemData) return;

                                if (!groupedItems[itemData.type]) {
                                    groupedItems[itemData.type] = [];
                                }
                                
                                groupedItems[itemData.type].push({
                                    ...item,
                                    data: itemData
                                });
                            });

                            // Add fields for each type
                            Object.entries(groupedItems).forEach(([type, typeItems]) => {
                                const itemsList = typeItems
                                    .map(item => {
                                        const equippedText = item.equipped ? ' (Equipped)' : '';
                                        const durabilityText = item.data.durability ? 
                                            ` [${item.durability || 0}/${item.data.durability.max}]` : '';
                                        return `${item.data.icon} ${item.data.name} ×${item.quantity}${equippedText}${durabilityText}`;
                                    })
                                    .join('\n');

                                embed.addFields({
                                    name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
                                    value: itemsList
                                });
                            });

                            await interaction.reply({ embeds: [embed] });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error in inventory command:', error);
            await interaction.reply({
                content: 'An error occurred while showing inventory.',
                ephemeral: true
            });
        }
    }
}; 
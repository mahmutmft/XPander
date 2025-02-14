const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');
const shopItems = require('../config/shopItems.js');

// Flatten items for easy lookup
const allItems = {
    ...Object.fromEntries(shopItems.weapons.map(item => [item.id, item])),
    ...Object.fromEntries(shopItems.armor.map(item => [item.id, item])),
    ...Object.fromEntries(shopItems.consumables.map(item => [item.id, item]))
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory'),
    async execute(interaction) {
        try {
            db.all('SELECT item_id, quantity, equipped FROM inventory WHERE user_id = ?', 
                [interaction.user.id], 
                async (err, rows) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({ 
                            content: 'An error occurred while fetching your inventory!', 
                            ephemeral: true 
                        });
                    }

                    if (!rows || rows.length === 0) {
                        return await interaction.reply({ 
                            content: 'Your inventory is empty! Use `/shop` to browse items.', 
                            ephemeral: true 
                        });
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`${interaction.user.username}'s Inventory`)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter({ text: 'XPander RPG' })
                        .setTimestamp();

                    // Group items by category
                    const categories = {
                        Weapons: rows.filter(row => allItems[row.item_id]?.category === 'weapon'),
                        Armor: rows.filter(row => allItems[row.item_id]?.category === 'armor'),
                        Consumables: rows.filter(row => allItems[row.item_id]?.category === 'consumable')
                    };

                    for (const [category, items] of Object.entries(categories)) {
                        if (items.length > 0) {
                            const itemsList = items.map(row => {
                                const item = allItems[row.item_id];
                                return `${item.emoji} ${item.name} x${row.quantity}${row.equipped ? ' (Equipped)' : ''}`;
                            }).join('\n');
                            
                            if (itemsList) {
                                embed.addFields({ name: category, value: itemsList });
                            }
                        }
                    }

                    await interaction.reply({ embeds: [embed] });
                }
            );
        } catch (error) {
            console.error('Error in inventory command:', error);
            await interaction.reply({ 
                content: 'An error occurred while checking your inventory.', 
                ephemeral: true 
            });
        }
    },
}; 
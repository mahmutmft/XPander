const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');
const items = require('../config/items.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repair')
        .setDescription('Repair an item from your inventory')
        .addStringOption(option =>
            option.setName('item_id')
                .setDescription('The item to repair')
                .setRequired(true)
                .setAutocomplete(true)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        
        try {
            // Get user's damaged items
            const userItems = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT i.*, it.durability as max_durability
                    FROM inventory i
                    INNER JOIN (
                        SELECT 'wooden_sword' as item_id, 100 as durability
                        UNION SELECT 'iron_sword', 200
                        UNION SELECT 'leather_armor', 150
                    ) it ON i.item_id = it.item_id
                    WHERE i.user_id = ? 
                    AND (i.durability < it.durability OR i.durability IS NULL)`,
                    [interaction.user.id],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            if (!userItems || userItems.length === 0) {
                return await interaction.respond([{
                    name: "No items need repair",
                    value: "none"
                }]);
            }

            const choices = userItems.map(item => {
                const itemData = items[item.item_id];
                const currentDurability = item.durability || 0;
                return {
                    name: `${itemData.icon} ${itemData.name} [${currentDurability}/${item.max_durability}]`,
                    value: item.item_id
                };
            });

            const filtered = choices.filter(choice => 
                choice.name.toLowerCase().includes(focusedValue) ||
                choice.value.toLowerCase().includes(focusedValue)
            );

            await interaction.respond(filtered.slice(0, 25));
        } catch (error) {
            console.error('Error in repair autocomplete:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const itemId = interaction.options.getString('item_id');
        const itemData = items[itemId];
        const repairCost = Math.ceil((itemData.durability.max - itemData.durability.current) * 0.5);

        try {
            // Get user data and item
            db.get(`
                SELECT u.coins, i.durability, i.id as inventory_id
                FROM users u
                JOIN inventory i ON i.user_id = u.user_id
                WHERE u.user_id = ? AND i.item_id = ?`,
                [interaction.user.id, itemId],
                async (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({
                            content: 'Error checking repair status!',
                            ephemeral: true
                        });
                    }

                    if (!row) {
                        return await interaction.reply({
                            content: 'You don\'t have this item!',
                            ephemeral: true
                        });
                    }

                    if (row.durability >= itemData.durability.max) {
                        return await interaction.reply({
                            content: 'This item doesn\'t need repairs!',
                            ephemeral: true
                        });
                    }

                    if (row.coins < repairCost) {
                        return await interaction.reply({
                            content: `You need ${repairCost}🪙 to repair this item!`,
                            ephemeral: true
                        });
                    }

                    // Repair item and deduct coins
                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');

                        db.run('UPDATE inventory SET durability = ? WHERE id = ?',
                            [itemData.durability.max, row.inventory_id]);

                        db.run('UPDATE users SET coins = coins - ? WHERE user_id = ?',
                            [repairCost, interaction.user.id]);

                        db.run('COMMIT');

                        interaction.reply({
                            content: `✨ Repaired ${itemData.icon} ${itemData.name} for ${repairCost}🪙!`,
                            ephemeral: false
                        });
                    });
                }
            );
        } catch (error) {
            console.error('Error in repair command:', error);
            await interaction.reply({
                content: 'An error occurred while repairing the item.',
                ephemeral: true
            });
        }
    },
}; 
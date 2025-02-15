const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db.js');
const items = require('../config/items.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('Use or equip an item')
        .addStringOption(option =>
            option.setName('item_id')
                .setDescription('The item to use')
                .setRequired(true)
                .setAutocomplete(true)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        
        try {
            const userItems = await new Promise((resolve, reject) => {
                db.all('SELECT * FROM inventory WHERE user_id = ?',
                    [interaction.user.id],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            const choices = userItems.map(item => {
                const itemData = items[item.item_id];
                return {
                    name: `${itemData.icon} ${itemData.name}`,
                    value: item.item_id
                };
            });

            const filtered = choices.filter(choice => 
                choice.name.toLowerCase().includes(focusedValue) ||
                choice.value.toLowerCase().includes(focusedValue)
            );

            await interaction.respond(filtered.slice(0, 25));
        } catch (error) {
            console.error('Error in use autocomplete:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const itemId = interaction.options.getString('item_id');
        const itemData = items[itemId];

        try {
            db.get('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?',
                [interaction.user.id, itemId],
                async (err, item) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({
                            content: 'Error checking item!',
                            ephemeral: true
                        });
                    }

                    if (!item) {
                        return await interaction.reply({
                            content: 'You don\'t have this item!',
                            ephemeral: true
                        });
                    }

                    if (itemData.durability && item.durability <= 0) {
                        return await interaction.reply({
                            content: 'This item is broken! Use `/repair` to fix it.',
                            ephemeral: true
                        });
                    }

                    // Handle different item types
                    switch (itemData.type) {
                        case 'weapon':
                        case 'armor':
                            await handleEquipment(interaction, item, itemData);
                            break;
                        case 'consumable':
                            await handleConsumable(interaction, item, itemData);
                            break;
                        default:
                            await interaction.reply({
                                content: 'This item cannot be used!',
                                ephemeral: true
                            });
                    }
                }
            );
        } catch (error) {
            console.error('Error in use command:', error);
            await interaction.reply({
                content: 'An error occurred while using the item.',
                ephemeral: true
            });
        }
    },
};

async function handleEquipment(interaction, item, itemData) {
    try {
        // Start transaction
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION');
            
            // First unequip all items of same type
            db.run(
                'UPDATE inventory SET equipped = 0 WHERE user_id = ? AND item_id IN (SELECT i.item_id FROM inventory i WHERE i.user_id = ? AND equipped = 1)',
                [interaction.user.id, interaction.user.id],
                (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    // Then equip the new item
                    db.run(
                        'UPDATE inventory SET equipped = 1 WHERE id = ?',
                        [item.id],
                        (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            db.run('COMMIT');
                            resolve();
                        }
                    );
                }
            );
        });

        await interaction.reply({
            content: `Equipped ${itemData.icon} ${itemData.name}!`,
            ephemeral: false
        });
    } catch (error) {
        console.error('Error equipping item:', error);
        await interaction.reply({
            content: 'Failed to equip item!',
            ephemeral: true
        });
    }
}

async function handleConsumable(interaction, item, itemData) {
    if (item.quantity <= 0) {
        return await interaction.reply({
            content: 'You don\'t have any more of this item!',
            ephemeral: true
        });
    }

    // Handle consumable effects
    switch (itemData.effect) {
        case 'heal':
            // TODO: Implement healing when we add HP system
            break;
        // Add more effects as needed
    }

    // Reduce quantity
    if (item.quantity === 1) {
        db.run('DELETE FROM inventory WHERE id = ?', [item.id]);
    } else {
        db.run('UPDATE inventory SET quantity = quantity - 1 WHERE id = ?', [item.id]);
    }

    await interaction.reply({
        content: `Used ${itemData.icon} ${itemData.name}!`,
        ephemeral: false
    });
} 
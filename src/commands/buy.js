const { SlashCommandBuilder } = require('discord.js');
const shopItems = require('../config/shopItems.js');
const db = require('../database/db.js');
const { calculateLevel } = require('../utils/levelSystem.js');

// Create a flat array of all items for autocomplete
const allItems = [
    ...shopItems.weapons,
    ...shopItems.armor,
    ...shopItems.consumables
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Purchase an item from the shop')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The ID of the item to buy')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('How many to buy')
                .setMinValue(1)
                .setMaxValue(99)
                .setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = allItems.map(item => ({
            name: `${item.emoji} ${item.name} (${item.price} 🪙)`,
            value: item.id
        }));

        const filtered = choices.filter(choice => 
            choice.name.toLowerCase().includes(focusedValue) || 
            choice.value.toLowerCase().includes(focusedValue)
        );
        
        await interaction.respond(
            filtered.slice(0, 25)
        );
    },

    async execute(interaction) {
        const itemId = interaction.options.getString('item');
        const quantity = interaction.options.getInteger('quantity') || 1;

        try {
            // Find the item in shop
            let item = null;
            for (const category of Object.values(shopItems)) {
                const found = category.find(i => i.id === itemId);
                if (found) {
                    item = found;
                    break;
                }
            }

            if (!item) {
                return await interaction.reply({
                    content: 'Invalid item ID. Use `/shop` to see available items.',
                    ephemeral: true
                });
            }

            // Check user's level and coins
            db.get('SELECT coins, xp FROM users WHERE user_id = ?', 
                [interaction.user.id], 
                async (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return await interaction.reply({
                            content: 'An error occurred while processing your purchase.',
                            ephemeral: true
                        });
                    }

                    if (!row) {
                        return await interaction.reply({
                            content: 'You need to register first! Use `/register`',
                            ephemeral: true
                        });
                    }

                    const userLevel = calculateLevel(row.xp);
                    if (userLevel < item.level_required) {
                        return await interaction.reply({
                            content: `You need to be level ${item.level_required} to buy this item!`,
                            ephemeral: true
                        });
                    }

                    const totalCost = item.price * quantity;
                    if (row.coins < totalCost) {
                        return await interaction.reply({
                            content: `You don't have enough coins! You need ${totalCost} 🪙`,
                            ephemeral: true
                        });
                    }

                    // Add item to inventory and deduct coins
                    db.run('BEGIN TRANSACTION');

                    db.run('UPDATE users SET coins = coins - ? WHERE user_id = ?',
                        [totalCost, interaction.user.id]);

                    db.run(`
                        INSERT INTO inventory (user_id, item_id, quantity, durability) 
                        VALUES (?, ?, ?, ?)`,
                        [
                            interaction.user.id, 
                            itemId, 
                            quantity, 
                            item.durability ? item.durability.max : null
                        ],
                        async (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                console.error('Database error:', err);
                                return await interaction.reply({
                                    content: 'Failed to process purchase!',
                                    ephemeral: true
                                });
                            }

                            db.run('COMMIT');
                            await interaction.reply({
                                content: `Successfully purchased ${quantity}x ${item.emoji} ${item.name} for ${totalCost} 🪙!`,
                                ephemeral: false
                            });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error in buy command:', error);
            await interaction.reply({
                content: 'An error occurred while processing your purchase.',
                ephemeral: true
            });
        }
    },
}; 
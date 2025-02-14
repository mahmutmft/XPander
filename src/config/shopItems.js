module.exports = {
    weapons: [
        {
            id: 'wooden_sword',
            name: 'Wooden Sword',
            description: 'A basic training sword',
            price: 100,
            category: 'weapon',
            damage: 5,
            level_required: 1,
            emoji: '🗡️'
        },
        {
            id: 'iron_sword',
            name: 'Iron Sword',
            description: 'A reliable iron sword',
            price: 500,
            category: 'weapon',
            damage: 15,
            level_required: 5,
            emoji: '⚔️'
        }
    ],
    armor: [
        {
            id: 'leather_armor',
            name: 'Leather Armor',
            description: 'Basic protective gear',
            price: 150,
            category: 'armor',
            defense: 5,
            level_required: 1,
            emoji: '🥋'
        }
    ],
    consumables: [
        {
            id: 'health_potion',
            name: 'Health Potion',
            description: 'Restores 50 HP',
            price: 50,
            category: 'consumable',
            effect: 'heal',
            power: 50,
            emoji: '🧪'
        }
    ]
}; 
module.exports = {
  // Weapons
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    description: 'A basic training sword',
    type: 'weapon',
    price: 100,
    damage: 5,
    level_required: 1,
    icon: '🗡️',
    durability: {
      max: 100,
      current: 100,
      loss_per_use: 5
    }
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A reliable iron sword',
    price: 500,
    damage: 15,
    level_required: 5,
    icon: '⚔️',
    durability: {
      max: 200,
      current: 200,
      loss_per_use: 3
    }
  },

  // Armor
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Basic protective gear',
    price: 150,
    type: 'armor',
    defense: 5,
    level_required: 1,
    icon: '🥋',
    durability: {
      max: 150,
      current: 150,
      loss_per_use: 2
    }
  },

  // Consumables
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    price: 50,
    type: 'consumable',
    effect: 'heal',
    power: 50,
    icon: '🧪'
  },

  // Materials
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'Basic crafting material',
    type: 'material',
    price: 25,
    icon: '🪵'
  }
}; 
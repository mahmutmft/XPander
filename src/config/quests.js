module.exports = {
    daily: [
        {
            id: 'daily_messages',
            title: 'Daily Chatter',
            description: 'Send 10 messages in any channel',
            type: 'daily',
            requirement_type: 'messages',
            requirement_count: 10,
            reward_xp: 100,
            reward_coins: 50,
            min_level: 1
        },
        {
            id: 'daily_shop',
            title: 'Daily Shopper',
            description: 'Buy any item from the shop',
            type: 'daily',
            requirement_type: 'purchases',
            requirement_count: 1,
            reward_xp: 50,
            reward_coins: 100,
            min_level: 1
        }
    ],
    achievements: [
        {
            id: 'first_weapon',
            title: 'Armed and Ready',
            description: 'Buy your first weapon',
            type: 'achievement',
            requirement_type: 'weapon_purchase',
            requirement_count: 1,
            reward_xp: 200,
            reward_coins: 150,
            min_level: 1
        },
        {
            id: 'social_butterfly',
            title: 'Social Butterfly',
            description: 'Send 100 messages',
            type: 'achievement',
            requirement_type: 'messages',
            requirement_count: 100,
            reward_xp: 300,
            reward_coins: 200,
            min_level: 1
        }
    ],
    main: [
        {
            id: 'reach_level_5',
            title: 'Rising Star',
            description: 'Reach level 5',
            type: 'main',
            requirement_type: 'level',
            requirement_count: 5,
            reward_xp: 500,
            reward_coins: 1000,
            min_level: 1
        },
        {
            id: 'first_equipment',
            title: 'Getting Equipped',
            description: 'Buy your first piece of armor',
            type: 'main',
            requirement_type: 'armor_purchase',
            requirement_count: 1,
            reward_xp: 200,
            reward_coins: 300,
            min_level: 2
        }
    ]
}; 
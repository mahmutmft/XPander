const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Set up rotating activity status
        const activities = [
            { name: '/help for commands', type: ActivityType.Playing },
            { name: 'with RPG features', type: ActivityType.Playing },
            { name: 'Level up & Adventure!', type: ActivityType.Playing }
        ];
        
        let currentActivity = 0;
        
        setInterval(() => {
            const activity = activities[currentActivity];
            client.user.setActivity(activity.name, { type: activity.type });
            currentActivity = (currentActivity + 1) % activities.length;
        }, 10000);
    },
}; 
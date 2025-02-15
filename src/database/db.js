const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const quests = require('../config/quests.js');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'rpg.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to SQLite database');
    
    // Create tables if they don't exist
    initializeTables();
});

function initializeTables() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                coins INTEGER DEFAULT 0,
                last_daily DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Inventory table
        db.run(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                item_id TEXT,
                quantity INTEGER DEFAULT 1,
                equipped BOOLEAN DEFAULT 0,
                durability INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `);

        // Quests table
        db.run(`
            CREATE TABLE IF NOT EXISTS quests (
                quest_id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                type TEXT,
                requirement_type TEXT,
                requirement_count INTEGER,
                reward_xp INTEGER,
                reward_coins INTEGER,
                min_level INTEGER DEFAULT 1,
                cooldown TEXT DEFAULT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating quests table:', err);
                return;
            }

            // Initialize quests after table is created
            const allQuests = [
                ...quests.daily,
                ...quests.weekly,
                ...quests.achievements,
                ...quests.main
            ];

            allQuests.forEach(quest => {
                db.run(`
                    INSERT OR REPLACE INTO quests (
                        quest_id, title, description, type,
                        requirement_type, requirement_count,
                        reward_xp, reward_coins, min_level,
                        cooldown
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    quest.id,
                    quest.title,
                    quest.description,
                    quest.type,
                    quest.requirement_type,
                    quest.requirement_count,
                    quest.reward_xp,
                    quest.reward_coins,
                    quest.min_level,
                    quest.cooldown
                ], (err) => {
                    if (err) {
                        console.error('Error inserting quest:', quest.id, err);
                    }
                });
            });
        });

        // User Quests table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                quest_id TEXT,
                progress INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT 0,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (quest_id) REFERENCES quests(quest_id)
            )
        `);
    });
}

module.exports = db; 
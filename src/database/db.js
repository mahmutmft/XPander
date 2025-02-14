const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
    // Users table for XP and basic info
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
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `);
}

module.exports = db; 
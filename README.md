# XPander RPG Bot 🎮

<div align="center">
  <img src="docs/assets/images/logo.png" alt="XPander RPG Logo" width="200"/>

  [![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Status](https://img.shields.io/badge/status-in%20development-orange.svg)]()
  ![Node Version](https://img.shields.io/badge/node-%3E%3D16.x-brightgreen)
</div>

## 📖 Overview

XPander RPG is a feature-rich Discord bot that transforms your server into an immersive RPG experience. Level up, collect items, battle monsters, and embark on epic quests - all within your Discord server!

![Game Preview](docs/assets/previews/preview.gif)(Soon)
## ✨ Features

### Current Features
- **📊 Leveling System**
  - Gain XP through chat activity
  - Dynamic level progression
  - Level-up notifications

- **💰 Economy System**
  - Daily rewards
  - Currency management
  - Balance checking

- **🏪 Shop System**
  - Multiple item categories
  - Level-based requirements
  - Interactive shop menu

### Coming Soon
- **⚔️ Combat System**
  - PvE battles
  - Boss fights
  - Rewards system

- **🎒 Inventory Management**
  - Equipment system
  - Item usage
  - Trading system

- **🌍 Quest System**
  - Daily quests
  - Story missions
  - Achievement tracking

- **🌐 Web Dashboard**
  - Player statistics
  - Leaderboards
  - Server management

## 🚀 Getting Started

### Prerequisites

```bash
node.js 16.9.0 or higher
npm or yarn
SQLite3
```
### Installation
1. Clone the repository
```bash
git clone https://github.com/mahmutmft/XPander.git
cd XPander
```
2. Install dependencies
```bash
npm install
```
3. Configure environment variables
```bash
cp .env.example .env
```
Add the following to your .env file:
```env
# Your Discord Bot Token (Required)
DISCORD_TOKEN=your_bot_token_here

# Bot Configuration (Optional)
BOT_PREFIX=/
OWNER_ID=your_discord_id

# Database Configuration (Optional)
DB_PATH=src/database/rpg.sqlite

# Development Settings (Optional)
DEBUG=false
DEV_GUILD_ID=your_test_server_id
```
> Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)
4. Start the bot
```bash
npm run start
```

## 📝 Commands

### Core Commands
- `/profile` - View your RPG profile
- `/balance` - Check your coin balance
- `/daily` - Claim daily rewards
- `/help` - List all commands

### Shop Commands
- `/shop` - Browse available items
- `/buy` - Purchase items
- `/inventory` - View your items (coming soon)

### RPG Commands
- `/quest` - Start a quest (coming soon)
- `/battle` - Enter combat (coming soon)
- `/train` - Train your character (coming soon)

## 🎮 Game Mechanics

### Leveling System
![Leveling System](docs/assets/images/leveling.png)
<!-- [Create an infographic showing XP requirements and rewards] -->

- XP gained through messages and activities
- Each level requires progressively more XP
- Unlock new features as you level up

### Economy
- Earn coins through:
  - Daily rewards
  - Quests
  - Battle victories
  - Special events

### Combat (Coming Soon)
![Combat System](docs/assets/images/combat.png)
<!-- [Create a diagram showing combat mechanics] -->

- Turn-based battle system
- Different enemy types
- Strategic item usage
- Team battles

## 🛠️ Development

### Project Structure

```bash
xpander-rpg/
├── src/            # Main bot source code
│   ├── commands/   # Slash commands
│   ├── config/     # Configuration files
│   ├── database/   # Database models (XP, economy, etc.)
│   ├── utils/      # Utility functions (helpers)
│   └── index.js    # Main bot file
├── docs/           # Documentation
├── tests/          # Unit tests
└── web/            # Web dashboard (coming soon)
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📱 Web Dashboard (Planned)

The web dashboard will provide:
- Player statistics and rankings
- Server management tools
- Quest tracking
- Achievement showcase
- Item marketplace

![Dashboard Preview](docs/assets/previews/dashboard.png)(Soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

Join our [Discord server](https://discord.gg/your-invite-link) for:
- Bug reports
- Feature requests
- Community support
- Development updates

## 📊 Roadmap

Check our [project roadmap](docs/CONTEXT.md) for upcoming features and development progress.

---

<div align="center">Made with ❤️
  
[Website](https://mahmutmft.me) [Discord](https://discord.gg/your-invite-link) 
</div>
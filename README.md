# 🤖 GitCord

GitCord is a production-ready Discord bot that integrates GitHub repositories with Discord communities. It serves as a webhook relay, developer community platform, and security monitor.

## 📂 Documentation
- [🚀 Features & Modules](./docs/FEATURES.md) - Deep dive into what GitCord can do.
- [🛠️ Detailed Setup](./docs/SETUP.md) - Step-by-step installation guide.
- [📜 Changelog](./docs/CHANGELOG.md) - Development history and versions.

## 🚀 Quick Start
1. `docker-compose up -d`
2. `npm install`
3. `npx prisma db push`
4. `npm run dev`

## 📋 Commands
- `/register-repo` - Connect a repo to a channel.
- `/list-repos` - See all active connections.
- `/leaderboard` - View top contributors.
- `/showcase` - Share your project.

## 🛡️ Security
GitCord validates all GitHub signatures and scans payloads for leaked credentials automatically.

## 📄 License
ISC

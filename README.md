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

## 📋 Core Commands
- `/register-repo` - Connect a repo to a channel.
- `/list-repos` - See all active connections.
- `/showcase` - Share your project.
- `/profile` - View your developer profile with achievements and stats.
- `/good-first-issues` - Discover beginner-friendly issues by language.
- `/leaderboard` - View rankings (Top Contributors, Trending Repos, Most Starred, etc.).
- `/notification-settings` - Configure engagement notifications and cooldowns.

## 🎯 Phase 5: Complete DevSecOps & AI System

### 🔐 Enhanced Security Monitoring
- **Automatic vulnerability detection**: Exposed API keys, .env leaks, dangerous file changes
- **Severity-based alerts**: CRITICAL, HIGH, MEDIUM, LOW with color-coded Discord embeds
- **Real-time scanning**: All GitHub webhooks scanned automatically
- **Rich security reports**: Detailed findings with remediation guidance

### 🤖 AI System Expansion
- **Multi-provider support**: Gemini (primary) + OpenAI (fallback)
- **6 new AI capabilities**:
  - Commit summarization
  - Changelog generation
  - Project health analysis
  - README quality evaluation
  - Contributor insights
  - Risk analysis
- **Result caching**: 24-hour TTL reduces API costs

### 📦 Release Tracking
- **Automatic release announcements**: GitHub releases auto-posted to Discord
- **Rich embed format**: Version, changelog, download links, GitHub stats
- **Release badges**: STABLE, BETA, RC, PRERELEASE detection
- **Smart routing**: Pinning stable releases, threading for patches

## 🎮 Phase 4: Discovery & Networking (Complete)

### 📊 Advanced Leaderboards
7 leaderboard types: Top Contributors, Trending Repos, Most Starred, Most Active, Repo of the Week, Hall of Fame, Weekly/Monthly/Seasonal rankings. Weighted scoring: commits (1pt) + PRs (5pts) + issues (3pts) + reviews (2pts) + stars (1pt).

### ❤️ Smart Engagement System
- **Like** repositories (❤️, 30-min cooldown)
- **Bookmark** projects (🔖, 1-hour cooldown)
- **Mark as Interested** (👀, 2-hour cooldown)
- **Follow** projects (🔔, 1-hour cooldown)
- **Comment** on showcases (💭, 15-min cooldown)
- Anti-spam cooldowns prevent notification spam

### 🏅 Achievement & Badge System
8-badge achievement system with rarity tiers (COMMON, RARE, EPIC, LEGENDARY). Auto-awarded based on milestones. Displayed on `/profile` with tier progression.

### 📢 Live Activity Feeds
Auto-managed channels:
- `#trending-projects` - Top repos by activity
- `#security-alerts` - DevSecOps findings
- `#weekly-recaps` - Weekly summaries with statistics
- `#new-repositories` - Newly registered repos
- `#good-first-issues` - Beginner opportunities
- `#releases` - Release announcements

## 🛡️ Security
- **Automatic credential scanning**: All GitHub webhooks validated with signature verification
- **Threat detection**: API keys, leaked .env files, suspicious commits, dangerous file changes
- **Severity-based alerts**: CRITICAL 🔴, HIGH 🟠, MEDIUM 🟡, LOW 🔵
- **Production-ready**: Comprehensive error handling and logging

## 🏗️ Architecture
- **TypeScript strict mode** - Full type safety
- **Service-based design** - Modular, extensible architecture
- **Prisma ORM** - PostgreSQL database with migrations
- **Discord.js v14** - Modern Discord bot framework
- **Production-ready** - Tested, scalable, maintainable

## 🚀 Technology Stack
- **Runtime**: Node.js (TypeScript + tsx)
- **Database**: PostgreSQL (Docker + Prisma)
- **Discord**: discord.js v14
- **GitHub**: Octokit + GitHub APIs
- **AI**: Google Gemini + OpenAI (fallback)
- **Code Quality**: ESLint + Prettier (strict)

## 📄 License
ISC

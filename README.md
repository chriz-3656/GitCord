# 🤖 GitCord

GitCord is a Discord bot for GitHub communities. It relays webhooks, showcases projects, tracks contributor reputation, surfaces good first issues, and now ships rich Discord **Components V2** cards for its most important views.

## What’s new

- **Components V2 UI** for showcases, leaderboards, profiles, issue discovery, release announcements, security alerts, repository lists, and notification settings
- **Phase 5 security monitoring** with severity-based alerts
- **AI expansion** with Gemini + OpenAI fallback support
- **Release tracking** with automatic Discord announcements
- **Phase 4 engagement system** with likes, follows, bookmarks, interested tracking, and anti-spam cooldowns

## Documentation

- [Features & Modules](./docs/FEATURES.md)
- [Detailed Setup](./docs/SETUP.md)
- [Changelog](./docs/CHANGELOG.md)

## Quick start

1. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push the Prisma schema:
   ```bash
   npx prisma db push
   ```
4. Start development mode:
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Discord bot token |
| `DISCORD_CLIENT_ID` | Yes | Application client ID |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GITHUB_WEBHOOK_SECRET` | Yes | GitHub webhook signature secret |
| `GITHUB_TOKEN` | Recommended | GitHub API access for releases/issues |
| `GEMINI_API_KEY` | Yes | Gemini AI provider |
| `OPENAI_API_KEY` | Optional | OpenAI fallback provider |
| `PORT` | No | Express server port |

## How to use the bot

### 1. Register a repository
Use `/register-repo` to connect a GitHub repository to a Discord channel.

- Enter the repository as `owner/repo`
- Select the channel that should receive webhook updates
- GitCord stores the webhook secret and uses it to validate GitHub requests

### 2. Send project updates
Use `/showcase` to publish or update a project card.

Recommended fields:
- `repo-full-name` — required `owner/repo`
- `description` — short project summary
- `tech-stack` — e.g. `Node.js, Prisma, Discord.js`
- `status` — Active Development / Looking for Contributors / Beta Testing / Maintenance Mode / Archived
- `banner-url` — optional project banner image
- `request-role` — optional contributor role request

The showcase card includes:
- repository title and description
- GitHub link buttons
- like/follow/interested actions
- project metadata and banner imagery when available

### 3. Discover contributors and projects
- `/leaderboard` shows ranked views like top contributors, trending repositories, most starred projects, repo of the week, and category rankings
- `/profile` shows reputation, contributions, badges, and tier progress
- `/good-first-issues` finds beginner-friendly issues from registered repositories or by language

### 4. Configure notifications
Use `/notification-settings` to control how GitCord pings you.

Available options:
- silent mode
- release notifications
- mention notifications

This works with the anti-spam cooldown system so repeat interactions stay quiet when needed.

### 5. Follow projects naturally
Project cards now include built-in interaction buttons:
- Like
- Follow
- Interested

These feed the engagement system and power repository stats, leaderboards, and notifications.

## Command reference

| Command | Purpose |
| --- | --- |
| `/register-repo` | Register a repository and webhook channel |
| `/list-repos` | Show repositories registered in the server |
| `/remove-repo` | Remove a repository registration |
| `/showcase` | Publish/update a project showcase card |
| `/profile` | View contributor profile, tier, badges, and stats |
| `/leaderboard` | View contributor/repository rankings |
| `/good-first-issues` | Find beginner-friendly issues |
| `/notification-settings` | Manage your notification preferences |

## Automatic bot features

### Security monitoring
GitCord scans webhook payloads for:
- exposed API keys
- leaked `.env` files
- private keys
- database connection strings
- dangerous file changes
- suspicious commits and force pushes

Alerts are severity-tagged:
- **CRITICAL**
- **HIGH**
- **MEDIUM**
- **LOW**

### AI analysis
GitCord can generate:
- PR summaries
- commit summaries
- changelog snippets
- project health analysis
- README analysis
- contributor insights
- risk analysis

### Release tracking
GitHub release webhooks are tracked and announced automatically with:
- version tag
- changelog
- download links
- release type badges
- stable release pinning and discussion threads

### Live feeds
Common feed channels include:
- `#trending-projects`
- `#security-alerts`
- `#weekly-recaps`
- `#new-repositories`
- `#good-first-issues`
- `#releases`

## Discord UI

GitCord now uses **Discord Components V2** for its major message surfaces.

That means:
- container-based cards
- text display blocks
- separators and sections
- thumbnails and media galleries
- clickable button rows

Legacy embeds are kept only where compatibility is still useful.

## Development commands

```bash
npm run dev
npm run build
npm run lint
npm run format
npx prisma db push
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Bot does not start | Check `DISCORD_TOKEN` and `DATABASE_URL` |
| Webhooks fail | Verify `GITHUB_WEBHOOK_SECRET` and repo webhook config |
| No releases/alerts | Ensure the repo is registered and the target Discord channels exist |
| AI features fail | Confirm `GEMINI_API_KEY` or `OPENAI_API_KEY` is set |
| Empty issue search | Make sure the server has registered repositories |

## License

ISC

# Copilot Instructions for GitCord

## Build, Test, and Lint Commands

### Development
- `npm run dev` - Start development server with hot reload using tsx watch on `src/index.ts`
- `npm run build` - Compile TypeScript to `dist/`
- `npm start` - Run the production build from `dist/index.js`

### Database
- `npx prisma db push` - Sync database schema with PostgreSQL (run after schema changes)
- `npm run prisma:migrate` - Create and apply database migrations
- `npm run prisma:generate` - Generate Prisma client (run after schema changes)

### Code Quality
- `npm run lint` - Run ESLint on all TypeScript files in src/
- `npm run format` - Format code with Prettier (runs on `src/**/*.ts`)

### Infrastructure
- `docker-compose up -d` - Start PostgreSQL database container

## High-Level Architecture

GitCord is a Discord bot that bridges GitHub repositories with Discord communities. It operates as a webhook relay, community platform, and security monitor.

### Core Flow
1. **GitHub Webhooks** → Express server validates signatures → processes events
2. **Discord Commands** → CommandHandler routes to command executors → Database operations
3. **Database Layer** → Prisma models manage Guild, Repository, Contributor, and interaction data
4. **Discord Outputs** → EmbedService formats rich Discord embeds → sends to channels

### Key Directories
- `/bot` - CommandHandler manages slash command registration and routing
- `/commands` - Individual command modules (register-repo, leaderboard, showcase, profile, etc.)
- `/webhooks` - GitHub event handlers and Zod schemas for Push, PullRequest, Issues, Star events
- `/database` - Repository, Contributor, and Engagement services using Prisma ORM
- `/discord` - EmbedService formats rich Discord messages
- `/security` - GitHub signature verification and credential scanning
- `/services` - AIService (Gemini API integration) and utility services
- `/github` - GitHubClient for Octokit integration
- `/events` - Discord event listeners (message reactions, interactions)

### Data Model
- **Guild** - Discord server with many Repositories
- **Repository** - GitHub repo linked to a Discord channel with showcase metadata
- **Contributor** - Discord user with stats (commits, PRs, issues, reputation)
- **ProjectInteraction** - Engagement tracking (likes, bookmarks, interested)
- **ProjectFollower** - Contributors following a repository
- **ShowcaseComment** - Community comments on repository showcases
- **Achievement** - Badges awarded to contributors
- **ProjectAnalytics** - Daily event, star, and fork counts

## Key Conventions

### TypeScript & Typing
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Path alias `@/*` maps to `src/*` for imports
- Target ES2022 with NodeNext module resolution
- Use explicit types; avoid `any` (linted as warn)

### Code Formatting
- **Prettier config**: semicolons, trailing commas, single quotes, 100-char line width, 2-space tabs
- **ESLint setup**: TypeScript parser with recommended rules + Prettier integration
- Unused variables must be prefixed with underscore (e.g., `_unused`) to pass lint
- All formatting is enforced; `prettier/prettier` is an ESLint error

### Command Pattern
Commands are objects with two properties:
- `data` - `SlashCommandBuilder` defining the command name, description, options, and permissions
- `execute(interaction)` - Async function handling the interaction
- Commands are registered in `CommandHandler` constructor and look up via `Collection`

### Logging & Errors
- Use `pino` with `pino-pretty` transport for colored console output
- Initialize logger in main files with transport configuration
- Log important operations (command executions, webhook events, database changes)

### Database Access
- All database operations go through Prisma services (`RepositoryService`, `ContributorService`, `EngagementService`)
- Initialize Prisma with `import { prisma } from './database/prisma.js'`
- Run migrations or schema pushes immediately after schema.prisma changes

### Webhook & Security
- GitHub webhooks verified using `verifyGithubSignature()` before processing
- Event payloads validated with Zod schemas (`PushEventSchema`, `PullRequestEventSchema`, etc.)
- Security service scans payloads for leaked credentials (tokens, API keys, secrets)
- All webhook routes require verification; return 401 if signature invalid

### Environment
- Requires: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DATABASE_URL`, `GEMINI_API_KEY`, `GITHUB_WEBHOOK_SECRET`
- Load with `dotenv/config` at entry point (`src/index.ts`)
- PostgreSQL runs in Docker; connection string set via `.env`

### Validation
- Use Zod for schema validation throughout (event schemas, Discord command inputs)
- Discord.js provides built-in interaction validation; Zod used for complex event payloads
- Always validate external inputs (GitHub webhooks, user commands)

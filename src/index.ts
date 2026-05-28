import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, TextChannel, Interaction } from 'discord.js';
import pino from 'pino';
import { verifyGithubSignature } from './security/github-verifier.js';
import {
  PushEventSchema,
  PullRequestEventSchema,
  IssuesEventSchema,
  StarEventSchema,
} from './webhooks/schemas.js';
import { EmbedService } from './discord/embed-service.js';
import { CommandHandler } from './bot/command-handler.js';
import { RepositoryService } from './database/repository-service.js';
import { ContributorService } from './database/contributor-service.js';
import { SecurityService } from './security/security-service.js';
import { AIService } from './services/ai-service.js';
import { prisma } from './database/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = (pino as any)({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commandHandler = new CommandHandler();

// Middleware to capture raw body for signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);

// Serve static files for the dashboard
app.use(express.static(path.join(__dirname, '../public')));

// API Routes for Dashboard
app.get('/api/repositories', async (req, res) => {
  try {
    const repos = await prisma.repository.findMany();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await ContributorService.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Webhook Route
app.post('/webhooks/github', async (req: any, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const event = req.headers['x-github-event'] as string;

  // Initial parse to get repository name for secret lookup
  const payload = req.body;
  const repoFullName = payload?.repository?.full_name;

  if (!repoFullName) {
    logger.warn('Webhook payload missing repository full_name');
    return res.status(400).send('Invalid payload');
  }

  const repoConfig = await RepositoryService.getRepositoryByFullName(repoFullName);

  if (!repoConfig) {
    logger.warn(`Repository ${repoFullName} not registered`);
    return res.status(404).send('Repository not registered');
  }

  if (!verifyGithubSignature(req.rawBody, signature, repoConfig.webhookSecret)) {
    logger.warn(`Invalid GitHub webhook signature for ${repoFullName}`);
    return res.status(401).send('Invalid signature');
  }

  logger.info(`Received GitHub event: ${event} for ${repoFullName}`);

  try {
    let embed;
    const channel = (await client.channels.fetch(repoConfig.channelId)) as TextChannel;

    // Security Scanning
    const rawPayloadString = JSON.stringify(req.body);
    const securityAlerts = SecurityService.scanPayload(rawPayloadString);
    const suspiciousActivity = SecurityService.isSuspiciousActivity(req.body, event);

    if (securityAlerts.length > 0 || suspiciousActivity) {
      const securityEmbed = SecurityService.createSecurityAlertEmbed(
        repoFullName,
        securityAlerts.length > 0 ? securityAlerts : [suspiciousActivity!],
        req.body.sender?.login || 'Unknown',
      );
      await channel.send({ embeds: [securityEmbed] });
      logger.warn(`Security alert triggered for ${repoFullName}`);
    }

    switch (event) {
      case 'push': {
        const data = PushEventSchema.parse(req.body);
        embed = EmbedService.createPushEmbed(data);
        // Track stats
        await ContributorService.updateStats({
          username: data.pusher.name,
          type: 'commit',
        });
        break;
      }
      case 'pull_request': {
        const data = PullRequestEventSchema.parse(req.body);
        const aiSummary = await AIService.summarizePR(
          data.pull_request.title,
          data.pull_request.body || '',
        );
        embed = EmbedService.createPREmbed(data, aiSummary);
        // Track stats
        await ContributorService.updateStats({
          username: data.pull_request.user.login,
          avatarUrl: data.pull_request.user.avatar_url,
          type: 'pr',
        });
        break;
      }
      case 'issues': {
        const data = IssuesEventSchema.parse(req.body);
        const aiAnalysis = await AIService.analyzeIssue(
          data.issue.title,
          data.issue.body || '',
        );
        embed = EmbedService.createIssueEmbed(data, aiAnalysis);
        // Track stats
        await ContributorService.updateStats({
          username: data.issue.user.login,
          avatarUrl: data.issue.user.avatar_url,
          type: 'issue',
        });
        break;
      }
      case 'star': {
        const data = StarEventSchema.parse(req.body);
        embed = EmbedService.createStarEmbed(data);
        // Track stats
        await ContributorService.updateStats({
          username: data.sender.login,
          avatarUrl: data.sender.avatar_url,
          type: 'star',
        });
        break;
      }
      default:
        logger.info(`Unhandled event type: ${event}`);
    }

    if (embed && channel) {
      await channel.send({ embeds: [embed] });
      logger.info(`Relayed ${event} event to Discord channel ${repoConfig.channelId}`);
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(400).send('Invalid payload');
  }
});

// Discord Bot Events
client.once('ready', async () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
  await commandHandler.registerCommands();
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await commandHandler.handleInteraction(interaction);
});

// Start application
const start = async () => {
  try {
    // Start Express server
    app.listen(port, () => {
      logger.info(`Webhook server is listening on port ${port}`);
    });

    // Start Discord bot
    if (process.env.DISCORD_TOKEN) {
      await client.login(process.env.DISCORD_TOKEN);
    } else {
      logger.warn('DISCORD_TOKEN not found, bot will not start');
    }
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};

start();

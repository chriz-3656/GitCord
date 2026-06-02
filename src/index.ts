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
import { CommandHandler } from './bot/command-handler.js';
import { RepositoryService } from './database/repository-service.js';
import { ContributorService } from './database/contributor-service.js';
import { SecurityService } from './security/security-service.js';
import { SecurityAlertService } from './services/security-alert-service.js';
import { AIService } from './services/ai-service.js';
import { ReleaseService } from './services/release-service.js';
import { prisma } from './database/prisma.js';
import { CardFactory, type ComponentsV2Reply } from './discord/ui/cards.js';

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

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/status', (_req, res) => {
  res.redirect('/#live');
});

app.get('/profile', (_req, res) => {
  res.redirect('/#features');
});

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

app.get('/api/site-meta', (_req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const inviteUrl = clientId
    ? `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
    : null;

  res.json({
    inviteUrl,
    dashboardUrl: '/dashboard',
    profileUrl: '/profile',
    botStatus: client.isReady() ? 'ONLINE' : 'STARTING',
    botName: client.user?.username || 'GitCord',
  });
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
    let outgoingMessage: ComponentsV2Reply | null = null;
    const channel = (await client.channels.fetch(repoConfig.channelId)) as TextChannel;
    let outgoingChannel: TextChannel = channel;
    let releaseHandled = false;

    // Enhanced Security Scanning
    const rawPayloadString = JSON.stringify(req.body);

    // Extract commits and changed files from the event
    let commits = [];
    let changedFiles = [];

    if (event === 'push') {
      commits = req.body.commits || [];
      changedFiles = [];
      // Collect all changed files from commits
      if (commits) {
        for (const commit of commits) {
          changedFiles.push(
            ...(commit.added || []),
            ...(commit.modified || []),
            ...(commit.removed || []),
          );
        }
      }
    }

    // Detect security issues
    const securityIssues = SecurityService.detectSecurityIssues(
      rawPayloadString,
      commits,
      changedFiles,
    );
    const suspiciousActivity = SecurityService.isSuspiciousActivity(req.body, event);

    // Combine all issues
    const allIssues = [...securityIssues, ...(suspiciousActivity ? [suspiciousActivity] : [])];

    // Send security alerts if issues found
    if (allIssues.length > 0) {
      // Send security alerts to the main channel or security-alerts channel if available
      let securityChannel = channel;
      try {
        // Try to find a security-alerts channel
        const guild = channel.guild;
        const securityAlerts = guild.channels.cache.find(
          (ch) => ch.isTextBased() && ch.name === 'security-alerts',
        );
        if (securityAlerts) {
          securityChannel = securityAlerts as TextChannel;
        }
      } catch (e) {
        // If we can't find security-alerts channel, use the main channel
      }

      await securityChannel.send(
        SecurityAlertService.createSecurityAlertCard(
          repoFullName,
          allIssues,
          req.body.sender?.login || req.body.pusher?.name || 'Unknown',
          event === 'push' ? req.body.commits?.[0]?.id : undefined,
        ),
      );
      logger.warn(
        `Security alert triggered for ${repoFullName}: ${allIssues.length} issue(s) found`,
      );
    }

    switch (event) {
      case 'push': {
        const data = PushEventSchema.parse(req.body);
        outgoingMessage = CardFactory.createPushCard({
          repoName: data.repository.full_name,
          branch: data.ref.split('/').pop() || data.ref,
          compareUrl: data.compare,
          commits: data.commits.map((commit) => ({
            id: commit.id,
            url: commit.url,
            message: commit.message,
          })),
          pusher: data.pusher.name,
        });
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
        outgoingMessage = CardFactory.createPRCard({
          action: data.action,
          number: data.number,
          title: data.pull_request.title,
          url: data.pull_request.html_url,
          author: data.pull_request.user.login,
          avatarUrl: data.pull_request.user.avatar_url,
          body: data.pull_request.body,
          aiSummary,
        });
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
        const aiAnalysis = await AIService.analyzeIssue(data.issue.title, data.issue.body || '');
        outgoingMessage = CardFactory.createIssueEventCard({
          action: data.action,
          title: data.issue.title,
          url: data.issue.html_url,
          author: data.issue.user.login,
          avatarUrl: data.issue.user.avatar_url,
          labels: data.issue.labels.map((label) => label.name),
          body: data.issue.body,
          aiAnalysis,
        });
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
        outgoingMessage = CardFactory.createStarCard({
          repoName: data.repository.full_name,
          url: data.repository.html_url,
          starrer: data.sender.login,
          avatarUrl: data.sender.avatar_url,
        });
        // Track stats
        await ContributorService.updateStats({
          username: data.sender.login,
          avatarUrl: data.sender.avatar_url,
          type: 'star',
        });
        break;
      }
      case 'release': {
        const releaseData = await ReleaseService.parseReleaseWebhook(req.body);
        
        if (releaseData) {
          // Track release in database
          await ReleaseService.trackRelease(releaseData);
          
          // Generate announcement embed
          outgoingMessage = ReleaseService.generateReleaseAnnouncementCard(releaseData);
          
          // Try to find and post to releases channel
          try {
            const guild = channel.guild;
            const releaseType = ReleaseService['determineReleaseType'](
              releaseData.version,
              releaseData.isPrerelease,
            );
            const targetChannelName = ReleaseService['determineReleaseChannel'](
              releaseType,
              releaseData.isDraft,
            );
            
            const releaseChannel = guild.channels.cache.find(
              (ch) => ch.isTextBased() && ch.name === targetChannelName,
            );
            
            if (releaseChannel) {
              outgoingChannel = releaseChannel as TextChannel;
              const releaseMsg = await outgoingChannel.send(outgoingMessage);
              releaseHandled = true;
              outgoingMessage = null;
              
              // Pin stable releases
              if (ReleaseService['shouldPinRelease'](releaseType)) {
                try {
                  await releaseMsg.pin();
                  logger.info(`Pinned stable release: ${releaseData.version}`);
                } catch (pinError) {
                  logger.warn(`Could not pin release message: ${(pinError as any).message}`);
                }
              }
              
              // Create thread for stable releases
              if (ReleaseService['shouldCreateThread'](releaseType)) {
                try {
                  await releaseMsg.startThread({
                    name: `📝 Discussion: ${releaseData.version}`,
                    autoArchiveDuration: 1440, // 24 hours
                  });
                  logger.info(`Created discussion thread for release: ${releaseData.version}`);
                } catch (threadError) {
                  logger.warn(`Could not create thread: ${(threadError as any).message}`);
                }
              }
              
              logger.info(`Posted release announcement to ${targetChannelName}`);
            } else {
              // Post to main channel if target channel not found
              outgoingChannel = channel;
              logger.info(`Release channel ${targetChannelName} not found, posted to main channel`);
            }
          } catch (channelError) {
            // Fallback to main channel
            outgoingChannel = channel;
            logger.info(`Error finding release channel, posted to main channel`);
          }
        }
        break;
      }
      default:
        logger.info(`Unhandled event type: ${event}`);
    }

    if (outgoingMessage && outgoingChannel && !releaseHandled) {
      await outgoingChannel.send(outgoingMessage);
      logger.info(`Relayed ${event} event to Discord channel ${outgoingChannel.id}`);
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

import { EngagementService } from './database/engagement-service.js';

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    await commandHandler.handleInteraction(interaction);
    return;
  }

  if (interaction.isButton()) {
    const [action, repoId] = interaction.customId.split('_');
    const user = interaction.user;

    // Get or create contributor
    const contributor = await ContributorService.getOrCreateByDiscordId(
      user.id,
      user.username,
      user.displayAvatarURL(),
    );

    try {
      if (action === 'like') {
        const result = await EngagementService.toggleLike(repoId, contributor.id);
        await interaction.reply({
          content: result.action === 'added' ? '❤️ You liked this project!' : '💔 Removed like.',
          ephemeral: true,
        });
      } else if (action === 'follow') {
        const result = await EngagementService.toggleFollow(repoId, contributor.id);
        await interaction.reply({
          content:
            result.action === 'added' ? '🔔 You are now following this project!' : '🔕 Unfollowed.',
          ephemeral: true,
        });
      } else if (action === 'interest') {
        await interaction.reply({
          content: '🤝 Your interest has been noted! The owner will be notified.',
          ephemeral: true,
        });
        // Phase 2: Smart Notification logic would go here
      }
    } catch (error) {
      logger.error('Button interaction error:', error);
      await interaction.reply({ content: '❌ Failed to process interaction.', ephemeral: true });
    }
  }
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

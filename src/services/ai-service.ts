import { PrismaClient } from '@prisma/client';
import {
  GeminiProvider,
  OpenAIProvider,
  AIProviderFactory,
} from './ai-provider-service.js';
import { AIResultCache } from './cache-service.js';

const prisma = new PrismaClient();

export class AIService {
  private static providerFactory: AIProviderFactory | null = null;

  static initialize(): void {
    const geminiProvider = new GeminiProvider(process.env.GEMINI_API_KEY);
    const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);

    this.providerFactory = new AIProviderFactory(geminiProvider, openaiProvider);
  }

  private static ensureInitialized(): void {
    if (!this.providerFactory) {
      this.initialize();
    }
  }

  private static async generateWithCache(
    type: string,
    content: string,
    promptGenerator: () => string
  ): Promise<string | null> {
    try {
      this.ensureInitialized();

      const cacheKey = AIResultCache.generateCacheKey(type, content);
      const cached = await AIResultCache.get(cacheKey);

      if (cached) {
        console.log(`Cache hit for ${type}`);
        return cached;
      }

      const prompt = promptGenerator();
      const result = await this.providerFactory!.generateContent(prompt);

      const providerName = this.providerFactory!.getPrimaryProviderName();
      await AIResultCache.set(cacheKey, type, result, providerName);

      return result;
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      return null;
    }
  }

  static async summarizePR(
    title: string,
    body: string
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    return this.generateWithCache(
      'pr_summary',
      `${title}:${body}`,
      () => `Summarize this GitHub Pull Request in 2 sentences. 
       Title: ${title}
       Description: ${body}`
    );
  }

  static async analyzeIssue(
    title: string,
    body: string
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    return this.generateWithCache(
      'issue_analysis',
      `${title}:${body}`,
      () => `Analyze this GitHub Issue and suggest a potential fix or next step in 2 sentences.
       Title: ${title}
       Description: ${body}`
    );
  }

  static async commitSummarization(
    commitMessage: string,
    commitDiff: string
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    return this.generateWithCache(
      'commit_summary',
      `${commitMessage}:${commitDiff}`,
      () => `Summarize this git commit in 2 sentences focusing on the impact.
       Commit Message: ${commitMessage}
       Diff Summary: ${commitDiff.substring(0, 500)}`
    );
  }

  static async changelogGeneration(
    commits: Array<{ message: string; author: string; date: string }>,
    version: string
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    const commitSummary = commits
      .map((c) => `- ${c.message} (by ${c.author})`)
      .join('\n');

    return this.generateWithCache(
      'changelog',
      commitSummary,
      () => `Generate a professional changelog entry for version ${version} based on these commits:
       ${commitSummary}
       
       Format it as a changelog entry with sections like Added, Changed, Fixed.`
    );
  }

  static async projectHealthAnalysis(
    repoStats: {
      stars: number;
      forks: number;
      openIssues: number;
      openPRs: number;
      lastCommit: string;
      contributors: number;
    }
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    const stats = JSON.stringify(repoStats);

    return this.generateWithCache(
      'project_health',
      stats,
      () => `Analyze the health of a GitHub project based on these metrics:
       Stars: ${repoStats.stars}
       Forks: ${repoStats.forks}
       Open Issues: ${repoStats.openIssues}
       Open PRs: ${repoStats.openPRs}
       Last Commit: ${repoStats.lastCommit}
       Contributors: ${repoStats.contributors}
       
       Provide a brief health assessment with recommendations.`
    );
  }

  static async readmeAnalysis(readmeContent: string): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    return this.generateWithCache(
      'readme_analysis',
      readmeContent,
      () => `Analyze this README for quality and completeness. Provide suggestions for improvement:
       
       ${readmeContent.substring(0, 2000)}
       
       Consider sections like: installation, usage, contributing, license, features.`
    );
  }

  static async contributorInsights(
    contributors: Array<{
      username: string;
      commits: number;
      prs: number;
      issues: number;
    }>
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    const summary = contributors
      .slice(0, 10)
      .map(
        (c) =>
          `${c.username}: ${c.commits} commits, ${c.prs} PRs, ${c.issues} issues`
      )
      .join('\n');

    return this.generateWithCache(
      'contributor_insights',
      summary,
      () => `Analyze these top contributors and provide insights about team composition:
       
       ${summary}
       
       Include observations about specialization, activity patterns, and team health.`
    );
  }

  static async riskAnalysis(
    changeDetails: {
      filesChanged: number;
      linesAdded: number;
      linesRemoved: number;
      changedFiles: string[];
      description: string;
    }
  ): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return null;
    }

    const summary = JSON.stringify(changeDetails);

    return this.generateWithCache(
      'risk_analysis',
      summary,
      () => `Analyze the risk level of this code change:
       Files Changed: ${changeDetails.filesChanged}
       Lines Added: ${changeDetails.linesAdded}
       Lines Removed: ${changeDetails.linesRemoved}
       Changed Files: ${changeDetails.changedFiles.join(', ')}
       Description: ${changeDetails.description}
       
       Provide a risk assessment (Low/Medium/High) with reasoning.`
    );
  }
}

AIService.initialize();

void prisma;

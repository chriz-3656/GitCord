import { Octokit } from 'octokit';
export class IssueService {
    static octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
    /**
     * Fetch good-first-issues from a repository
     */
    static async getGoodFirstIssues(owner, repo, limit = 10) {
        try {
            const response = await this.octokit.rest.issues.listForRepo({
                owner,
                repo,
                labels: 'good-first-issue,good-first-bug,beginner-friendly,help-wanted',
                state: 'open',
                per_page: limit,
            });
            return response.data
                .filter((issue) => !issue.pull_request) // Exclude PRs
                .map((issue) => this.parseIssue(issue));
        }
        catch (error) {
            console.error(`Error fetching issues for ${owner}/${repo}:`, error);
            return [];
        }
    }
    /**
     * Fetch beginner-friendly issues across multiple repos
     */
    static async getBeginnerFriendlyIssues(repos, limit = 10) {
        const allIssues = [];
        for (const repo of repos) {
            const issues = await this.getGoodFirstIssues(repo.owner, repo.name, Math.ceil(limit / repos.length));
            allIssues.push(...issues);
        }
        // Sort by difficulty and return top N
        return allIssues.sort((a, b) => (a.difficulty === 'beginner' ? -1 : 1)).slice(0, limit);
    }
    /**
     * Detect issue difficulty
     */
    static detectDifficulty(issue) {
        const labels = issue.labels.map((l) => l.name.toLowerCase());
        const body = issue.body?.toLowerCase() || '';
        // Check labels for difficulty indicators
        if (labels.some((l) => ['good-first-issue', 'good-first-bug', 'beginner', 'easy'].includes(l))) {
            return 'beginner';
        }
        if (labels.some((l) => ['intermediate', 'medium'].includes(l))) {
            return 'intermediate';
        }
        if (labels.some((l) => ['advanced', 'hard', 'difficult'].includes(l))) {
            return 'advanced';
        }
        // Heuristic: short descriptions are usually easier
        if (body.length < 200)
            return 'beginner';
        if (body.length > 500)
            return 'advanced';
        return 'intermediate';
    }
    /**
     * Extract required skills from issue
     */
    static extractSkills(issue) {
        const skills = new Set();
        const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
        const skillKeywords = {
            TypeScript: ['typescript', 'ts', '.ts'],
            JavaScript: ['javascript', 'js', 'node'],
            Python: ['python', 'py', 'django', 'flask'],
            React: ['react', 'jsx'],
            Vue: ['vue', 'vuejs'],
            Database: ['database', 'sql', 'postgres', 'mongodb', 'redis'],
            API: ['api', 'rest', 'graphql'],
            Testing: ['test', 'jest', 'mocha'],
            DevOps: ['docker', 'kubernetes', 'ci/cd', 'aws'],
            Security: ['security', 'auth', 'encryption'],
        };
        for (const [skill, keywords] of Object.entries(skillKeywords)) {
            if (keywords.some((kw) => text.includes(kw))) {
                skills.add(skill);
            }
        }
        return Array.from(skills);
    }
    /**
     * Parse GitHub issue to standard format
     */
    static parseIssue(issue) {
        return {
            number: issue.number,
            title: issue.title,
            url: issue.html_url,
            body: issue.body || '',
            labels: issue.labels.map((l) => l.name),
            difficulty: this.detectDifficulty(issue),
            requiredSkills: this.extractSkills(issue),
        };
    }
    /**
     * Search issues by language
     */
    static async searchIssuesByLanguage(language, limit = 10) {
        try {
            const query = `language:${language} label:"good-first-issue" state:open`;
            const response = await this.octokit.rest.search.issuesAndPullRequests({
                q: query,
                per_page: limit,
            });
            return response.data.items
                .filter((item) => !item.pull_request)
                .map((item) => this.parseIssue(item));
        }
        catch (error) {
            console.error(`Error searching for ${language} issues:`, error);
            return [];
        }
    }
    /**
     * Get trending open issues (recently updated)
     */
    static async getTrendingIssues(limit = 10) {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const date = oneWeekAgo.toISOString().split('T')[0];
            const query = `label:"good-first-issue" state:open updated:>=${date}`;
            const response = await this.octokit.rest.search.issuesAndPullRequests({
                q: query,
                sort: 'updated',
                per_page: limit,
            });
            return response.data.items
                .filter((item) => !item.pull_request)
                .map((item) => this.parseIssue(item));
        }
        catch (error) {
            console.error('Error fetching trending issues:', error);
            return [];
        }
    }
    /**
     * Get issue details with full analysis
     */
    static async getIssueDetails(owner, repo, issueNumber) {
        try {
            const response = await this.octokit.rest.issues.get({
                owner,
                repo,
                issue_number: issueNumber,
            });
            const issue = response.data;
            return {
                number: issue.number,
                title: issue.title,
                body: issue.body,
                url: issue.html_url,
                repo: `${owner}/${repo}`,
                difficulty: this.detectDifficulty(issue),
                skills: this.extractSkills(issue),
                labels: issue.labels.map((l) => l.name),
                author: issue.user?.login,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                comments: issue.comments,
                reactions: issue.reactions,
            };
        }
        catch (error) {
            console.error(`Error fetching issue #${issueNumber}:`, error);
            return null;
        }
    }
}
//# sourceMappingURL=issue-service.js.map
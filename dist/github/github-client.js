import { Octokit } from 'octokit';
export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});
export class GitHubService {
    static async getRepoStats(owner, repo) {
        const { data } = await octokit.rest.repos.get({
            owner,
            repo,
        });
        return data;
    }
    static async getUserInfo(username) {
        const { data } = await octokit.rest.users.getByUsername({
            username,
        });
        return data;
    }
}
//# sourceMappingURL=github-client.js.map
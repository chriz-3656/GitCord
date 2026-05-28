import { Octokit } from 'octokit';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export class GitHubService {
  static async getRepoStats(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  }

  static async getUserInfo(username: string) {
    const { data } = await octokit.rest.users.getByUsername({
      username,
    });
    return data;
  }
}

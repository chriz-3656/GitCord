export declare class ContributorService {
    static updateStats(data: {
        username: string;
        avatarUrl?: string;
        type: 'commit' | 'pr' | 'issue' | 'star';
    }): Promise<any>;
    static getLeaderboard(): Promise<any>;
}

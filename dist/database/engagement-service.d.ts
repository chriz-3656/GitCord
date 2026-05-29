interface InteractionResult {
    action: 'added' | 'removed';
    shouldNotify: boolean;
    cooldownRemainingSecs?: number;
}
export declare class EngagementService {
    /**
     * Toggle like with notification check
     */
    static toggleLike(repositoryId: string, contributorId: string): Promise<InteractionResult>;
    /**
     * Toggle follow with notification check
     */
    static toggleFollow(repositoryId: string, contributorId: string): Promise<InteractionResult>;
    /**
     * Add comment with notification check
     */
    static addComment(repositoryId: string, contributorId: string, content: string): Promise<{
        comment: any;
        shouldNotify: boolean;
    }>;
    /**
     * Get interaction stats for a repository
     */
    static getInteractionStats(repositoryId: string): Promise<{
        likes: number;
        followers: number;
        comments: number;
    }>;
    /**
     * Get analytics for a repository
     */
    static getAnalytics(repositoryId: string): Promise<{
        date: Date;
        id: string;
        repositoryId: string;
        eventCount: number;
        starCount: number;
        forkCount: number;
    }[]>;
}
export {};

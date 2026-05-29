interface InteractionStats {
    likes: number;
    followers: number;
    interested: number;
    comments: number;
    totalEngagement: number;
}
interface UserInteractions {
    likes: string[];
    followers: string[];
    interested: string[];
}
export declare class InteractionService {
    /**
     * Add or remove a like
     */
    static toggleLike(repositoryId: string, contributorId: string): Promise<{
        action: 'added' | 'removed';
        shouldNotify: boolean;
    }>;
    /**
     * Add or remove a bookmark
     */
    static toggleBookmark(repositoryId: string, contributorId: string): Promise<{
        action: 'added' | 'removed';
        shouldNotify: boolean;
    }>;
    /**
     * Add or remove "interested" marker
     */
    static toggleInterested(repositoryId: string, contributorId: string): Promise<{
        action: 'added' | 'removed';
        shouldNotify: boolean;
    }>;
    /**
     * Add or remove follow
     */
    static toggleFollow(repositoryId: string, contributorId: string): Promise<{
        action: 'added' | 'removed';
        shouldNotify: boolean;
    }>;
    /**
     * Add a comment
     */
    static addComment(repositoryId: string, contributorId: string, content: string): Promise<{
        comment: any;
        shouldNotify: boolean;
    }>;
    /**
     * Get engagement stats for a repository
     */
    static getRepositoryStats(repositoryId: string): Promise<InteractionStats>;
    /**
     * Get user's interactions
     */
    static getUserInteractions(contributorId: string): Promise<UserInteractions>;
    /**
     * Check if user has interacted in a specific way
     */
    static hasInteraction(repositoryId: string, contributorId: string, type: 'LIKE' | 'BOOKMARK' | 'INTERESTED' | 'FOLLOW'): Promise<boolean>;
    /**
     * Get recent interactions for a repository
     */
    static getRecentInteractions(repositoryId: string, limit?: number): Promise<{
        interactions: ({
            contributor: {
                username: string;
                avatarUrl: string | null;
            };
        } & {
            type: string;
            id: string;
            contributorId: string;
            repositoryId: string;
            createdAt: Date;
        })[];
        followers: ({
            contributor: {
                username: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            contributorId: string;
            repositoryId: string;
            createdAt: Date;
        })[];
    }>;
    /**
     * Get top interested contributors for a repository
     */
    static getInterestedContributors(repositoryId: string, limit?: number): Promise<{
        id: string;
        username: string;
        avatarUrl: string | null;
        reputation: number;
    }[]>;
}
export {};

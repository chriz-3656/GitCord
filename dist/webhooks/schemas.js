import { z } from 'zod';
const UserSchema = z.object({
    login: z.string(),
    avatar_url: z.string().url(),
    html_url: z.string().url(),
});
const RepositorySchema = z.object({
    name: z.string(),
    full_name: z.string(),
    html_url: z.string().url(),
});
// Push Event
export const PushEventSchema = z.object({
    ref: z.string(),
    pusher: z.object({
        name: z.string(),
        email: z.string().optional(),
    }),
    repository: RepositorySchema,
    commits: z.array(z.object({
        id: z.string(),
        message: z.string(),
        url: z.string().url(),
        author: z.object({
            name: z.string(),
            username: z.string().optional(),
        }),
    })),
    compare: z.string().url(),
});
// Pull Request Event
export const PullRequestEventSchema = z.object({
    action: z.string(),
    number: z.number(),
    pull_request: z.object({
        title: z.string(),
        user: UserSchema,
        html_url: z.string().url(),
        body: z.string().nullable(),
        merged: z.boolean().optional(),
    }),
    repository: RepositorySchema,
});
// Issues Event
export const IssuesEventSchema = z.object({
    action: z.string(),
    issue: z.object({
        title: z.string(),
        user: UserSchema,
        html_url: z.string().url(),
        body: z.string().nullable(),
        labels: z.array(z.object({ name: z.string() })),
    }),
    repository: RepositorySchema,
});
// Star Event
export const StarEventSchema = z.object({
    action: z.string(),
    sender: UserSchema,
    repository: RepositorySchema,
});
//# sourceMappingURL=schemas.js.map
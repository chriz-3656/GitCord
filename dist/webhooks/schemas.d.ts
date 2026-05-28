import { z } from 'zod';
export declare const PushEventSchema: z.ZodObject<{
    ref: z.ZodString;
    pusher: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email?: string | undefined;
    }, {
        name: string;
        email?: string | undefined;
    }>;
    repository: z.ZodObject<{
        name: z.ZodString;
        full_name: z.ZodString;
        html_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        html_url: string;
        name: string;
        full_name: string;
    }, {
        html_url: string;
        name: string;
        full_name: string;
    }>;
    commits: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        message: z.ZodString;
        url: z.ZodString;
        author: z.ZodObject<{
            name: z.ZodString;
            username: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            username?: string | undefined;
        }, {
            name: string;
            username?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        id: string;
        url: string;
        author: {
            name: string;
            username?: string | undefined;
        };
    }, {
        message: string;
        id: string;
        url: string;
        author: {
            name: string;
            username?: string | undefined;
        };
    }>, "many">;
    compare: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ref: string;
    pusher: {
        name: string;
        email?: string | undefined;
    };
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    commits: {
        message: string;
        id: string;
        url: string;
        author: {
            name: string;
            username?: string | undefined;
        };
    }[];
    compare: string;
}, {
    ref: string;
    pusher: {
        name: string;
        email?: string | undefined;
    };
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    commits: {
        message: string;
        id: string;
        url: string;
        author: {
            name: string;
            username?: string | undefined;
        };
    }[];
    compare: string;
}>;
export declare const PullRequestEventSchema: z.ZodObject<{
    action: z.ZodString;
    number: z.ZodNumber;
    pull_request: z.ZodObject<{
        title: z.ZodString;
        user: z.ZodObject<{
            login: z.ZodString;
            avatar_url: z.ZodString;
            html_url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            login: string;
            avatar_url: string;
            html_url: string;
        }, {
            login: string;
            avatar_url: string;
            html_url: string;
        }>;
        html_url: z.ZodString;
        body: z.ZodNullable<z.ZodString>;
        merged: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        merged?: boolean | undefined;
    }, {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        merged?: boolean | undefined;
    }>;
    repository: z.ZodObject<{
        name: z.ZodString;
        full_name: z.ZodString;
        html_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        html_url: string;
        name: string;
        full_name: string;
    }, {
        html_url: string;
        name: string;
        full_name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    number: number;
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    action: string;
    pull_request: {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        merged?: boolean | undefined;
    };
}, {
    number: number;
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    action: string;
    pull_request: {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        merged?: boolean | undefined;
    };
}>;
export declare const IssuesEventSchema: z.ZodObject<{
    action: z.ZodString;
    issue: z.ZodObject<{
        title: z.ZodString;
        user: z.ZodObject<{
            login: z.ZodString;
            avatar_url: z.ZodString;
            html_url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            login: string;
            avatar_url: string;
            html_url: string;
        }, {
            login: string;
            avatar_url: string;
            html_url: string;
        }>;
        html_url: z.ZodString;
        body: z.ZodNullable<z.ZodString>;
        labels: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        labels: {
            name: string;
        }[];
    }, {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        labels: {
            name: string;
        }[];
    }>;
    repository: z.ZodObject<{
        name: z.ZodString;
        full_name: z.ZodString;
        html_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        html_url: string;
        name: string;
        full_name: string;
    }, {
        html_url: string;
        name: string;
        full_name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    action: string;
    issue: {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        labels: {
            name: string;
        }[];
    };
}, {
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    action: string;
    issue: {
        html_url: string;
        title: string;
        user: {
            login: string;
            avatar_url: string;
            html_url: string;
        };
        body: string | null;
        labels: {
            name: string;
        }[];
    };
}>;
export declare const StarEventSchema: z.ZodObject<{
    action: z.ZodString;
    sender: z.ZodObject<{
        login: z.ZodString;
        avatar_url: z.ZodString;
        html_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        login: string;
        avatar_url: string;
        html_url: string;
    }, {
        login: string;
        avatar_url: string;
        html_url: string;
    }>;
    repository: z.ZodObject<{
        name: z.ZodString;
        full_name: z.ZodString;
        html_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        html_url: string;
        name: string;
        full_name: string;
    }, {
        html_url: string;
        name: string;
        full_name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    action: string;
    sender: {
        login: string;
        avatar_url: string;
        html_url: string;
    };
}, {
    repository: {
        html_url: string;
        name: string;
        full_name: string;
    };
    action: string;
    sender: {
        login: string;
        avatar_url: string;
        html_url: string;
    };
}>;
export type PushEvent = z.infer<typeof PushEventSchema>;
export type PullRequestEvent = z.infer<typeof PullRequestEventSchema>;
export type IssuesEvent = z.infer<typeof IssuesEventSchema>;
export type StarEvent = z.infer<typeof StarEventSchema>;

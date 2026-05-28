/**
 * Verifies the GitHub webhook signature using HMAC SHA256.
 * @param payload The raw request body as a string.
 * @param signature The signature from 'X-Hub-Signature-256' header.
 * @param secret The secret configured in the GitHub webhook settings.
 * @returns boolean indicating if the signature is valid.
 */
export declare const verifyGithubSignature: (payload: string, signature: string, secret: string) => boolean;

import crypto from 'crypto';

/**
 * Verifies the GitHub webhook signature using HMAC SHA256.
 * @param payload The raw request body as a string.
 * @param signature The signature from 'X-Hub-Signature-256' header.
 * @param secret The secret configured in the GitHub webhook settings.
 * @returns boolean indicating if the signature is valid.
 */
export const verifyGithubSignature = (
  payload: string,
  signature: string,
  secret: string,
): boolean => {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from('sha256=' + hmac.update(payload).digest('hex'), 'utf8');
  const checksum = Buffer.from(signature, 'utf8');

  if (checksum.length !== digest.length) {
    return false;
  }

  return crypto.timingSafeEqual(digest, checksum);
};

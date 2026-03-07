/**
 * In-memory rate limit: 10 AI requests per minute per user.
 * Resets every minute. Works per server instance (single-instance dev/deploy).
 */

const LIMIT = 10;
const WINDOW_MS = 60_000;

const requests = new Map<string, number[]>();

export function checkAiRateLimit(userId: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  let timestamps = requests.get(userId) ?? [];
  timestamps = timestamps.filter((t) => t > cutoff);

  if (timestamps.length >= LIMIT) {
    const oldest = Math.min(...timestamps);
    const retryAfterSec = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  timestamps.push(now);
  requests.set(userId, timestamps);
  return { allowed: true };
}

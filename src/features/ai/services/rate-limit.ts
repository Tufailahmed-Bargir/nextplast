import "server-only";

/**
 * Lightweight in-memory rate limiter for AI proxy routes.
 * Extension point: swap for Redis in production multi-instance deploys.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const current = buckets.get(input.key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + input.windowMs;
    buckets.set(input.key, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }

  if (current.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  buckets.set(input.key, current);
  return {
    allowed: true,
    remaining: input.limit - current.count,
    resetAt: current.resetAt,
  };
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

/**
 * In-memory token-bucket rate limiter, keyed by IP. Suitable for a single
 * VPS instance (per the deployment target). Replace with Redis when scaling
 * horizontally.
 */
export function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function sweep() {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now > entry.resetAt) hits.delete(key);
    }
  }

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    if (hits.size > 10_000) sweep();

    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSec: 0 };
    }
    if (entry.count < max) {
      entry.count += 1;
      return { allowed: true, retryAfterSec: 0 };
    }
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
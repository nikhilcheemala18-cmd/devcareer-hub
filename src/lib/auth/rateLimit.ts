import "server-only";

/**
 * Best-effort in-memory rate limiting for the login action. This only
 * protects a single warm process/instance — on serverless platforms like
 * Vercel, separate instances have separate memory, so a distributed
 * brute-force attempt can bypass it. It is a cheap first line of defense,
 * not a substitute for a real distributed limiter (see the Phase 5 report's
 * "Known limitations" section).
 */

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

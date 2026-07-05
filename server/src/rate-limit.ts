type Entry = { count: number; resetAt: number };
export class RateLimiter {
  private readonly entries = new Map<string, Entry>();
  constructor(
    private readonly limit = positiveInteger(process.env.RATE_LIMIT_MAX, 30),
    private readonly windowMs = positiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  ) {}
  consume(key: string, now = Date.now()) {
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) { this.entries.set(key, { count: 1, resetAt: now + this.windowMs }); return { allowed: true, retryAfter: 0 }; }
    if (current.count >= this.limit) return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
    current.count += 1;
    return { allowed: true, retryAfter: 0 };
  }
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

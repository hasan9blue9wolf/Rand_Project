type HeiaRateLimitBucket = {
  count: number;
  resetAt: number;
};

type HeiaRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type HeiaRateLimitStore = Map<string, HeiaRateLimitBucket>;

type HeiaRateLimitGlobals = typeof globalThis & {
  __travelgeniousHeiaRateLimitStore?: HeiaRateLimitStore;
};

const RATE_LIMIT_GLOBALS = globalThis as HeiaRateLimitGlobals;

const getStore = (): HeiaRateLimitStore => {
  if (!RATE_LIMIT_GLOBALS.__travelgeniousHeiaRateLimitStore) {
    RATE_LIMIT_GLOBALS.__travelgeniousHeiaRateLimitStore = new Map();
  }

  return RATE_LIMIT_GLOBALS.__travelgeniousHeiaRateLimitStore;
};

const cleanupExpiredEntries = (store: HeiaRateLimitStore, now: number) => {
  store.forEach((bucket, key) => {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  });
};

export const consumeHeiaRateLimit = ({
  identifier,
  maxRequests,
  now = Date.now(),
  windowMs,
}: {
  identifier: string;
  maxRequests: number;
  now?: number;
  windowMs: number;
}): HeiaRateLimitResult => {
  const store = getStore();

  cleanupExpiredEntries(store, now);

  const existingBucket = store.get(identifier);

  if (!existingBucket || existingBucket.resetAt <= now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existingBucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000)),
    };
  }

  existingBucket.count += 1;
  store.set(identifier, existingBucket);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existingBucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000)),
  };
};

import { Redis } from '@upstash/redis';

const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('xxxxx') &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder') &&
  !process.env.UPSTASH_REDIS_REST_TOKEN.includes('placeholder');

let redis: Redis | null = null;

if (isRedisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// Leaderboard cache helpers
const LEADERBOARD_TTL = 300; // 5 minutes

export async function getCachedLeaderboard(type: string, identifier: string) {
  if (!redis) return null;
  try {
    const key = `leaderboard:${type}:${identifier}`;
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached as string);
    }
  } catch {
    // Redis unavailable — skip cache
  }
  return null;
}

export async function setCachedLeaderboard(
  type: string,
  identifier: string,
  data: unknown
) {
  if (!redis) return;
  try {
    const key = `leaderboard:${type}:${identifier}`;
    await redis.set(key, JSON.stringify(data), { ex: LEADERBOARD_TTL });
  } catch {
    // Redis unavailable — skip cache
  }
}

export async function invalidateLeaderboardCache(type?: string) {
  if (!redis) return;
  try {
    if (type) {
      const keys = await redis.keys(`leaderboard:${type}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      const keys = await redis.keys('leaderboard:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch {
    // Redis unavailable — skip cache
  }
}

export default redis;

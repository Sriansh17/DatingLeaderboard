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
      // Upstash auto-deserializes JSON, so cached is already an object
      if (typeof cached === 'string') {
        return JSON.parse(cached);
      }
      return cached;
    }
  } catch (err) {
    console.error('[Redis] getCachedLeaderboard error:', err);
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
    // Upstash handles JSON serialization automatically
    await redis.set(key, data, { ex: LEADERBOARD_TTL });
  } catch (err) {
    console.error('[Redis] setCachedLeaderboard error:', err);
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

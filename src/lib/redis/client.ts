import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Leaderboard cache helpers
const LEADERBOARD_TTL = 300; // 5 minutes

export async function getCachedLeaderboard(type: string, identifier: string) {
  const key = `leaderboard:${type}:${identifier}`;
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached as string);
  }
  return null;
}

export async function setCachedLeaderboard(
  type: string,
  identifier: string,
  data: unknown
) {
  const key = `leaderboard:${type}:${identifier}`;
  await redis.set(key, JSON.stringify(data), { ex: LEADERBOARD_TTL });
}

export async function invalidateLeaderboardCache(type?: string) {
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
}

export default redis;

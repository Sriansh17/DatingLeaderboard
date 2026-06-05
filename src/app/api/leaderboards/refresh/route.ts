import { NextResponse } from 'next/server';
import { invalidateLeaderboardCache } from '@/lib/redis/client';

export async function POST() {
  try {
    await invalidateLeaderboardCache();
    return NextResponse.json({ success: true, message: 'Leaderboard cache cleared' });
  } catch (error) {
    console.error('Cache refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh cache' },
      { status: 500 }
    );
  }
}

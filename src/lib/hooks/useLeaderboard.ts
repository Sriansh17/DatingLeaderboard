'use client';

import { useQuery } from '@tanstack/react-query';
import type { LeaderboardQuery } from '@/types/api';
import type { LeaderboardEntry } from '@/types/database';

async function fetchLeaderboard(params: LeaderboardQuery): Promise<LeaderboardEntry[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('type', params.type);
  if (params.latitude) searchParams.set('latitude', String(params.latitude));
  if (params.longitude) searchParams.set('longitude', String(params.longitude));
  if (params.city) searchParams.set('city', params.city);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(`/api/leaderboards?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  const json = await response.json();
  return json.data;
}

export function useLeaderboard(params: LeaderboardQuery) {
  return useQuery({
    queryKey: ['leaderboards', params],
    queryFn: () => fetchLeaderboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

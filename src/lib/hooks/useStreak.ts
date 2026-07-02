'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StreakData {
  streak: number;
  longest: number;
  multiplier: number;
  multiplierPercent: number;
  badges: Array<{ id: string; name: string; emoji: string; earned_at: string }>;
  nextBadge: {
    id: string;
    name: string;
    emoji: string;
    streakRequired: number;
    progress: number;
  } | null;
  canClaimPerk: boolean;
  lastPostDate: string | null;
}

export interface PerkClaimResult {
  perk: { id: string; name: string; emoji: string };
  fragmentCount: number;
  mysticUnlocked: boolean;
  activePerks: any[];
}

async function fetchStreak(): Promise<StreakData> {
  const res = await fetch('/api/streak');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch streak');
  return json.data;
}

async function claimPerk(): Promise<PerkClaimResult> {
  const res = await fetch('/api/streak', { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to claim perk');
  return json.data;
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: fetchStreak,
    staleTime: 60000,
    refetchOnMount: true,
  });
}

export function useClaimPerk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimPerk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });
}

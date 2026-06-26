'use client';

import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { Globe } from 'lucide-react';

export default function GlobalLeaderboardPage() {
  const { data, isLoading } = useLeaderboard({ type: 'global' });

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Global Leaderboard</h1>
      </div>
      <p className="text-sm text-gray-500">The most thoughtful partners around the world</p>
      <LeaderboardTable entries={data} loading={isLoading} />
    </div>
  );
}

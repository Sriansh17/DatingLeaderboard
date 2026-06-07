'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { Building2 } from 'lucide-react';

export default function CityLeaderboardPage() {
  const { profile } = useUser();
  const { data, isLoading } = useLeaderboard({
    type: 'city',
    city: profile?.city || undefined,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          City Leaderboard {profile?.city ? `- ${profile.city}` : ''}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">Partners ranked across your city</p>
      <LeaderboardTable
        entries={data}
        loading={isLoading}
        emptyMessage={!profile?.city ? 'Set your city in profile settings' : 'No entries in your city yet'}
      />
    </div>
  );
}

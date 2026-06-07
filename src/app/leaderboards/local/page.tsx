'use client';

import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { MapPin } from 'lucide-react';

export default function LocalLeaderboardPage() {
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const { data, isLoading } = useLeaderboard({
    type: 'local',
    latitude: latitude || undefined,
    longitude: longitude || undefined,
  });

  if (geoLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-muted-foreground">
        <MapPin className="h-12 w-12 text-pink-300 mx-auto mb-4" />
        <p>Getting your location...</p>
      </div>
    );
  }

  if (!latitude) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-muted-foreground">
        <MapPin className="h-12 w-12 text-pink-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground/90">Location Required</h2>
        <p className="text-sm mt-1">Enable location access to see local leaderboards</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Local Leaderboard</h1>
      </div>
      <p className="text-sm text-muted-foreground">Partners ranked within 10km of your location</p>
      <LeaderboardTable entries={data} loading={isLoading} />
    </div>
  );
}

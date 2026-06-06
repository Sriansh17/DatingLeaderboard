'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useUser } from '@/components/providers/AuthProvider';
import { MapPin, Globe, Heart } from 'lucide-react';

const tabs = [
  { id: 'local', label: 'Local', icon: <MapPin className="h-4 w-4" /> },
  { id: 'city', label: 'City', icon: <Heart className="h-4 w-4" /> },
  { id: 'global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('local');
  const { latitude, longitude } = useGeolocation();
  const { profile } = useUser();

  const { data: localData, isLoading: localLoading } = useLeaderboard({
    type: 'local',
    latitude: latitude || undefined,
    longitude: longitude || undefined,
    enabled: activeTab === 'local',
  });

  const { data: cityData, isLoading: cityLoading } = useLeaderboard({
    type: 'city',
    city: profile?.city || undefined,
    enabled: activeTab === 'city',
  });

  const { data: globalData, isLoading: globalLoading } = useLeaderboard({
    type: 'global',
    enabled: activeTab === 'global',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leaderboards 🏆</h1>
        <p className="text-sm text-gray-500 mt-1">
          See who has the most thoughtful partners! Minimum 1 post to qualify.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'local' && (
        <LeaderboardTable
          entries={localData}
          loading={localLoading}
          emptyMessage={!latitude ? 'Enable location for local rankings' : 'No local entries yet'}
        />
      )}
      {activeTab === 'city' && (
        <LeaderboardTable
          entries={cityData}
          loading={cityLoading}
          emptyMessage={!profile?.city ? 'Set your city in profile for city rankings' : 'No entries in your city yet'}
        />
      )}
      {activeTab === 'global' && (
        <LeaderboardTable
          entries={globalData}
          loading={globalLoading}
          emptyMessage="No global entries yet"
        />
      )}
    </div>
  );
}

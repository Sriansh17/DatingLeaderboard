'use client';

import { cn } from '@/lib/utils/cn';
import { MapPin, Heart, Globe } from 'lucide-react';

interface LeaderboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: LeaderboardTab[] = [
  { id: 'local', label: 'Local', icon: <MapPin className="h-4 w-4" /> },
  { id: 'city', label: 'City', icon: <Heart className="h-4 w-4" /> },
  { id: 'global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
];

interface LeaderboardTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function LeaderboardTabs({ activeTab, onTabChange, className }: LeaderboardTabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-muted rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center',
            activeTab === tab.id
              ? 'bg-surface text-primary dark:text-primary shadow-sm'
              : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 active:text-gray-900 dark:active:text-gray-100'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

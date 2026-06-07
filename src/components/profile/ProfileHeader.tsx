'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Settings, Edit3, Flame } from 'lucide-react';
import type { Profile } from '@/types/database';
import type { StreakResult } from '@/lib/utils/streak';

interface ProfileHeaderProps {
  profile: Profile;
  postCount?: number;
  partnerCount?: number;
  averageScore?: number;
  streak?: StreakResult | null;
}

export function ProfileHeader({ profile, postCount = 0, partnerCount = 0, averageScore = 0, streak }: ProfileHeaderProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <Avatar src={profile.avatar_url} alt={profile.username} size="lg" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">
        {profile.full_name || profile.username}
      </h1>
      <p className="text-muted-foreground">@{profile.username}</p>

      {streak && streak.currentStreak > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-medium">
          <Flame className="h-4 w-4 fill-orange-500" />
          {streak.currentStreak}-day streak!
        </div>
      )}

      {profile.bio && (
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">{profile.bio}</p>
      )}

      {profile.city && (
        <p className="mt-1 text-sm text-muted-foreground">📍 {profile.city}</p>
      )}

      <div className="flex items-center justify-center gap-4 mt-4">
        <Link href="/profile/edit">
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-8 max-w-md mx-auto">
        <div className="p-3 rounded-xl bg-secondary dark:bg-black/40 border border-transparent dark:border-white/10">
          <p className="text-2xl font-bold text-primary">{postCount}</p>
          <p className="text-xs text-muted-foreground">Posts</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary dark:bg-black/40 border border-transparent dark:border-white/10">
          <p className="text-2xl font-bold text-primary">{partnerCount}</p>
          <p className="text-xs text-muted-foreground">Partners</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary dark:bg-black/40 border border-transparent dark:border-white/10">
          <p className="text-2xl font-bold text-primary">{averageScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </div>
      </div>
    </div>
  );
}

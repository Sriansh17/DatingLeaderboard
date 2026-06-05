'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Settings, Edit3 } from 'lucide-react';
import type { Profile } from '@/types/database';

interface ProfileHeaderProps {
  profile: Profile;
  postCount?: number;
  partnerCount?: number;
  averageScore?: number;
}

export function ProfileHeader({ profile, postCount = 0, partnerCount = 0, averageScore = 0 }: ProfileHeaderProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <Avatar src={profile.avatar_url} alt={profile.username} size="lg" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {profile.full_name || profile.username}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>

      {profile.bio && (
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">{profile.bio}</p>
      )}

      {profile.city && (
        <p className="mt-1 text-sm text-gray-400">📍 {profile.city}</p>
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
      <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-2xl font-bold text-pink-500">{postCount}</p>
          <p className="text-xs text-gray-500">Posts</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-2xl font-bold text-pink-500">{partnerCount}</p>
          <p className="text-xs text-gray-500">Partners</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-2xl font-bold text-pink-500">{averageScore}</p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
      </div>
    </div>
  );
}

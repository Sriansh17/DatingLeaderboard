'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getRankEmoji, getScoreColor } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import type { LeaderboardEntry } from '@/types/database';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
}

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  return (
    <Card className="flex items-center gap-4 !p-4">
      {/* Rank */}
      <div className="w-10 text-center">
        <span className="text-lg font-bold">{getRankEmoji(entry.rank)}</span>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={entry.avatar_url} alt={entry.username} size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {entry.full_name || entry.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            ❤️ {entry.top_partner_name}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-3">
        <Badge variant="info">{entry.total_posts} posts</Badge>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className={`text-2xl font-bold ${getScoreColor(entry.average_score)}`}>
          {entry.average_score}
        </p>
        <p className="text-xs text-gray-400">avg score</p>
      </div>
    </Card>
  );
}

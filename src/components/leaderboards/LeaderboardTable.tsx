'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { getRankEmoji, getScoreColor } from '@/lib/utils/format';
import type { LeaderboardEntry } from '@/types/database';

interface LeaderboardTableProps {
  entries?: LeaderboardEntry[];
  loading?: boolean;
  emptyMessage?: string;
}

export function LeaderboardTable({ entries, loading, emptyMessage = 'No entries yet' }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">{emptyMessage}</p>
        <p className="text-sm mt-1">Post at least 3 times to appear on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.user_id}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
        >
          {/* Rank */}
          <div className="w-10 text-center">
            <span className="text-lg font-bold">{getRankEmoji(entry.rank)}</span>
          </div>

          {/* Partner Avatar & Name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {entry.top_partner_avatar ? (
              <Avatar src={entry.top_partner_avatar} alt={entry.top_partner_name} size="md" />
            ) : (
              <span className="text-2xl">{entry.top_partner_emoji}</span>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {entry.top_partner_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                by {entry.full_name || entry.username}
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
        </div>
      ))}
    </div>
  );
}

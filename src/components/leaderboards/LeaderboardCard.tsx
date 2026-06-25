'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getRankEmoji, getScoreColor } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import type { LeaderboardEntry } from '@/types/database';
import Link from 'next/link';

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

      {/* Avatar + Names — links to user profile */}
      <Link href={`/users/${entry.user_id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
        {entry.top_partner_avatar ? (
          <Avatar src={entry.top_partner_avatar} alt={entry.top_partner_name} size="md" />
        ) : (
          <span className="text-2xl group-hover:scale-110 transition-transform">{entry.top_partner_emoji}</span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {entry.top_partner_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            by {entry.full_name || entry.username}
          </p>
        </div>
      </Link>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-3">
        <Badge variant="info">{entry.total_posts} posts</Badge>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className={`text-2xl font-bold ${getScoreColor(entry.average_score)}`}>
          {entry.average_score}
        </p>
        <p className="text-xs text-muted-foreground">avg score</p>
      </div>
    </Card>
  );
}

'use client';

import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { getRankEmoji, getScoreBgColor } from '@/lib/utils/format';
import type { LeaderboardEntry } from '@/types/database';
import { Share2 } from 'lucide-react';
import { ShareExperienceModal } from '@/components/share/ShareExperienceModal';

interface LeaderboardTableProps {
  entries?: LeaderboardEntry[];
  loading?: boolean;
  emptyMessage?: string;
}

export function LeaderboardTable({ entries, loading, emptyMessage = 'No entries yet' }: LeaderboardTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.user_id}
          className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
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
              <p className="font-semibold text-foreground truncate">
                {entry.top_partner_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                by {entry.full_name || entry.username}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3">
            <Badge variant="info">{entry.total_posts} posts</Badge>
          </div>

          {/* Score & Share */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white font-bold text-lg ${
                getScoreBgColor(entry.average_score)
              }`}>
                {entry.average_score}
              </div>
              <p className="text-xs text-muted-foreground mt-1">avg</p>
            </div>
            
            <button
              onClick={() => setSelectedEntry(entry)}
              className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors group"
              title="Share Rank"
            >
              <Share2 className="w-5 h-5 group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      ))}

      {selectedEntry && (
        <ShareExperienceModal
          isOpen={true}
          onClose={() => setSelectedEntry(null)}
          profileName={selectedEntry.username || 'anonymous'}
          rank={selectedEntry.rank}
          city={selectedEntry.city}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from "react";
import { scoreColor } from "@/lib/mock-data";
import { ArrowDown, ArrowUp, Minus, Share2 } from "lucide-react";
import { useShare } from "@/components/providers/ShareProvider";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useUser } from "@/components/providers/AuthProvider";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { Spinner } from "@/components/ui/Spinner";

const scopes = ["Global", "Country", "Local"] as const;

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  average_score: number;
  total_posts: number;
  top_partner_name: string;
  top_partner_avatar?: string | null;
  top_partner_emoji: string;
}

function PodiumItem({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isFirst = rank === 1;
  const height = isFirst ? 'h-40 sm:h-48' : rank === 2 ? 'h-32 sm:h-36' : 'h-28 sm:h-28';
  const color = isFirst ? 'var(--gold)' : rank === 2 ? '#C0C0C0' : '#CD7F32';
  const bgColor = isFirst ? 'from-gold/20 to-gold/5 border-gold/30' : rank === 2 ? 'from-gray-300/20 to-gray-300/5 border-gray-300/30' : 'from-orange-400/20 to-orange-400/5 border-orange-400/30';
  const initial = (entry.top_partner_name?.[0] || entry.username?.[0] || 'A').toUpperCase();

  return (
    <div className={`flex flex-col items-center w-24 sm:w-32 transition-transform duration-500 hover:-translate-y-2`}>
      <div className="relative mb-3">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-elevated border-2 grid place-items-center font-display text-xl sm:text-2xl shadow-[0_0_20px_-5px_currentColor] z-10 relative" style={{ borderColor: color, color }}>
          {initial}
        </div>
        {isFirst && <div className="absolute -top-5 -right-3 text-3xl animate-bounce drop-shadow-xl z-20">👑</div>}
      </div>
      <div className="text-center mb-3 w-full px-1">
        <div className="text-xs sm:text-sm font-medium text-foreground truncate">{entry.top_partner_name || entry.username}</div>
        <div className="text-[10px] text-muted-foreground truncate">by @{entry.username}</div>
        <div className="text-[10px] font-score" style={{ color }}>{entry.average_score}</div>
      </div>
      <div className={`w-full ${height} rounded-t-2xl bg-gradient-to-b ${bgColor} border-t border-x flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner relative overflow-hidden backdrop-blur-md`}>
        <div className="absolute inset-0 bg-white/5 opacity-50" />
        <span className="font-score text-4xl sm:text-5xl leading-none relative z-10" style={{ color }}>{rank}</span>
      </div>
    </div>
  );
}

export default function RanksPage() {
  const [scope, setScope] = useState<(typeof scopes)[number]>("Global");
  const { openShare } = useShare();
  const { profile } = useUser();
  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  const apiType = scope === 'Global' ? 'global' : scope === 'Country' ? 'country' : 'local';

  const params = {
    type: apiType as 'global' | 'country' | 'local',
    country: scope === 'Country' ? (profile as any)?.country || undefined : undefined,
    city: scope === 'Local' ? profile?.city || undefined : undefined,
    latitude: scope === 'Local' ? latitude || undefined : undefined,
    longitude: scope === 'Local' ? longitude || undefined : undefined,
    limit: 50,
    enabled: scope !== 'Local' || !geoLoading,
  };

  const { data: entries, isLoading } = useLeaderboard(params);

  const top3 = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  // Find current user's rank
  const myEntry = entries?.find((e) => e.user_id === profile?.id);
  const myRank = myEntry?.rank;

  return (
    <main className="pb-32 w-full min-h-screen bg-transparent relative">
      <header className="px-5 pb-3 pt-6 max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">The Standings</p>
        <h1 className="font-display text-3xl italic text-foreground">Leaderboard</h1>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-background/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex rounded-full border border-border bg-elevated/60 p-1 max-w-7xl mx-auto">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground max-w-7xl mx-auto">
          {scope === "Global"
            ? "Top couples worldwide"
            : scope === "Country"
            ? (profile as any)?.country ? `Top in ${(profile as any).country}` : "Set your country in profile"
            : profile?.city ? `Top near ${profile.city}` : "Enable location for local rankings"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No entries yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 py-8 mt-2">
                <PodiumItem entry={top3[1]} rank={2} />
                <PodiumItem entry={top3[0]} rank={1} />
                <PodiumItem entry={top3[2]} rank={3} />
              </div>
            )}

            {/* List */}
            <ol className="space-y-2 p-4">
              {(top3.length < 3 ? entries : rest).map((e) => (
                <li
                  key={e.user_id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <div
                    className="font-score text-3xl leading-none text-muted-foreground"
                    style={{ width: 44 }}
                  >
                    {e.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{e.top_partner_name || e.username}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      by @{e.username} · {e.total_posts} posts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-score text-2xl leading-none" style={{ color: scoreColor(e.average_score) }}>
                      {e.average_score}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      {/* Pinned self */}
      {myEntry && myRank && (
        <div className="fixed inset-x-0 bottom-28 z-30 mx-auto max-w-7xl px-4">
          <div className="rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
            <div className="font-score text-2xl text-blush shrink-0" style={{ width: 44 }}>
              #{myRank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">You · {myEntry.top_partner_name || profile?.username}</div>
              <div className="text-xs text-muted-foreground truncate">
                {myEntry.total_posts} posts · keep climbing
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="font-score text-2xl" style={{ color: scoreColor(myEntry.average_score) }}>
                {myEntry.average_score}
              </div>
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                onClick={() => {
                  openShare('rank', {
                    username: profile?.username || 'you',
                    score: myEntry.average_score,
                    rank: myRank,
                    city: profile?.city || '',
                  });
                }}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

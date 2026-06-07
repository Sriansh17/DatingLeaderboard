'use client';

import { useState } from 'react';
import { useUser } from '@/components/providers/AuthProvider';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { getScoreColor } from '@/lib/utils/format';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { ArrowUp, ArrowDown, Minus, Crown, Share2 } from 'lucide-react';
import { ShareExperienceModal } from '@/components/share/ShareExperienceModal';

const scopes = ['local', 'country', 'global'] as const;
const scopeLabels = ['Local', 'Country', 'Global'] as const;

function PodiumRank({ rank }: { rank: number }) {
  const colors = ['var(--gold)', '#C0C0C0', '#CD7F32'];
  const heights = ['h-40 sm:h-48', 'h-32 sm:h-36', 'h-28 sm:h-28'];
  const bgGradients = [
    'from-gold/20 to-gold/5 border-gold/30',
    'from-gray-300/20 to-gray-300/5 border-gray-300/30',
    'from-orange-400/20 to-orange-400/5 border-orange-400/30',
  ];

  return (
    <div className={`w-full ${heights[rank]} rounded-t-2xl bg-gradient-to-b ${bgGradients[rank]} border-t border-x flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner relative overflow-hidden backdrop-blur-md`}>
      <div className="absolute inset-0 bg-white/5 opacity-50" />
      <span className="font-score text-4xl sm:text-5xl leading-none relative z-10" style={{ color: colors[rank] }}>
        {rank + 1}
      </span>
    </div>
  );
}

export default function RanksPage() {
  const [scopeIdx, setScopeIdx] = useState(0);
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const scope = scopes[scopeIdx];
  const { profile } = useUser();
  const { latitude, longitude } = useGeolocation();

  const params = {
    type: scope as 'global' | 'local' | 'country',
    city: scope === 'local' ? profile?.city || undefined : undefined,
    country: scope === 'country' ? (profile as any)?.country || (profile as any)?.user_metadata?.country || undefined : undefined,
    latitude: scope === 'local' ? latitude || undefined : undefined,
    longitude: scope === 'local' ? longitude || undefined : undefined,
    limit: 50,
  };

  const { data: entries, isLoading } = useLeaderboard(params);

  const top3 = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  // Find current user's rank
  const myEntry = entries?.find((e) => e.user_id === profile?.id);
  const myRank = myEntry?.rank;

  return (
    <main className="pb-32 max-w-4xl mx-auto w-full border-x border-border min-h-screen bg-background relative">
      <header className="px-5 pb-3 pt-6 flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">The Standings</p>
          <h1 className="font-display text-3xl italic text-foreground">Leaderboard</h1>
        </div>
        
        {myEntry && myRank && (
          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-1">Your Rank</span>
            <span className="font-score text-2xl text-primary dark:text-blush leading-none">#{myRank}</span>
          </div>
        )}
      </header>

      {/* Scope Toggles */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="flex bg-secondary/50 p-1 rounded-full border border-white/5">
          {scopes.map((s, i) => (
            <button
              key={s}
              onClick={() => setScopeIdx(i)}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                scopeIdx === i
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {scopeLabels[i]}
            </button>
          ))}
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          {scope === 'local' ? `Top in ${profile?.city || 'your area'}` : scope === 'country' ? 'Top in India' : 'Global rankings'}
        </div>
      </div>

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
          {/* Top 3 Podium — gracefully handle 1 or 2 entries */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 py-8 mt-2">
              {top3[1] && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className="relative mb-3">
                    <Avatar src={top3[1].top_partner_avatar || top3[1].avatar_url} alt={top3[1].top_partner_name} size="lg" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-300 border-2 border-background grid place-items-center text-[10px] font-bold text-foreground">2</div>
                  </div>
                  <div className="text-center mb-3 w-full px-1">
                    <div className="text-xs sm:text-sm font-medium text-foreground truncate">{top3[1].top_partner_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">by {top3[1].username}</div>
                    <div className="text-xs font-score mt-1" style={{ color: getScoreColor(top3[1].average_score).replace('text-', '') === 'green' ? '#4ADE80' : getScoreColor(top3[1].average_score).replace('text-', '') === 'emerald' ? '#4ADE80' : getScoreColor(top3[1].average_score).replace('text-', '') === 'yellow' ? '#FBBF24' : getScoreColor(top3[1].average_score).replace('text-', '') === 'orange' ? '#FB923C' : '#E54D6A' }}>
                      {top3[1].average_score}
                    </div>
                  </div>
                  <PodiumRank rank={1} />
                </div>
              )}

              {top3[0] && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className="relative mb-3">
                    <Avatar src={top3[0].top_partner_avatar || top3[0].avatar_url} alt={top3[0].top_partner_name} size="lg" />
                    <div className="absolute -top-3 -right-2 text-2xl drop-shadow-xl z-20">👑</div>
                  </div>
                  <div className="text-center mb-3 w-full px-1">
                    <div className="text-xs sm:text-sm font-medium text-foreground truncate">{top3[0].top_partner_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">by {top3[0].username}</div>
                    <div className="text-xs font-score mt-1" style={{ color: '#E8C86A' }}>{top3[0].average_score}</div>
                  </div>
                  <PodiumRank rank={0} />
                </div>
              )}

              {top3[2] && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className="relative mb-3">
                    <Avatar src={top3[2].top_partner_avatar || top3[2].avatar_url} alt={top3[2].top_partner_name} size="lg" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-700 border-2 border-background grid place-items-center text-[10px] font-bold text-white">3</div>
                  </div>
                  <div className="text-center mb-3 w-full px-1">
                    <div className="text-xs sm:text-sm font-medium text-foreground truncate">{top3[2].top_partner_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">by {top3[2].username}</div>
                    <div className="text-xs font-score mt-1" style={{ color: '#CD7F32' }}>{top3[2].average_score}</div>
                  </div>
                  <PodiumRank rank={2} />
                </div>
              )}
            </div>
          )}

          {/* Rest of the list */}
          <ol className="space-y-2 p-4">
            {(top3.length < 3 ? entries : rest).map((entry) => (
              <li
                key={entry.user_id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="font-score text-3xl leading-none text-muted-foreground" style={{ width: 44 }}>
                  {entry.rank}
                </div>
                <Avatar
                  src={entry.top_partner_avatar || entry.avatar_url}
                  alt={entry.top_partner_name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{entry.top_partner_name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    by {entry.username} · {entry.total_posts} posts
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div className={`font-score text-2xl leading-none ${getScoreColor(entry.average_score)}`}>
                    {entry.average_score}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Pinned self (Bottom) */}
      {myEntry && myRank && (
        <div className="fixed inset-x-0 bottom-28 z-30 mx-auto max-w-2xl px-4 group">
          <div className="rounded-2xl border-2 border-blush/60 bg-background/95 p-3 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="font-score text-2xl text-blush" style={{ width: 44 }}>
                  #{myRank}
                </div>
                <div className="relative shrink-0">
                  <Avatar src={myEntry.avatar_url || undefined} alt={myEntry.username} className="w-10 h-10 border border-border" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">You · {myEntry.username.replace('@', '')}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {myEntry.total_posts} posts · keep climbing
                  </div>
                </div>
              </div>
              
              <div className="flex items-center shrink-0">
                <div className={`font-score text-2xl ${getScoreColor(myEntry.average_score)} transition-transform duration-300`}>
                  {myEntry.average_score}
                </div>
                
                {/* Expanding Share Button */}
                <div className="flex items-center overflow-hidden transition-all duration-300 ease-out w-0 opacity-0 group-hover:w-12 group-hover:opacity-100 group-hover:ml-3 z-20">
                  <button 
                    onClick={() => setSelectedRank(myEntry)}
                    className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-sm dark:shadow-lg dark:backdrop-blur-md hover:scale-105 transition-transform bg-secondary dark:bg-black/60 border border-border dark:border-white/10 text-muted-foreground hover:text-primary dark:hover:text-blush"
                    title="Share Rank"
                  >
                    <Share2 className="h-5 w-5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRank && (
        <ShareExperienceModal
          isOpen={true}
          onClose={() => setSelectedRank(null)}
          profileName={selectedRank.username.replace('@', '')}
          rank={selectedRank.rank}
          city={selectedRank.city}
        />
      )}
    </main>
  );
}

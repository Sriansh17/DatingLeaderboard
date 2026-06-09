'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scoreColor } from "@/lib/mock-data";
import { ArrowDown, ArrowUp, Minus, Share2 } from "lucide-react";
import { useShare } from "@/components/providers/ShareProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
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
  
  const colorClass = isFirst ? 'text-gold' : rank === 2 ? 'text-slate-500 dark:text-slate-300' : 'text-amber-700 dark:text-amber-600';
  const borderClass = isFirst ? 'border-gold' : rank === 2 ? 'border-slate-500 dark:border-slate-400' : 'border-amber-700 dark:border-amber-600';
  const bgColor = isFirst ? 'from-gold/20 to-gold/5 border-gold/30' : rank === 2 ? 'from-slate-500/20 to-slate-500/5 border-slate-500/30 dark:from-slate-400/20 dark:to-slate-400/5 dark:border-slate-400/30' : 'from-amber-700/20 to-amber-700/5 border-amber-700/30 dark:from-amber-600/20 dark:to-amber-600/5 dark:border-amber-600/30';
  
  const initial = (entry.top_partner_name?.[0] || entry.username?.[0] || 'A').toUpperCase();

  const delay = isFirst ? 0.3 : rank === 2 ? 0 : 0.15;

  return (
    <motion.div 
      initial={{ y: 30, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={`flex flex-col items-center w-24 sm:w-32 transition-transform duration-700 hover:-translate-y-1`}
    >
      <div className="relative mb-3">
        <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-elevated border-2 grid place-items-center font-display text-xl sm:text-2xl shadow-[0_0_20px_-5px_currentColor] z-10 relative ${colorClass} ${borderClass}`}>
          {initial}
        </div>
        {isFirst && <div className="absolute -top-5 -right-3 text-3xl animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] z-20">👑</div>}
      </div>
      <div className="text-center mb-3 w-full px-1">
        <div className="text-xs sm:text-sm font-medium text-foreground truncate">{entry.top_partner_name || entry.username}</div>
        <div className="text-[10px] text-muted-foreground truncate">by @{entry.username}</div>
        <div className={`text-xl font-score mt-1 drop-shadow-sm ${colorClass}`}>{entry.average_score}</div>
      </div>
      <div className={`w-full ${height} rounded-t-2xl bg-gradient-to-b ${bgColor} border-t border-x flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner relative overflow-hidden backdrop-blur-md`}>
        <div className="absolute inset-0 bg-white/5 opacity-50" />
        <span className={`font-score text-4xl sm:text-5xl leading-none relative z-10 ${colorClass}`}>{rank}</span>
      </div>
    </motion.div>
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
    <main className="pb-48 w-full min-h-screen bg-transparent relative">
      <header className="px-5 pb-3 pt-6 max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">The Standings</p>
        <h1 className="font-display text-3xl italic text-foreground">Leaderboard</h1>
      </header>

      <div className="relative z-10 px-5 py-3">
        <div className="flex rounded-full border border-border/50 bg-background/50 p-1 max-w-7xl mx-auto">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`relative flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === s ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {scope === s && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-full z-0"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative z-10">{s}</span>
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
          <div className="flex justify-center py-20 min-h-[50vh] items-center">
            <Spinner size="lg" text={["TALLYING STANDINGS...", "INITIALIZING FOND...", "CALCULATING SCORES..."]} />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No entries yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 pt-8 pb-2 mt-2">
                <PodiumItem entry={top3[1]} rank={2} />
                <PodiumItem entry={top3[0]} rank={1} />
                <PodiumItem entry={top3[2]} rank={3} />
              </div>
            )}

            {/* List */}
            <motion.ol className="space-y-2 px-4 pb-4 pt-2">
              {(top3.length < 3 ? entries : rest).map((e, index) => (
                <motion.li
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  key={e.user_id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 relative overflow-hidden"
                  whileHover={{ y: -2, boxShadow: "0px 10px 30px -10px rgba(0,0,0,0.1)" }}
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
                    <div className="font-score text-2xl leading-none relative overflow-hidden h-[24px]" style={{ color: scoreColor(e.average_score) }}>
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={e.average_score}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <AnimatedNumber value={e.average_score} instant={true} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </>
        )}
      </div>

      {/* Pinned self */}
      {myEntry && myRank && (
        <motion.div 
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="fixed inset-x-0 bottom-[100px] sm:bottom-[120px] z-30 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto w-fit min-w-[320px] max-w-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/60 p-4 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
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
              <div className="font-score text-2xl relative overflow-hidden h-[24px]" style={{ color: scoreColor(myEntry.average_score) }}>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={myEntry.average_score}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <AnimatedNumber value={myEntry.average_score} delay={1.2} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ y: -2 }}
                className="p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all text-foreground"
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
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}

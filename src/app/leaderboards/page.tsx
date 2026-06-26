'use client';

import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import { scoreColor } from "@/lib/mock-data";
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { PageBell } from '@/components/ui/PageBell';
import { ArrowDown, ArrowUp, Minus, Share2, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { useShare } from "@/components/providers/ShareProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useUser } from "@/components/providers/AuthProvider";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { Spinner } from "@/components/ui/Spinner";
import Link from 'next/link';

const scopes = ["Country", "City", "Circle"] as const;
const timeframes = ["All Time", "This Week"] as const;

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
  rank_change?: number | null;
}

function PodiumAvatar({
  avatarUrl,
  name,
  size,
  colorClass,
  borderClass,
  crown,
}: {
  avatarUrl?: string | null;
  name: string;
  size: string;
  colorClass: string;
  borderClass: string;
  crown?: boolean;
}) {
  const initial = (name?.[0] || '?').toUpperCase();
  return (
    <div className="relative">
      <div
        className={`${size} rounded-full border-2 overflow-hidden flex items-center justify-center font-display text-xl shadow-[0_0_20px_-5px_currentColor] z-10 relative ${colorClass} ${borderClass} bg-elevated`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="select-none">{initial}</span>
        )}
      </div>
      {crown && (
        <div className="absolute -top-5 -right-2 text-2xl drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] z-20 pointer-events-none">
          👑
        </div>
      )}
    </div>
  );
}

function PodiumItem({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isFirst = rank === 1;
  const height = isFirst ? 'h-40 sm:h-48' : rank === 2 ? 'h-32 sm:h-36' : 'h-24 sm:h-28';

  const colorClass =
    isFirst
      ? 'text-gold'
      : rank === 2
      ? 'text-slate-400 dark:text-slate-300'
      : 'text-amber-700 dark:text-amber-500';
  const borderClass =
    isFirst
      ? 'border-gold'
      : rank === 2
      ? 'border-slate-400 dark:border-slate-300'
      : 'border-amber-700 dark:border-amber-500';
  const bgGradient =
    isFirst
      ? 'from-gold/20 to-gold/5 border-gold/30'
      : rank === 2
      ? 'from-slate-400/20 to-slate-400/5 border-slate-400/30 dark:from-slate-300/15 dark:to-slate-300/5 dark:border-slate-300/25'
      : 'from-amber-700/20 to-amber-700/5 border-amber-700/30 dark:from-amber-500/15 dark:to-amber-500/5 dark:border-amber-500/25';

  // Stagger: 3rd rises first (delay 0), 2nd (delay 0.08), 1st last (delay 0.18)
  const delay = isFirst ? 0.18 : rank === 2 ? 0.08 : 0;
  const riseY = isFirst ? 32 : rank === 2 ? 20 : 14;
  const avatarSize = isFirst ? 'h-16 w-16 sm:h-[72px] sm:w-[72px]' : 'h-13 w-13 sm:h-14 sm:w-14';

  return (
    <motion.div
      initial={{ y: riseY, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className="flex flex-col items-center w-24 sm:w-32 hover:-translate-y-1 transition-transform duration-300"
    >
      <Link href={`/users/${entry.user_id}`} className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* Dual avatar lockup */}
        <div className="relative mb-3 flex items-end justify-center">
          {/* Partner avatar (small, offset back-right) */}
          <div className="absolute -right-2 bottom-0 h-7 w-7 rounded-full ring-2 ring-background overflow-hidden bg-gradient-to-br from-rose-300 to-pink-500 flex items-center justify-center z-0">
            {entry.top_partner_avatar ? (
              <img src={entry.top_partner_avatar} alt={entry.top_partner_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-white text-[9px] font-bold">
                {(entry.top_partner_name?.[0] || '?').toUpperCase()}
              </span>
            )}
          </div>
          {/* Main user avatar (front) */}
          <PodiumAvatar
            avatarUrl={entry.avatar_url}
            name={entry.username}
            size={avatarSize}
            colorClass={colorClass}
            borderClass={borderClass}
            crown={isFirst}
          />
        </div>

        {/* Label */}
        <div className="text-center mb-3 w-full px-1">
          <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {entry.top_partner_name || entry.username}
          </div>
          <div className="text-[9px] text-muted-foreground truncate">@{entry.username}</div>
          <div className={`text-xl font-score mt-0.5 ${colorClass}`}>{entry.average_score}</div>
        </div>
      </Link>

      {/* Podium block */}
      <div
        className={`w-full ${height} rounded-t-2xl bg-gradient-to-b ${bgGradient} border-t border-x flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner relative overflow-hidden backdrop-blur-md`}
      >
        <div className="absolute inset-0 bg-white/5 opacity-40" />
        <span className={`font-score text-4xl sm:text-5xl leading-none relative z-10 ${colorClass}`}>
          {rank}
        </span>
      </div>
    </motion.div>
  );
}

export default function RanksPage() {
  const [scope, setScope] = useState<(typeof scopes)[number]>("Country");
  const [timeframe, setTimeframe] = useState<(typeof timeframes)[number]>("All Time");
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [userCircles, setUserCircles] = useState<any[]>([]);
  const [circlesLoading, setCirclesLoading] = useState(false);
  const { openShare } = useShare();
  const { profile } = useUser();
  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  // Fetch user's circles when scope changes to 'Circle'
  useEffect(() => {
    if (scope === 'Circle') {
      setCirclesLoading(true);
      fetch('/api/circles')
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setUserCircles(data.data || []);
            if (data.data?.length > 0 && !selectedCircleId) {
              setSelectedCircleId(data.data[0].id);
            }
          }
        })
        .catch(() => {})
        .finally(() => setCirclesLoading(false));
    }
  }, [scope]);

  // Reset circle selection when scope changes away
  useEffect(() => {
    if (scope !== 'Circle') setSelectedCircleId(null);
  }, [scope]);

  const isCircle = scope === 'Circle';

  const params = isCircle ? {} : {
    type: (scope === 'Country' ? 'country' : 'city') as 'country' | 'city',
    country: scope === 'Country' ? (profile as any)?.country || undefined : undefined,
    city: scope === 'City' ? profile?.city || undefined : undefined,
    latitude: scope === 'City' ? latitude || undefined : undefined,
    longitude: scope === 'City' ? longitude || undefined : undefined,
    limit: 50,
    enabled: scope !== 'City' || !geoLoading,
  };

  // Fetch leaderboard data (uses different query for circle vs country/city)
  const { data: entries, isLoading } = useQuery({
    queryKey: isCircle ? ['circle-leaderboard', selectedCircleId] : ['leaderboard', params],
    queryFn: async () => {
      if (isCircle) {
        if (!selectedCircleId) return [];
        const res = await fetch(`/api/circles/${selectedCircleId}/leaderboard`);
        const json = await res.json();
        return json.data || [];
      }
      // For country/city, use the leaderboard API
      const type = scope === 'Country' ? 'country' : 'city';
      const searchParams = new URLSearchParams({ type, limit: '50' });
      if (scope === 'Country' && (profile as any)?.country) searchParams.set('country', (profile as any).country);
      if (scope === 'City' && profile?.city) searchParams.set('city', profile.city);
      if (scope === 'City' && latitude) searchParams.set('latitude', String(latitude));
      if (scope === 'City' && longitude) searchParams.set('longitude', String(longitude));
      const res = await fetch(`/api/leaderboards?${searchParams}`);
      const json = await res.json();
      return json.data || [];
    },
    enabled: isCircle ? !!selectedCircleId : true,
    staleTime: 30000,
  });

  const top3 = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  // Find current user's rank
  const myEntry = entries?.find((e) => e.user_id === profile?.id);
  const myRank = myEntry?.rank;

  // Find rival — the person one spot above the user
  const rivalEntry = myRank && entries ? entries.find(e => e.rank === myRank - 1) : null;
  const pointsGap = rivalEntry && myEntry ? (rivalEntry.average_score - myEntry.average_score).toFixed(1) : null;

  return (
    <main className="pb-12 w-full min-h-screen bg-transparent relative">
      <ScrollToTop label="Leaderboard" />
      {/* Header — eyebrow + headline + stat block */}
      <header className="px-5 pb-2 pt-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-2">The Standings</p>
            <h1 className="font-display text-5xl sm:text-6xl italic text-foreground leading-none mb-5">Leaderboard</h1>
          </div>
          <PageBell />
        </div>
        <div className="flex items-end gap-3 mb-1">
          <span className="font-score text-5xl leading-none text-foreground">12,402</span>
          <span className="text-muted-foreground text-sm mb-1">couples ranked globally</span>
        </div>
      </header>

      <div className="relative z-10 px-5 py-3 space-y-3">
        {/* Timeframe toggle */}
        <div className="flex rounded-full border border-border/50 bg-background/50 p-1 max-w-xs mx-auto">
          {timeframes.map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`relative flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                timeframe === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {timeframe === t && (
                <motion.div
                  layoutId="timeframe-pill"
                  className="absolute inset-0 glass-btn-gold rounded-full z-0"
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
        {/* Scope toggle */}
        <div className="flex rounded-full border border-border/50 bg-background/50 p-1 max-w-7xl mx-auto">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`relative flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === s ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {scope === s && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 glass-btn rounded-full z-0"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative z-10">{s}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground max-w-7xl mx-auto">
          {scope === "Country"
            ? (profile as any)?.country ? `Top couples in ${(profile as any).country}` : "Set your country in profile settings"
            : scope === "City"
            ? latitude && longitude ? "Couples near your exact location" : profile?.city ? `Top near ${profile.city}` : "Enable location for local rankings"
            : "Leaderboard for members of your circle"}
        </p>

        {/* Circle selector */}
        {scope === 'Circle' && (
          <div className="flex justify-center mt-4">
            {circlesLoading ? (
              <Spinner size="sm" />
            ) : userCircles.length === 0 ? (
              <Link href="/circles" className="text-xs text-primary hover:underline">
                Create or join a circle to see its leaderboard
              </Link>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {userCircles.map((circle: any) => (
                  <button
                    key={circle.id}
                    onClick={() => setSelectedCircleId(circle.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCircleId === circle.id
                        ? 'glass-btn'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {circle.emoji} {circle.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20 min-h-[50vh] items-center">
            <Spinner size="lg" text={["TALLYING STANDINGS...", "INITIALIZING FOND...", "CALCULATING SCORES..."]} />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-border flex items-center justify-center mb-6 shadow-inner">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="font-display italic text-2xl text-foreground mb-2">No couples found here</h3>
            <p className="text-muted-foreground max-w-sm mb-8 mx-auto text-sm leading-relaxed">
              {scope === 'City' 
                ? "No one near you has scored yet. The local throne is unclaimed. Fix that."
                : scope === 'Circle'
                ? "No one in this circle has scored yet."
                : "There aren't any entries on this leaderboard yet. Claim your spot at the top."}
            </p>
            <Link href="/posts/new" className="inline-flex items-center justify-center rounded-full glass-btn text-sm shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]">
              Submit a Post
            </Link>
          </div>
        ) : (
          <>
            {/* Top Podium — adapts to available entries */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 pt-8 pb-2 mt-2">
                {top3.length === 1 ? (
                  <PodiumItem entry={top3[0]} rank={1} />
                ) : top3.length === 2 ? (
                  <>
                    <PodiumItem entry={top3[1]} rank={2} />
                    <PodiumItem entry={top3[0]} rank={1} />
                  </>
                ) : (
                  <>
                    <PodiumItem entry={top3[1]} rank={2} />
                    <PodiumItem entry={top3[0]} rank={1} />
                    <PodiumItem entry={top3[2]} rank={3} />
                  </>
                )}
              </div>
            )}

            {/* List — shows all entries after the podium */}
            {entries.length > 3 && (
              <motion.ol className="space-y-2 px-4 pb-4 pt-2">
                {entries.slice(3).map((e, index) => (
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
                    <Link href={`/users/${e.user_id}`} className="flex items-center gap-3 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      {/* Rank number */}
                      <div className="font-score text-2xl leading-none text-muted-foreground/50 shrink-0 w-9 text-center">
                        {e.rank}
                      </div>

                      {/* Dual mini avatar */}
                      <div className="relative h-7 w-10 shrink-0">
                        {/* Partner avatar (back) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full ring-[1.5px] ring-card overflow-hidden bg-gradient-to-br from-rose-300 to-pink-500 flex items-center justify-center">
                          {e.top_partner_avatar ? (
                            <img src={e.top_partner_avatar} alt={e.top_partner_name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-white text-[8px] font-bold">
                              {(e.top_partner_name?.[0] || '?').toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* User avatar (front) */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full ring-[1.5px] ring-card overflow-hidden bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center z-10">
                          {e.avatar_url ? (
                            <img src={e.avatar_url} alt={e.username} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-white text-[9px] font-bold">
                              {(e.username?.[0] || '?').toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Names */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {e.top_partner_name || e.username}
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          @{e.username} · {e.total_posts} posts
                      </div>
                    </div>
                    </Link>

                    {/* Score */}
                    <div className="font-score text-2xl leading-none relative overflow-hidden h-[24px] shrink-0" style={{ color: scoreColor(e.average_score) }}>
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={e.average_score}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -14 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <AnimatedNumber value={e.average_score} instant={true} />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Rank change indicator */}
                    {typeof (e as any).rank_change === 'number' && (e as any).rank_change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-[10px] font-bold shrink-0 ${(e as any).rank_change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(e as any).rank_change > 0
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />
                        }
                        {Math.abs((e as any).rank_change)}
                      </div>
                    )}
                  </motion.li>
                ))}
              </motion.ol>
            )}
          </>
        )}
      </div>

      {/* Pinned self + rival */}
      {myEntry && myRank && (
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="fixed inset-x-0 bottom-[100px] sm:bottom-[120px] z-30 flex flex-col items-center gap-2 px-4 pointer-events-none"
        >
          {/* Rival callout — appears just above the self bar */}
          {rivalEntry && pointsGap && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="pointer-events-auto mb-1"
            >
              <div className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 backdrop-blur-md px-4 py-1.5 text-[10px] shadow-[0_0_12px_-2px_rgba(199,169,107,0.15)]">
                <Trophy className="h-3 w-3 text-gold" />
                <span className="text-muted-foreground">
                  <span className="text-gold font-bold">@{rivalEntry.username}</span> is <span className="text-gold font-bold">{pointsGap} pts</span> ahead of you
                </span>
                <span className="text-[9px] text-muted-foreground">— one post closes the gap</span>
              </div>
            </motion.div>
          )}

          <div className="pointer-events-auto w-fit min-w-[320px] max-w-full rounded-3xl glass-dock p-4 flex items-center justify-between gap-4">
            <div className="font-score text-2xl text-blush shrink-0" style={{ width: 44 }}>
              #{myRank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">You · {myEntry.top_partner_name || profile?.username}</div>
              <div className="text-xs text-muted-foreground truncate">
                {myEntry.total_posts} posts · {rivalEntry ? `${pointsGap} pts to #${rivalEntry.rank}` : 'keep climbing'}
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

'use client';

import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/ui/StoryCard';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

import { Heart, Sparkles, TrendingUp, Trophy, ArrowRight, Lock, EyeOff, Users, Globe, Crown, Flame, Gift, PlusCircle } from 'lucide-react';
import { InstallAppButton } from '@/components/ui/InstallAppButton';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { usePosts } from '@/lib/hooks/usePosts';
import { useStreak, useClaimPerk } from '@/lib/hooks/useStreak';
import type { StreakData } from '@/lib/hooks/useStreak';
import { useUser } from '@/components/providers/AuthProvider';
import { useAnonymousMode } from '@/components/providers/AnonymousModeProvider';
import { ConfessionsFeed } from '@/components/confessions/ConfessionsFeed';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageBell } from '@/components/ui/PageBell';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Post } from '@/types/database';

async function fetchExplorePosts(): Promise<Post[]> {
  const res = await fetch('/api/posts/explore');
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

async function fetchCircleFeed(): Promise<Post[]> {
  const res = await fetch('/api/posts/circle-feed');
  if (!res.ok) throw new Error('Failed to fetch circle feed');
  const json = await res.json();
  return json.data || [];
}

export default function DashboardPage() {
  const { isAnonymousMode } = useAnonymousMode();

  const [feedTab, setFeedTab] = useState<'global' | 'circles'>('global');
  const [hasCircles, setHasCircles] = useState(false);
  const { data: posts, isLoading } = useQuery({
    queryKey: ['explore-posts'],
    queryFn: fetchExplorePosts,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30000,
    enabled: feedTab === 'global',
  });

  const { data: circlePosts, isLoading: circleLoading } = useQuery({
    queryKey: ['circle-feed'],
    queryFn: fetchCircleFeed,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30000,
    enabled: feedTab === 'circles',
  });

  // Check if user has any circles (to show/hide the Circles tab)
  useEffect(() => {
    fetch('/api/circles')
      .then(r => r.json())
      .then(data => {
        const hasAny = data.success && data.data?.length > 0;
        setHasCircles(hasAny);
        if (!hasAny && feedTab === 'circles') setFeedTab('global');
      })
      .catch(() => {});
  }, []);

  const { user, profile, loading: authLoading } = useUser();
  const router = useRouter();

  // Redirect to onboarding only for users who explicitly haven't onboarded
  // null = old user (skip), false = new signup (redirect), true = completed
  useEffect(() => {
    if (!authLoading && profile && profile.has_onboarded === false) {
      // Double check: if user already has posts or partners, skip onboarding
      fetch('/api/partners').then(r => r.json()).then(data => {
        if (!data.data || data.data.length === 0) {
          router.replace('/onboarding');
        }
      }).catch(() => {});
    }
  }, [authLoading, profile, router]);

  const [activeInsight, setActiveInsight] = useState(0);
  
  const handleInsightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setActiveInsight(Math.round(scrollLeft / width));
  };

  const { data: globalEntries } = useLeaderboard({ type: 'global', limit: 10 });
  const { data: myPosts } = usePosts(user?.id);
  const topScorer = globalEntries?.[0];
  const displayUsername = topScorer?.username ? `@${topScorer.username}` : '@anonymous';
  const displayInitial = (topScorer?.full_name?.[0] || topScorer?.username?.[0] || 'A').toUpperCase();

  // ─── Daily Engagement ──────────────────────────────────────────────────────
  const { data: streakData } = useStreak();
  const claimPerk = useClaimPerk();
  const { addToast } = useToast();

  const { data: dailyTop } = useQuery({
    queryKey: ['daily-leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboards/daily');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      return json.data as Array<{
        rank: number; id: string; score: number; rawScore: number;
        description: string; user: { username: string; avatar_url: string | null };
        partner: { name: string; emoji: string; avatar_url: string | null };
      }>;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const handleClaimPerk = () => {
    claimPerk.mutate(undefined, {
      onSuccess: (data) => {
        addToast(`🎁 You got: ${data.perk.emoji} ${data.perk.name}!`, 'success');
        if (data.mysticUnlocked) {
          addToast('🌀 Mystic badge unlocked! Collect all 7 fragments!', 'success');
        }
      },
      onError: (err: any) => {
        addToast(err.message || 'Post today first to claim your perk', 'warning');
      },
    });
  };

  // ─── Streak at risk — subtle evening reminder ─────────────────────────
  useEffect(() => {
    if (!streakData || streakData.streak <= 0) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    // Only show after 6pm if user hasn't posted today
    if (hour >= 18 && (!streakData.lastPostDate || streakData.lastPostDate !== todayStr)) {
      const timer = setTimeout(() => {
        addToast(
          `🔥 Your ${streakData.streak}-day streak is almost over. One post saves it.`,
          'warning',
          8000
        );
      }, 5000); // Delay so it doesn't compete with initial page load
      return () => clearTimeout(timer);
    }
  }, [streakData?.lastPostDate, streakData?.streak]);

  // Dynamic Ticker
  const dynamicTicker = globalEntries?.length
    ? globalEntries.map(e => `${e.username || 'Someone'} secured ${e.average_score} pts`) 
    : ['Loading global rankings...', 'Couples competing worldwide...'];

  // Dynamic Daily Prompt
  const PROMPTS = [
    "What was your favorite date this month?",
    "What's the smallest thing they did that made you smile?",
    "Describe your partner's love language in action.",
    "What's a mundane chore they turned into a fun memory?",
    "How did they surprise you recently?",
    "What's the most thoughtful gift they gave you?",
    "When did you realize they were 'the one' this week?"
  ];
  const dailyPrompt = PROMPTS[new Date().getDay() % PROMPTS.length];

  // Dynamic AI Insight (Sports Analytics)
  const globalAverage = globalEntries?.length 
    ? (globalEntries.reduce((acc, curr) => acc + curr.average_score, 0) / globalEntries.length).toFixed(1)
    : "0";
  const myScoredPosts = myPosts?.filter(p => p.ai_score) || [];
  const userScore = myScoredPosts.length > 0
    ? String(Math.round(myScoredPosts.reduce((acc, p) => acc + (p.ai_score || 0), 0) / myScoredPosts.length))
    : "0";

  // In anonymous mode, show the confessions feed instead (all hooks above are universal)
  if (isAnonymousMode) {
    return <ConfessionsFeed />;
  }

  return (
    <main className="w-full min-h-dvh bg-transparent">
      {/* Ticker at the very top */}
      <div className="overflow-hidden border-b border-border/50 bg-background/40 backdrop-blur-md py-3">
        <div className="flex w-max gap-12 whitespace-nowrap animate-marquee text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
          {[...dynamicTicker, ...dynamicTicker, ...dynamicTicker, ...dynamicTicker].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 pb-12">
        
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Feed
              </p>
              {/* Golden scope pill — single toggle */}
              <button
                onClick={() => setFeedTab((prev: string) => prev === 'global' ? 'circles' : 'global')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors touch-target ${
                  hasCircles
                    ? 'bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 active:bg-gold/20'
                    : 'bg-gold/5 border border-gold/10 text-gold/50'
                }`}
              >
                {feedTab === 'global' ? (
                  <Globe className="h-3.5 w-3.5" />
                ) : (
                  <Users className="h-3.5 w-3.5" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {feedTab === 'global' ? 'Global' : 'Bonds'}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <PageBell />
              <AnonymousToggle />
              <InstallAppButton />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl italic text-foreground tracking-tight mb-5">
            The Timeline
          </h1>
        </header>
        <ScrollToTop label="The Timeline" />

        {/* Dashboard Stats Row — 4 glass widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">

          {/* Widget 1: Your Score — linked to /profile */}
          <Link
            href="/profile"
            className="group rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent bg-card/40 backdrop-blur-sm p-5 flex flex-col hover:bg-card/60 active:bg-card/80 transition-all shadow-sm h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-primary shrink-0" />
              <span className="tracking-[0.2em] uppercase text-[10px] font-medium text-primary">Your Score</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-score text-3xl leading-none group-hover:scale-105 transition-transform origin-left" style={{ color: `rgb(var(--${parseFloat(userScore) >= 90 ? 'score-legendary' : parseFloat(userScore) >= 75 ? 'score-high' : parseFloat(userScore) >= 55 ? 'score-mid' : 'score-low'}))` }}>
                {userScore !== '0' ? userScore : '--'}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                avg · {myScoredPosts.length || 0} posts
              </span>
            </div>
            {globalEntries && globalEntries.length > 0 && (
              <div className="mt-auto pt-1.5 flex items-center justify-between text-[10px] border-t border-border/70">
                <span className="text-muted-foreground/85">vs {globalAverage} avg</span>
                <span className={`font-medium ${parseFloat(userScore) > parseFloat(globalAverage) ? 'text-success' : 'text-destructive'}`}>
                  {parseFloat(userScore) > parseFloat(globalAverage) ? '↑ Above' : '↓ Below'}
                </span>
              </div>
            )}
          </Link>

          {/* Widget 2: Streak & Perk */}
          {streakData ? (
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-warning/[0.08] via-transparent to-transparent bg-card/40 backdrop-blur-sm p-5 flex flex-col transition-all shadow-sm h-full">
              <div className="flex items-center gap-2 mb-2">
                <Flame className={`h-3 w-3 shrink-0 ${streakData.streak > 0 ? 'text-warning' : 'text-muted-foreground/40'}`} />
                <span className="tracking-[0.2em] uppercase text-[10px] font-medium text-warning">Streak</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-score text-3xl leading-none text-foreground">{streakData.streak}d</span>
                {streakData.multiplierPercent > 0 && (
                  <span className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">+{streakData.multiplierPercent}%</span>
                )}
              </div>
              {streakData.nextBadge && (
                <div className="text-[10px] text-muted-foreground/85 flex items-center gap-1.5 mt-1">
                  <span>{streakData.nextBadge.emoji}</span>
                  <span className="truncate">{streakData.nextBadge.name} — {streakData.nextBadge.streakRequired - streakData.streak}d away</span>
                </div>
              )}
              <div className="mt-auto pt-1.5">
                {streakData.canClaimPerk ? (
                  <button
                    onClick={handleClaimPerk}
                    disabled={claimPerk.isPending}
                    className="w-full rounded-full glass-btn-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_-4px_rgb(var(--gold)/0.4)] disabled:opacity-60"
                  >
                    <Gift className="h-3 w-3 inline mr-1" />
                    {claimPerk.isPending ? 'Claiming...' : '🎁 Daily Perk'}
                  </button>
                ) : (
                  <Link
                    href="/posts/new"
                    className="block text-[10px] text-muted-foreground/70 hover:text-muted-foreground/85 text-center py-1.5 border border-dashed border-border/70 hover:border-border/80 rounded-full uppercase tracking-[0.15em] transition-colors"
                  >
                    Post today to unlock →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-warning/[0.08] via-transparent to-transparent bg-card/40 backdrop-blur-sm p-5 flex items-center justify-center shadow-sm h-full">
              <span className="text-[10px] text-muted-foreground/75 uppercase tracking-[0.2em]">Loading streak...</span>
            </div>
          )}

          {/* Widget 3: Daily Winner — linked to winning post */}
          {dailyTop && dailyTop.length > 0 && (
            <Link
              href={`/posts/${dailyTop[0]?.id}`}
              className="group rounded-2xl border border-border/70 bg-gradient-to-br from-gold/[0.08] via-transparent to-transparent bg-card/40 backdrop-blur-sm p-5 flex flex-col hover:bg-card/60 active:bg-card/80 transition-all shadow-sm h-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-3 w-3 text-gold shrink-0" />
                <span className="tracking-[0.2em] uppercase text-[10px] font-medium text-gold">Daily Winner</span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0 leading-none">🏆</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {dailyTop[0]?.user?.username || 'Anonymous'}
                  </p>
                  <p className="text-[10px] text-muted-foreground/85 truncate leading-tight">
                    &ldquo;{dailyTop[0]?.description?.slice(0, 35)}&rdquo;
                  </p>
                </div>
                <span className="font-score text-xl text-gold shrink-0 tabular-nums">{dailyTop[0]?.score}</span>
              </div>
              <div className="mt-auto pt-1.5 border-t border-border/70 flex justify-end">
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/75 group-hover:text-gold/70 transition-colors font-medium">
                  View post →
                </span>
              </div>
            </Link>
          )}

          {/* Widget 4: Today's Pulse — linked to /leaderboards */}
          <Link
            href="/leaderboards"
            className="group rounded-2xl border border-border/70 bg-gradient-to-br from-success/[0.08] via-transparent to-transparent bg-card/40 backdrop-blur-sm p-5 flex flex-col hover:bg-card/60 active:bg-card/80 transition-all shadow-sm h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3 w-3 text-success shrink-0" />
              <span className="tracking-[0.2em] uppercase text-[10px] font-medium text-success">Today&apos;s Pulse</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-score text-3xl leading-none text-foreground tabular-nums">
                {dailyTop?.length || globalEntries?.length || '--'}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">stories today</span>
                {dailyTop && dailyTop.length > 0 && (
                  <span className="text-[10px] text-muted-foreground/75 uppercase tracking-[0.15em]">
                    avg {dailyTop.reduce((s, e) => s + (e.score || 0), 0) / dailyTop.length}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-auto pt-1.5 border-t border-border/70 flex justify-end">
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/75 group-hover:text-success/70 transition-colors font-medium">
                Full Board →
              </span>
            </div>
          </Link>

        </div>

        {feedTab === 'global' ? (isLoading ? (
          <div className="py-8">
            <Skeleton variant="card" count={3} />
          </div>
        ) : !posts || posts.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="The board is bare."
            description="Someone has to set the standard. Make it you."
            action={{ label: 'Claim your first verdict', href: '/posts/new' }}
          />
        ) : (
          <>
            {/* Editorial Widgets Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Daily Prompt */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="tracking-[0.2em] uppercase text-[10px] font-medium text-primary">Daily Prompt</span>
                  </div>
                  <p className="font-display text-lg md:text-xl italic text-foreground mb-6 leading-snug font-light">{dailyPrompt}</p>
                </div>
                <Link
                  href="/posts/new"
                  className="inline-flex w-full sm:w-max items-center justify-center gap-1.5 rounded-full glass-btn px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Answer Now <TrendingUp className="w-3 h-3" />
                </Link>
              </div>

              {/* AI Insight Carousel — 6 dynamic cards */}
              <div className="col-span-1 rounded-2xl border border-border bg-card overflow-hidden relative shadow-sm h-full min-h-[160px]">
                <div
                  className="flex overflow-x-auto snap-x snap-mandatory h-full w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  onScroll={handleInsightScroll}
                >
                  {/* Card 1: Global Insight */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="tracking-[0.2em] uppercase text-[10px] font-bold text-primary">Insight</span>
                      </div>
                    </div>
                    <p className="font-display text-lg md:text-xl italic text-foreground/90 leading-snug font-light">
                      {posts && posts.length > 0
                        ? `Couples who post weekly maintain a ${(parseFloat(globalAverage) > 0 ? ((parseFloat(userScore || '50') / parseFloat(globalAverage || '50')) * 30).toFixed(0) : 30)}% higher romance score on average.`
                        : "Couples who post weekly maintain a 30% higher romance score. You're one story away from the data set."}
                    </p>
                  </div>

                  {/* Card 2: System Warning — dynamic based on user's percentile */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-destructive/5 dark:bg-destructive/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                        <span className="tracking-[0.2em] uppercase text-[10px] font-bold text-destructive">System Warning</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-score text-4xl text-destructive mb-1 leading-none drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        {posts && posts.length > 0 && globalEntries && globalEntries.length > 0
                          ? (() => {
                              const userRank = globalEntries.findIndex(e => e.user_id === (posts[0]?.user_id || ''));
                              return userRank > globalEntries.length * 0.75 ? 'Btm 25%' : userRank === -1 ? 'Unranked' : 'Mid';
                            })()
                          : '--'}
                      </div>
                      <p className="font-display text-sm text-foreground/80 dark:text-foreground/80 italic leading-snug">
                        {posts && posts.length === 0
                          ? "Zero posts detected. The algorithm has nothing to work with. Submit or remain invisible."
                          : globalEntries && globalEntries.length > 0
                            ? (() => {
                                const yourScore = parseFloat(userScore || '0');
                                const avg = parseFloat(globalAverage || '0');
                                return yourScore < avg
                                  ? "Your romance metrics lag behind the global curve. The algorithm demands effort."
                                  : "Your recent activity is noted. The algorithm is watching — don't slip now.";
                              })()
                            : "Insufficient data to rank you. The algorithm demands a larger sample size."}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: AI Oracle — dynamic prediction */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-gradient-to-br from-primary/5 via-primary/[0.03] to-gold/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary/70" />
                        <span className="tracking-[0.2em] uppercase text-[10px] font-medium text-primary/70">AI Oracle</span>
                      </div>
                    </div>
                    <div className="relative mt-auto">
                      <div className="absolute -left-2 -top-3 text-5xl text-primary/20 font-serif">&quot;</div>
                      <p className="font-display text-lg text-foreground font-light italic leading-snug pl-4">
                        {(() => {
                          const recentPostCount = posts?.filter(p => {
                            const d = new Date(p.created_at);
                            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return d > weekAgo;
                          }).length || 0;
                          const prob = recentPostCount >= 5 ? 87 : recentPostCount >= 3 ? 62 : recentPostCount >= 1 ? 41 : 12;
                          return (
                            <>Based on sentiment, there is an <span className="text-primary font-bold not-italic">{prob}% probability</span> of a romantic gesture {recentPostCount > 0 ? 'tonight' : 'this week'}.</>
                          );
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Head-to-Head — real data comparison */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-center border-r border-border relative bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="tracking-[0.2em] uppercase text-[10px] font-bold text-primary">Head-to-Head</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>Your Average Score</span>
                          <span className="text-primary font-bold">{userScore !== '0' ? userScore : '--'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (parseFloat(userScore || '0') / 100) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>Global Top 10 Average</span>
                          <span>{globalAverage}</span>
                        </div>
                        <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                          <div className="h-full bg-muted-foreground/20 transition-all" style={{ width: `${Math.min(100, (parseFloat(globalAverage || '0') / 100) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Forecast — dynamic based on score trend */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-gradient-to-br from-elevated via-card to-warning/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-warning text-[10px]">⛅</span>
                        <span className="tracking-[0.2em] uppercase text-[10px] font-bold text-warning">Forecast</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="text-5xl drop-shadow-md">
                        {(() => {
                          const recent = posts?.filter(p => p.ai_score).slice(0, 3) || [];
                          if (recent.length < 2) return '🌤️';
                          const trend = (recent[0]?.ai_score || 0) - (recent[recent.length - 1]?.ai_score || 0);
                          return trend > 5 ? '☀️' : trend > 0 ? '🌤️' : trend > -5 ? '🌩️' : '⛈️';
                        })()}
                      </div>
                      <div>
                        <p className="font-display text-lg text-foreground dark:text-foreground font-light leading-tight mb-1">
                          {(() => {
                            const recent = posts?.filter(p => p.ai_score).slice(0, 3) || [];
                            if (recent.length < 2) return 'Not enough data...';
                            const trend = (recent[0]?.ai_score || 0) - (recent[recent.length - 1]?.ai_score || 0);
                            return trend > 5 ? 'Strong upward trend' : trend > 0 ? 'Steady improvement' : trend > -5 ? 'Minor dip detected' : 'Sharp decline — act now';
                          })()}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-warning">
                          {posts?.filter(p => p.ai_score).length || 0} scored posts analyzed
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 6: LIVE Commentary — sports-style narration */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between relative bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                        </span>
                        <span className="tracking-[0.2em] uppercase text-[10px] font-bold text-destructive">LIVE</span>
                      </div>
                    </div>
                    <p className="font-display text-base md:text-lg italic text-foreground/90 leading-snug font-light">
                      {!posts || posts.length === 0
                        ? "The board sits empty. No scores. No rankings. One post changes everything."
                        : topScorer
                          ? `${displayUsername.split('@')[1] || displayUsername} holds #1 at ${topScorer.average_score} pts. ${globalEntries && globalEntries.length > 1 ? `${globalEntries[1]?.username || 'The field'} trails by ${((topScorer.average_score - (globalEntries[1]?.average_score || 0))).toFixed(1)} pts.` : ''}`
                          : "The global feed is live. Every post shifts the leaderboard. Stay relevant."
                      }
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                      <div className="text-center">
                        <div className="font-score text-lg text-foreground">{posts?.length || 0}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-score text-lg text-gold">{globalEntries?.length || 0}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Ranked</div>
                      </div>
                      <div className="text-center">
                        <div className="font-score text-lg text-primary">{globalAverage}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${activeInsight === idx ? 'w-5 bg-primary' : 'w-1.5 bg-black/20 dark:bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Top Mover (Cinematic Spotlight) */}
              <Link href="/leaderboards" className="col-span-1 rounded-2xl border border-border bg-card overflow-hidden relative shadow-sm h-full min-h-[160px] flex flex-col justify-end p-5 group cursor-pointer">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 dark:opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 dark:from-background dark:via-background/80 to-transparent" />

                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 transition-all duration-300 z-20">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-1 shadow-xl touch-target">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="tracking-[0.3em] uppercase text-[10px] font-bold text-warning drop-shadow-md">The Spotlight</span>
                    <Trophy className="h-3 w-3 text-warning drop-shadow-md" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-display text-3xl text-black dark:text-foreground font-light italic leading-none mb-1.5 drop-shadow-sm dark:drop-shadow-lg group-hover:scale-[1.02] group-focus-within:scale-[1.02] transition-transform origin-left">{displayUsername}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-success drop-shadow-sm dark:drop-shadow-md">
                        {topScorer ? `Secured ${topScorer.average_score} Points` : 'Taking the Lead'}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-warning/50 bg-black/5 dark:bg-black/50 backdrop-blur-md grid place-items-center font-display text-lg text-warning">{displayInitial}</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Today's Best — Daily Leaderboard */}
            <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
            {posts.map((post) => {
              const story = {
                id: post.id,
                username: post.profile?.username ? `@${post.profile.username}` : '@anonymous',
                partnerNickname: post.partner?.name || 'partner',
                city: post.post_city || post.profile?.city || '',
                country: post.post_city || post.profile?.city || '',
                headline: post.description || '',
                score: post.ai_score || 0,
                verdict: post.ai_feedback || 'No feedback provided.',
                explanationStr: post.ai_explanation || null,
                reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                believable: 0,
                sus: 0,
                postedAt: formatRelativeTime(post.created_at),
                userAvatarUrl: post.profile?.avatar_url || null,
                partnerAvatarUrl: post.partner?.avatar_url || null,
                // Add real like data
                likes_count: post.likes_count || 0,
                has_liked: post.has_liked || false,
              };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "50px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  key={post.id} 
                  className="break-inside-avoid relative pb-6"
                >
                  <StoryCard story={story} post={post} />
                </motion.div>
              );
            })}
          </div>
          </>
        )) : null}

        {/* Circle Feed */}
        {feedTab === 'circles' && (
          <>
            {!hasCircles ? (
              <div className="text-center py-24 rounded-[2rem] border border-border bg-card/40 relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-gold/[0.03] blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-56 h-56 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-elevated border border-border flex items-center justify-center mx-auto mb-6">
                    <Users className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-3xl italic text-foreground mb-3">No Bonds Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-2">
                    Bonds are private groups where you and your friends share and compare love stories.
                  </p>
                  <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
                    Create a bond or join one with an invite code to see your friends' posts here.
                  </p>
                  <Link
                    href="/circles"
                    className="inline-flex items-center gap-2 mt-8 rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 active:opacity-80 transition-all uppercase tracking-wider"
                  >
                    <PlusCircle className="h-4 w-4" /> Create or Join a Bond
                  </Link>
                </div>
              </div>
            ) : circleLoading ? (
              <div className="flex justify-center py-32 min-h-[50vh] items-center">
                <Spinner size="lg" text={["LOADING BOND FEED...", "FETCHING FROM YOUR BONDS..."]} />
              </div>
            ) : !circlePosts || circlePosts.length === 0 ? (
              <div className="text-center py-20 rounded-3xl border border-border bg-card/40 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-elevated border border-border flex items-center justify-center mx-auto mb-5">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-2xl italic text-foreground mb-2">Your bonds are quiet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    No one in your bonds has posted yet. Be the first to share a story!
                  </p>
                  <Link
                    href="/posts/new"
                    className="inline-flex items-center gap-2 mt-6 rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 active:opacity-80 transition-all uppercase tracking-wider"
                  >
                    Share a Story
                  </Link>
                </div>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
                {circlePosts.map((post) => {
                  const story = {
                    id: post.id,
                    username: post.profile?.username ? `@${post.profile.username}` : '@anonymous',
                    partnerNickname: post.partner?.name || 'partner',
                    city: post.post_city || post.profile?.city || '',
                    country: post.post_city || post.profile?.city || '',
                    headline: post.description || '',
                    score: post.ai_score || 0,
                    verdict: post.ai_feedback || 'No feedback provided.',
                    explanationStr: post.ai_explanation || null,
                    reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                    believable: 0,
                    sus: 0,
                    postedAt: formatRelativeTime(post.created_at),
                    userAvatarUrl: post.profile?.avatar_url || null,
                    partnerAvatarUrl: post.partner?.avatar_url || null,
                    likes_count: post.likes_count || 0,
                    has_liked: post.has_liked || false,
                    comments_count: post.comments_count || 0,
                    views_count: post.views_count || 0,
                  };
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 30, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "50px" }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      key={post.id} 
                      className="break-inside-avoid relative pb-6"
                    >
                      <StoryCard story={story} post={post} />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}


function AnonymousToggle() {
  const { isAnonymousMode, toggleAnonymousMode } = useAnonymousMode();
  return (
    <button
      onClick={toggleAnonymousMode}
      className={`rounded-full border backdrop-blur-xl text-xs font-bold uppercase inline-flex items-center gap-1.5 touch-target flex-shrink-0 whitespace-nowrap transition-all p-2.5 sm:px-4 sm:py-2 ${
        isAnonymousMode
          ? 'bg-primary/15 border-primary/25 text-primary shadow-[var(--shadow-glow)]'
          : 'bg-white/10 dark:bg-white/5 border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 active:bg-white/30 dark:active:bg-white/20'
      }`}
      title={isAnonymousMode ? 'Switch to normal mode' : 'Switch to anonymous mode'}
    >
      {isAnonymousMode ? (
        <><Lock className="h-4 w-4 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Anonymous</span></>
      ) : (
        <><EyeOff className="h-4 w-4 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Anonymous</span></>
      )}
    </button>
  );
}

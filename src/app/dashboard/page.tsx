'use client';

import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/ui/StoryCard';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

import { Sparkles, TrendingUp, Lock, EyeOff, Users, Globe, Flame, Gift, PlusCircle } from 'lucide-react';
import { InstallAppButton } from '@/components/ui/InstallAppButton';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { usePosts } from '@/lib/hooks/usePosts';
import { useStreak, useClaimPerk } from '@/lib/hooks/useStreak';
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
  const res = await fetch('/api/posts/explore', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

async function fetchCircleFeed(): Promise<Post[]> {
  const res = await fetch('/api/posts/circle-feed', { cache: 'no-store' });
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
    gcTime: 0,
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

  const { data: globalEntries } = useLeaderboard({ type: 'global', limit: 10 });
  const { data: myPosts } = usePosts(user?.id);

  // ─── Daily Engagement ──────────────────────────────────────────────────────
  const { data: streakData } = useStreak();
  const claimPerk = useClaimPerk();
  const { addToast } = useToast();

  const { data: dailyTop } = useQuery({
    queryKey: ['daily-leaderboard'],
    queryFn: async () => {
      const tz = new Date().getTimezoneOffset();
      const res = await fetch(`/api/leaderboards/daily?tz=${tz}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      return json.data as Array<{
        rank: number; id: string; score: number; rawScore: number;
        description: string; user: { username: string; avatar_url: string | null };
        partner: { name: string; emoji: string; avatar_url: string | null };
      }>;
    },
    staleTime: 0,
    refetchOnMount: 'always',
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
        
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Feed
              </p>
              {/* Golden scope pill — always clickable */}
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <PageBell />
              <AnonymousToggle />
              <InstallAppButton />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl italic text-foreground tracking-tight mb-5">
            The Timeline
          </h1>
          {/* Feed scope tabs */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-muted/40 border border-border/50 w-fit">
            <button
              onClick={() => setFeedTab('global')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                feedTab === 'global'
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground active:text-foreground'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Global
            </button>
            <button
              onClick={() => setFeedTab('circles')}
              disabled={!hasCircles}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                feedTab === 'circles'
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : hasCircles
                    ? 'text-muted-foreground hover:text-foreground active:text-foreground'
                    : 'text-muted-foreground/40 cursor-not-allowed'
              }`}
            >
              <Users className="h-3.5 w-3.5" /> Bonds
            </button>
          </div>
        </header>
        <ScrollToTop label="The Timeline" />

        {/* Compact score + streak bar — merged into one line */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm px-4 py-2.5">
          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary">Score</span>
              <span className="font-score text-xl leading-none" style={{ color: `rgb(var(--${parseFloat(userScore) >= 90 ? 'score-legendary' : parseFloat(userScore) >= 75 ? 'score-high' : parseFloat(userScore) >= 55 ? 'score-mid' : 'score-low'}))` }}>
                {userScore !== '0' ? userScore : '--'}
              </span>
              <span className="text-[10px] text-muted-foreground">{myScoredPosts.length || 0} posts</span>
            </div>
            {/* Streak */}
            {streakData && streakData.streak > 0 && (
              <>
                <span className="text-muted-foreground/20">|</span>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-warning" />
                  <span className="text-xs font-medium text-foreground">{streakData.streak}d</span>
                  {streakData.multiplierPercent > 0 && (
                    <span className="text-[10px] text-gold font-medium">+{streakData.multiplierPercent}%</span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {globalEntries && globalEntries.length > 0 && (
              <span className="text-[10px] text-muted-foreground/60">
                vs {globalAverage} avg {parseFloat(userScore) > parseFloat(globalAverage) ? '↑' : '↓'}
              </span>
            )}
            {streakData?.canClaimPerk && (
              <button
                onClick={handleClaimPerk}
                disabled={claimPerk.isPending}
                className="inline-flex items-center gap-1 rounded-full glass-btn-gold px-2.5 py-1 text-[9px] font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                <Gift className="h-2.5 w-2.5" />
                Perk
              </button>
            )}
          </div>
        </div>

        {/* Today's Best — top post badge */}
        {dailyTop && dailyTop.length > 0 && feedTab === 'global' && (
          <div className="mb-4 rounded-2xl border border-gold/20 bg-gold/[0.03] backdrop-blur-sm p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">🏆</span>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest font-bold text-gold mb-0.5">Today&apos;s Best</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {dailyTop[0]?.user?.username || 'Anonymous'} · <span className="text-gold font-score text-base">{dailyTop[0]?.score}</span>
                </p>
              </div>
            </div>
            <Link
              href={`/posts/${dailyTop[0]?.id}`}
              className="shrink-0 text-[9px] uppercase tracking-widest text-gold/60 hover:text-gold transition-colors ml-3"
            >
              View →
            </Link>
          </div>
        )}

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
            {/* Posts feed — widgets interleaved after 2nd post */}
            <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
            {posts.map((post, idx) => {
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

          {/* Daily Prompt — below posts */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <p className="font-display text-base italic text-foreground leading-snug font-light">{dailyPrompt}</p>
            </div>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-1.5 rounded-full glass-btn px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Answer <TrendingUp className="w-3 h-3" />
            </Link>
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
      className={`rounded-full border px-2.5 sm:px-4 py-2 text-xs font-bold uppercase backdrop-blur transition-colors inline-flex items-center gap-1.5 touch-target flex-shrink-0 whitespace-nowrap ${
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

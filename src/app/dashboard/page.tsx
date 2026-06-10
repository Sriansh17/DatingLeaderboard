'use client';

import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/ui/StoryCard';
import { Spinner } from '@/components/ui/Spinner';
import { motion } from 'framer-motion';

import { Heart, Sparkles, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import { InstallAppButton } from '@/components/ui/InstallAppButton';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useUser } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

import { formatRelativeTime } from '@/lib/utils/format';
import type { Post } from '@/types/database';

async function fetchExplorePosts(): Promise<Post[]> {
  const res = await fetch('/api/posts/explore');
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

export default function DashboardPage() {

  const { data: posts, isLoading } = useQuery({
    queryKey: ['explore-posts'],
    queryFn: fetchExplorePosts,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { profile, loading: authLoading } = useUser();
  const router = useRouter();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!authLoading && profile && profile.has_onboarded === false) {
      router.replace('/onboarding');
    }
  }, [authLoading, profile, router]);

  const [activeInsight, setActiveInsight] = useState(0);
  
  const handleInsightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setActiveInsight(Math.round(scrollLeft / width));
  };

  const { data: globalEntries } = useLeaderboard({ type: 'global', limit: 10 });
  const topScorer = globalEntries?.[0];
  const displayUsername = topScorer?.username ? `@${topScorer.username}` : '@anonymous';
  const displayInitial = (topScorer?.full_name?.[0] || topScorer?.username?.[0] || 'A').toUpperCase();
  
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
  // User's own score from their posts
  const userScore = posts?.length
    ? (posts.filter(p => p.ai_score).reduce((acc, p) => acc + (p.ai_score || 0), 0) / posts.filter(p => p.ai_score).length).toFixed(1)
    : "0";


  return (
    <main className="w-full min-h-screen bg-transparent">
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

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 pb-32">
        
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm uppercase tracking-[0.25em] text-gold flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Global Feed
            </p>
            <InstallAppButton />
          </div>
          <h1 className="font-display text-5xl md:text-6xl italic text-foreground tracking-tight">
            The Timeline
          </h1>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-32 min-h-[50vh] items-center">
            <Spinner size="lg" text={["SYNCING TIMELINE...", "INITIALIZING FOND...", "LOADING ARCHIVES..."]} />
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-32 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-display italic text-foreground mb-4">
              The board is bare.
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
              Someone has to set the standard. Make it you.
            </p>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
            >
              Claim your first verdict
            </Link>
          </div>
        ) : (
          <>
            {/* Editorial Widgets Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Daily Prompt */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-primary">Daily Prompt</span>
                  </div>
                  <p className="font-display text-lg md:text-xl italic text-foreground mb-6 leading-snug font-light">{dailyPrompt}</p>
                </div>
                <Link href="/posts/new" className="inline-flex w-max items-center justify-center gap-1.5 rounded-full border border-primary/20 dark:border-border bg-primary/5 dark:bg-white/5 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary dark:text-foreground transition-all hover:bg-primary/10 dark:hover:bg-white/10 dark:hover:border-white/20">
                  Answer Now <TrendingUp className="w-2.5 h-2.5 text-primary" />
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
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-primary">Insight</span>
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
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-red-500">System Warning</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-score text-4xl text-red-500 mb-1 leading-none drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
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
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-gradient-to-br from-fuchsia-100/50 via-purple-100/30 to-blue-100/50 dark:from-fuchsia-900/30 dark:via-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-fuchsia-500 dark:text-fuchsia-400" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-fuchsia-500 dark:text-fuchsia-400">AI Oracle</span>
                      </div>
                    </div>
                    <div className="relative mt-auto">
                      <div className="absolute -left-2 -top-3 text-5xl text-fuchsia-500/20 font-serif">&quot;</div>
                      <p className="font-display text-lg text-foreground dark:text-foreground font-light italic leading-snug pl-4">
                        {(() => {
                          const recentPostCount = posts?.filter(p => {
                            const d = new Date(p.created_at);
                            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return d > weekAgo;
                          }).length || 0;
                          const prob = recentPostCount >= 5 ? 87 : recentPostCount >= 3 ? 62 : recentPostCount >= 1 ? 41 : 12;
                          return (
                            <>Based on sentiment, there is an <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold not-italic">{prob}% probability</span> of a romantic gesture {recentPostCount > 0 ? 'tonight' : 'this week'}.</>
                          );
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Head-to-Head — real data comparison */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-center border-r border-border relative bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-blue-500 dark:text-blue-400">Head-to-Head</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>Your Average Score</span>
                          <span className="text-blue-500 dark:text-blue-400 font-bold">{userScore !== '0' ? userScore : '--'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all" style={{ width: `${Math.min(100, (parseFloat(userScore || '0') / 100) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>Global Top 10 Average</span>
                          <span>{globalAverage}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-black/20 dark:bg-white/20 transition-all" style={{ width: `${Math.min(100, (parseFloat(globalAverage || '0') / 100) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Forecast — dynamic based on score trend */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-gradient-to-br from-slate-200 via-slate-100 to-amber-100 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 dark:text-amber-400 text-[10px]">⛅</span>
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-amber-500 dark:text-amber-400">Forecast</span>
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
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
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
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-red-500">LIVE</span>
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
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-score text-lg text-gold">{globalEntries?.length || 0}</div>
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground">Ranked</div>
                      </div>
                      <div className="text-center">
                        <div className="font-score text-lg text-primary">{globalAverage}</div>
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground">Avg Score</div>
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

                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xl">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="tracking-[0.3em] uppercase text-[8px] font-bold text-amber-600 dark:text-gold drop-shadow-md">The Spotlight</span>
                    <Trophy className="h-3 w-3 text-amber-600 dark:text-gold drop-shadow-md" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-display text-3xl text-black dark:text-foreground font-light italic leading-none mb-1.5 drop-shadow-sm dark:drop-shadow-lg group-hover:scale-[1.02] transition-transform origin-left">{displayUsername}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-md">
                        {topScorer ? `Secured ${topScorer.average_score} Points` : 'Taking the Lead'}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-amber-600/50 dark:border-gold/50 bg-black/5 dark:bg-black/50 backdrop-blur-md grid place-items-center font-display text-lg text-amber-600 dark:text-gold shadow-[0_0_15px_rgba(217,119,6,0.3)] dark:shadow-[0_0_15px_rgba(233,200,106,0.4)]">{displayInitial}</div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
            {posts.map((post) => {
              const story = {
                id: post.id,
                username: post.profile?.username ? `@${post.profile.username}` : '@anonymous',
                partnerNickname: post.partner?.name || 'partner',
                city: post.post_city || post.profile?.city || '',
                country: (post.profile as any)?.country || '',
                headline: post.description || '',
                score: post.ai_score || 0,
                verdict: post.ai_feedback || 'No feedback provided.',
                explanationStr: post.ai_explanation || null,
                reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                believable: 0,
                sus: 0,
                postedAt: formatRelativeTime(post.created_at),
                userAvatarUrl: post.profile?.avatar_url || null,
                partnerAvatarUrl: (post.partner as any)?.avatar_url || null,
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
                  <StoryCard story={story} />
                </motion.div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </main>
  );
}

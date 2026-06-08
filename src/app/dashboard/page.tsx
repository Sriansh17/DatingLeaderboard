'use client';

import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/ui/StoryCard';
import { Spinner } from '@/components/ui/Spinner';
import { motion } from 'framer-motion';

import { Heart, Sparkles, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';

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
          <p className="text-sm uppercase tracking-[0.25em] text-gold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Global Feed
          </p>
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
              The feed is empty
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
              Be the first to share an appreciation post and set the global standard!
            </p>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
            >
              Share Your First Post
            </Link>
          </div>
        ) : (
          <>
            {/* Editorial Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Daily Prompt */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-primary">Daily Prompt</span>
                  </div>
                  <p className="font-display text-lg md:text-xl italic text-foreground mb-6 leading-snug font-light">{dailyPrompt}</p>
                </div>
                <Link href="/posts/new" className="inline-flex w-max items-center justify-center gap-1.5 rounded-full border border-primary/20 dark:border-white/10 bg-primary/5 dark:bg-white/5 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary dark:text-white transition-all hover:bg-primary/10 dark:hover:bg-white/10 dark:hover:border-white/20">
                  Answer Now <TrendingUp className="w-2.5 h-2.5 text-primary" />
                </Link>
              </div>

              {/* AI Insight (Carousel of Options) */}
              <div className="col-span-1 rounded-2xl border border-border bg-card overflow-hidden relative shadow-sm h-full min-h-[160px]">
                <div 
                  className="flex overflow-x-auto snap-x snap-mandatory h-full w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  onScroll={handleInsightScroll}
                >
                  
                  {/* Option 1: Original Insight */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-primary">Insight</span>
                      </div>
                    </div>
                    <p className="font-display text-lg md:text-xl italic text-foreground/90 leading-snug font-light">
                      Couples who post weekly maintain a 30% higher romance score.
                    </p>
                  </div>

                  {/* Option 2: Brutal AI Warning */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-destructive/5 dark:bg-destructive/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-red-500">System Warning</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-score text-4xl text-red-500 mb-1 leading-none drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">Btm 10%</div>
                      <p className="font-display text-sm text-foreground/80 dark:text-white/80 italic leading-snug">
                        Your spontaneity rating has flatlined. The AI strongly suggests booking a flight.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: The Mystical Prediction */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-gradient-to-br from-fuchsia-100/50 via-purple-100/30 to-blue-100/50 dark:from-fuchsia-900/30 dark:via-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-fuchsia-500 dark:text-fuchsia-400" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-fuchsia-500 dark:text-fuchsia-400">AI Oracle</span>
                      </div>
                    </div>
                    <div className="relative mt-auto">
                      <div className="absolute -left-2 -top-3 text-5xl text-fuchsia-500/20 font-serif">&quot;</div>
                      <p className="font-display text-lg text-foreground dark:text-white font-light italic leading-snug pl-4">
                        Based on sentiment, there is an <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold not-italic">87% probability</span> of a romantic gesture tonight.
                      </p>
                    </div>
                  </div>

                  {/* Option 4: Sports Analytics */}
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
                          <span className="text-blue-500 dark:text-blue-400 font-bold">{userScore}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all" style={{ width: `${(parseFloat(userScore) / 10) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>Global Top 10 Average</span>
                          <span>{globalAverage}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-black/20 dark:bg-white/20 transition-all" style={{ width: `${(parseFloat(globalAverage) / 10) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Option 5: Relationship Weather */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between border-r border-border relative bg-gradient-to-br from-slate-200 via-slate-100 to-amber-100 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 dark:text-amber-400 text-[10px]">⛅</span>
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-amber-500 dark:text-amber-400">Forecast</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="text-5xl drop-shadow-md">🌩️</div>
                      <div>
                        <p className="font-display text-lg text-foreground dark:text-white font-light leading-tight mb-1">High tension this morning...</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Clearing up by dinner</p>
                      </div>
                    </div>
                  </div>

                  {/* Option 6: Vibe Check Meter */}
                  <div className="min-w-full snap-center p-5 pb-10 flex flex-col justify-between relative bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-pink-500" />
                        <span className="tracking-[0.2em] uppercase text-[9px] font-bold text-pink-500">Vibe Check</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center mt-auto">
                      {/* Fake half-circle meter */}
                      <div className="relative w-32 h-16 overflow-hidden mb-3">
                        <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[8px] border-black/5 dark:border-white/5 border-t-pink-500/80 border-l-pink-500/80 rotate-45" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-12 bg-foreground dark:bg-white rounded-t-full origin-bottom rotate-[60deg] shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground dark:bg-white rounded-full translate-y-1/2" />
                      </div>
                      <p className="font-score text-xl text-pink-500 uppercase tracking-widest drop-shadow-sm dark:drop-shadow-md">Simp Energy</p>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] mt-1">You liked 14 of their posts</p>
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
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 dark:from-black dark:via-black/80 to-transparent" />
                
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
                      <p className="font-display text-3xl text-black dark:text-white font-light italic leading-none mb-1.5 drop-shadow-sm dark:drop-shadow-lg group-hover:scale-[1.02] transition-transform origin-left">{displayUsername}</p>
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
                city: post.profile?.city || '',
                country: (post.profile as any)?.country || (post.profile as any)?.user_metadata?.country || '',
                headline: post.description || '',
                score: post.ai_score || 0,
                verdict: post.ai_feedback || 'No feedback provided.',
                explanationStr: post.ai_explanation || null,
                reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                believable: 0,
                sus: 0,
                postedAt: new Date(post.created_at).toLocaleDateString(),
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

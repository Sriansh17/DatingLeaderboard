'use client';

import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/ui/StoryCard';
import { tickerItems } from '@/lib/mock-data';
import { Heart, Sparkles, Calendar, TrendingUp, Trophy } from 'lucide-react';
import Link from 'next/link';
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

  return (
    <main className="w-full min-h-screen bg-background">
      {/* Ticker at the very top */}
      <div className="overflow-hidden border-b border-white/10 bg-black/60 backdrop-blur-md py-3">
        <div className="flex w-max gap-12 whitespace-nowrap animate-marquee text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E92B54] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E92B54]"></span>
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
          <div className="py-32 text-center animate-pulse">
            <Sparkles className="mx-auto h-12 w-12 text-gold mb-6 animate-spin-slow" />
            <p className="text-muted-foreground font-display italic text-2xl">Loading latest verdicts...</p>
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
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-3 w-3 text-[#ff3366]" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-[#ff3366]">Daily Prompt</span>
                  </div>
                  <p className="font-display text-lg md:text-xl italic text-foreground mb-6 leading-snug font-light">What was your favorite date this month?</p>
                </div>
                <Link href="/posts/new" className="inline-flex w-max items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10 hover:border-white/20">
                  Answer Now <TrendingUp className="w-2.5 h-2.5 text-[#E92B54]" />
                </Link>
              </div>

              {/* AI Insight */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-3 w-3 text-[#ffb6b6]" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-[#ffb6b6]">Insight</span>
                  </div>
                  <p className="font-display text-lg md:text-xl italic text-foreground/90 leading-snug font-light">
                    Couples who post weekly maintain a 30% higher romance score.
                  </p>
                </div>
              </div>

              {/* Top Mover */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-3 w-3 text-[#ffd700]" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-[#ffd700]">Top Mover</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="h-10 w-10 rounded-full border border-white/20 bg-transparent grid place-items-center font-display text-lg text-[#ffd700]">J</div>
                    <div>
                      <p className="font-display text-xl text-foreground font-light mb-0.5">@jessica</p>
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#00ff88] flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5"/> Up 42 ranks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {posts.map((post, index) => {
              const story = {
                id: post.id,
                username: post.profile?.username ? `@${post.profile.username}` : '@anonymous',
                partnerNickname: post.partner?.name || 'partner',
                city: post.profile?.city || 'Unknown City',
                country: post.profile?.country || 'Earth',
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
                <div key={post.id} className="break-inside-avoid">
                  <StoryCard story={story} />
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </main>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/ui/StoryCard';
import { Heart, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '@/types/database';

async function fetchExplorePosts(): Promise<Post[]> {
  const res = await fetch('/api/posts/explore');
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

async function fetchLeaderboard() {
  const res = await fetch('/api/leaderboards?type=global&limit=5');
  if (!res.ok) return [];
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

  const { data: leaderboard } = useQuery({
    queryKey: ['dashboard-leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  });

  // Compute real stats from posts
  const totalPosts = posts?.length || 0;
  const avgScore = totalPosts > 0
    ? Math.round((posts?.reduce((sum, p) => sum + (p.ai_score || 0), 0) || 0) / totalPosts)
    : 0;
  const topScorer = leaderboard?.[0];
  const latestPost = posts?.[0];

  return (
    <main className="w-full min-h-screen bg-background">
      {/* Live stats ticker */}
      {totalPosts > 0 && (
        <div className="overflow-hidden border-b border-border bg-secondary/50 py-3">
          <div className="flex w-max gap-12 whitespace-nowrap animate-marquee text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            {[
              `${totalPosts} posts shared`,
              `avg score: ${avgScore}/100`,
              topScorer ? `#1: ${topScorer.top_partner_name || topScorer.username} (${topScorer.average_score})` : '',
              latestPost ? `latest: "${latestPost.description?.slice(0, 30)}..."` : '',
              `${leaderboard?.length || 0} couples competing`,
            ].filter(Boolean).flatMap(t => [t, t, t]).map((t, i) => (
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
      )}

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
            <Sparkles className="mx-auto h-12 w-12 text-gold mb-6" />
            <p className="text-muted-foreground font-display italic text-2xl">Loading latest verdicts...</p>
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-32 rounded-3xl border border-border bg-card">
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
            {/* Real-time Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Latest Activity */}
              <div className="rounded-2xl border border-border bg-white p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-primary">Latest Post</span>
                  </div>
                  <p className="font-display text-lg italic text-foreground mb-4 leading-snug font-light line-clamp-2">
                    "{latestPost?.description?.slice(0, 80)}{(latestPost?.description?.length || 0) > 80 ? '...' : ''}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {latestPost?.profile?.username || 'someone'} · scored {latestPost?.ai_score || '?'}/100
                  </p>
                </div>
                <Link href="/posts/new" className="inline-flex w-max items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary/10 hover:border-primary/30 mt-4">
                  Share Yours <TrendingUp className="w-2.5 h-2.5 text-primary" />
                </Link>
              </div>

              {/* Community Stats */}
              <div className="rounded-2xl border border-border bg-white p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-3 w-3 text-accent" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-accent">Stats</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Posts</span>
                      <span className="font-score text-2xl text-foreground">{totalPosts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Score</span>
                      <span className="font-score text-2xl text-primary">{avgScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Couples</span>
                      <span className="font-score text-2xl text-gold">{leaderboard?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Scorer — real data */}
              <div className="rounded-2xl border border-border bg-white p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-3 w-3 text-gold" />
                    <span className="tracking-[0.2em] uppercase text-[9px] font-medium text-gold">#1 Global</span>
                  </div>
                  {topScorer ? (
                    <div className="flex items-center gap-4 mt-2">
                      <div className="h-10 w-10 rounded-full border border-border bg-secondary grid place-items-center font-display text-lg text-gold">
                        {topScorer.top_partner_emoji || '👑'}
                      </div>
                      <div>
                        <p className="font-display text-xl text-foreground font-light mb-0.5">
                          {topScorer.top_partner_name || topScorer.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by @{topScorer.username} · {topScorer.total_posts} posts · avg {topScorer.average_score}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No one yet — be the first!</p>
                  )}
                </div>
                <Link href="/leaderboards" className="inline-flex w-max items-center justify-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/10 mt-4">
                  View Leaderboard
                </Link>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {posts.map((post) => {
                const story = {
                  id: post.id,
                  username: post.profile?.username ? `@${post.profile.username}` : '@anonymous',
                  partnerNickname: post.partner?.name || 'partner',
                  city: post.profile?.city || '',
                  country: (post.profile as any)?.country || '',
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

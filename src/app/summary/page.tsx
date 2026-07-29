'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/components/providers/AuthProvider';
import { BackButton } from '@/components/ui/BackButton';
import { PageBell } from '@/components/ui/PageBell';
import { Spinner } from '@/components/ui/Spinner';
import { ScoreRing } from '@/components/ui/ScoreRing';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Flame, Sparkles } from 'lucide-react';

interface WeeklySummary {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  postCount: number;
  avgScore: number;
  scoreDelta: number | null;
  prevAvgScore: number | null;
  bestPost: {
    id: string;
    description: string;
    score: number;
    feedback: string;
    partner: any;
  } | null;
  worstPost: { id: string; score: number } | null;
  streak: number;
  longestStreak: number;
  aiInsight: { insight: string; theme: string } | null;
  posts: Array<{
    id: string;
    description: string;
    score: number;
    date: string;
    partner: any;
  }>;
}

async function fetchWeeklySummary(weekOffset: number): Promise<WeeklySummary> {
  const res = await fetch(`/api/summary/weekly?week=${weekOffset}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch summary');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
}

export default function SummaryPage() {
  const { user } = useUser();
  const [weekOffset, setWeekOffset] = useState(0);

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['weekly-summary', weekOffset],
    queryFn: () => fetchWeeklySummary(weekOffset),
    enabled: !!user,
    staleTime: 60000,
  });

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to see your weekly summary.</p>
          <Link href="/auth/login" className="rounded-full glass-btn px-5 py-2.5 text-sm font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-transparent py-6 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <PageBell />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold mb-1">Weekly Recap</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-4xl sm:text-5xl italic text-foreground">Your Week</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(w => w + 1)}
                className="w-8 h-8 rounded-full border border-border hover:bg-elevated active:bg-elevated/80 transition-colors flex items-center justify-center"
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground font-medium min-w-[120px] text-center">
                {summary?.weekLabel || 'Loading...'}
              </span>
              <button
                onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                disabled={weekOffset === 0}
                className="w-8 h-8 rounded-full border border-border hover:bg-elevated active:bg-elevated/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" text={["GENERATING YOUR RECAP..."]} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Failed to load summary. Try again later.</p>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* No posts state */}
            {summary.postCount === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="rounded-2xl border border-border bg-card/60 p-8 text-center"
              >
                <div className="text-4xl mb-4">📭</div>
                <h3 className="font-display text-xl italic text-foreground mb-2">Quiet week</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  No posts this week. Your relationship still happened — you just didn&apos;t log it.
                </p>
                <Link
                  href="/posts/new"
                  className="inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-sm font-semibold"
                >
                  Share a moment
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="grid grid-cols-3 gap-3"
                >
                  {/* Posts count */}
                  <div className="rounded-2xl border border-border bg-card/60 p-4 text-center">
                    <div className="font-score text-3xl text-foreground">{summary.postCount}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">Posts</div>
                  </div>
                  {/* Avg score */}
                  <div className="rounded-2xl border border-border bg-card/60 p-4 text-center">
                    <div className="font-score text-3xl text-gold">{summary.avgScore}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">Avg Score</div>
                    {summary.scoreDelta !== null && (
                      <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-medium ${summary.scoreDelta > 0 ? 'text-success' : summary.scoreDelta < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {summary.scoreDelta > 0 ? <TrendingUp className="h-3 w-3" /> : summary.scoreDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {summary.scoreDelta > 0 ? '+' : ''}{summary.scoreDelta} vs last week
                      </div>
                    )}
                  </div>
                  {/* Streak */}
                  <div className="rounded-2xl border border-border bg-card/60 p-4 text-center">
                    <div className="font-score text-3xl text-warning flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5" />
                      {summary.streak}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">Streak</div>
                  </div>
                </motion.div>

                {/* AI Insight */}
                {summary.aiInsight && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">AI Insight</span>
                      <span className="text-[10px] text-muted-foreground/60 ml-auto italic">#{summary.aiInsight.theme}</span>
                    </div>
                    <p className="font-display text-lg italic text-foreground leading-relaxed">
                      &ldquo;{summary.aiInsight.insight}&rdquo;
                    </p>
                  </motion.div>
                )}

                {/* Best post */}
                {summary.bestPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Link
                      href={`/posts/${summary.bestPost.id}`}
                      className="block rounded-2xl border border-gold/20 bg-gold/[0.03] p-5 hover:border-gold/40 active:border-gold/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Best Post</span>
                        <ScoreRing score={summary.bestPost.score} size={44} />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-2">
                        &ldquo;{summary.bestPost.description}&rdquo;
                      </p>
                      {summary.bestPost.feedback && (
                        <p className="text-xs text-muted-foreground italic">
                          {summary.bestPost.feedback}
                        </p>
                      )}
                    </Link>
                  </motion.div>
                )}

                {/* All posts this week */}
                {summary.posts.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="rounded-2xl border border-border bg-card/40 p-5"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">All Posts</p>
                    <div className="space-y-2">
                      {summary.posts.map((post, i) => (
                        <Link
                          key={post.id}
                          href={`/posts/${post.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-elevated/50 active:bg-elevated/70 transition-colors"
                        >
                          <span className="font-score text-sm text-muted-foreground/50 w-4 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate">{post.description}</p>
                            <p className="text-[10px] text-muted-foreground/60">
                              {post.partner?.emoji} {new Date(post.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                          </div>
                          <span className="font-score text-sm text-gold shrink-0">{post.score}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

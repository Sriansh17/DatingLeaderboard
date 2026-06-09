'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/lib/hooks/usePosts';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { formatRelativeTime } from '@/lib/utils/format';
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react';
import { ShareCard } from '@/components/posts/ShareCard';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/AuthProvider';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useToast } from '@/components/ui/Toast';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { addToast } = useToast();
  const { data: post, isLoading } = usePost(params.id as string);

  const { data: globalLeaderboard } = useLeaderboard({ type: 'global', limit: 100 });

  const authorRank = useMemo(() => {
    if (!globalLeaderboard || !post) return undefined;
    const entry = globalLeaderboard.find((e) => e.user_id === post.user_id);
    return entry?.rank;
  }, [globalLeaderboard, post]);

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    const supabase = createClient();
    await supabase.from('posts').delete().eq('id', params.id);
    addToast('Post deleted', 'success');
    router.push('/dashboard');
  };

  if (isLoading) return <Spinner size="lg" className="mx-auto mt-20" />;
  if (!post) return <div className="text-center py-20 text-gray-500">Post not found</div>;

  let breakdown: Record<string, number> = {};
  try {
    if (post.ai_explanation) breakdown = JSON.parse(post.ai_explanation);
  } catch {}

  return (
    <main className="min-h-screen bg-background relative px-4 sm:px-6 lg:px-8 pb-32">
      <div className="absolute top-8 left-6 sm:left-12">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group tracking-wide"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Feed
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pt-16">

      {/* Score Hero */}
      <div className="text-center py-10 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent blur-3xl -z-10" />
        <div className="flex justify-center mb-6">
          <ScoreRing score={post.ai_score || 0} size={120} />
        </div>
        
        {post.partner && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated border border-border mt-2">
            <span>{post.partner.emoji}</span>
            <span className="text-sm font-medium">with {post.partner.name}</span>
          </div>
        )}
        {authorRank && (
          <p className="text-sm text-gold font-medium mt-4 animate-pulse">
            Ranked #{authorRank} globally 🏆
          </p>
        )}
      </div>

      {/* AI Feedback */}
      {post.ai_feedback && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blush/20 to-transparent p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blush" />
              <span className="font-display tracking-widest uppercase text-xs font-bold text-blush">LoveScore AI Verdict</span>
            </div>
            <p className="font-display text-2xl italic leading-relaxed text-foreground">
              “{post.ai_feedback}”
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="rounded-3xl border border-border bg-card p-8">
        <h4 className="font-display tracking-widest uppercase text-[10px] font-bold text-muted-foreground mb-4">
          Original Story
        </h4>
        <p className="text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap">{post.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{formatRelativeTime(post.created_at)}</span>
          <span className="text-muted-foreground/30">•</span>
          <Badge variant={post.is_public ? 'success' : 'default'} className="bg-elevated border-border text-xs">
            {post.is_public ? 'Public Record' : 'Private Archive'}
          </Badge>
        </div>
      </div>

      {/* Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="font-display text-2xl italic text-foreground mb-6">Score Breakdown</h3>
          <div className="space-y-5">
            {Object.entries(breakdown).map(([key, value]) => {
              const max = getMax(key);
              const percentage = (value / max) * 100;
              return (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="font-score text-lg text-foreground leading-none">
                      {value} <span className="text-muted-foreground text-sm">/ {max}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-elevated rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
        <ShareCard post={post} rank={authorRank} />
        {user && post.user_id === user.id && (
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Delete Memory
          </button>
        )}
      </div>
      </div>
    </main>
  );
}

function getMax(key: string): number {
  const maxes: Record<string, number> = {
    thoughtfulness: 20,
    romance: 15,
    effort: 15,
    uniqueness: 10,
    emotional_impact: 10,
    ethical_boundaries: 15,
    genuineness: 10,
    equality: 10,
    safety: 5,
  };
  return maxes[key] || 15;
}

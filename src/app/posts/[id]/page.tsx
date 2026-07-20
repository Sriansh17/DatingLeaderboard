'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePost, useLikePost } from '@/lib/hooks/usePosts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { formatRelativeTime } from '@/lib/utils/format';
import { ArrowLeft, Sparkles, Archive, Heart, MessageCircle, Send, Share2, Pencil, SmilePlus } from 'lucide-react';
import { ShareCard } from '@/components/posts/ShareCard';
import { Spinner } from '@/components/ui/Spinner';
import { useUser } from '@/components/providers/AuthProvider';
import { useShare } from '@/components/providers/ShareProvider';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CommentCard } from '@/components/ui/CommentCard';
import { CommentInput } from '@/components/ui/CommentInput';
import type { Comment } from '@/types/database';
import { EditPostModal } from '@/components/posts/EditPostModal';
export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useUser();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const { openShare } = useShare();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: post, isLoading } = usePost(params.id as string);
  const likePostMutation = useLikePost();

  const { data: globalLeaderboard } = useLeaderboard({ type: 'global', limit: 100 });

  const authorRank = useMemo(() => {
    if (!globalLeaderboard || !post) return undefined;
    const entry = globalLeaderboard.find((e) => e.user_id === post.user_id);
    return entry?.rank;
  }, [globalLeaderboard, post]);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

  // Fetch comments
  useEffect(() => {
    if (!post) return;
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const data = await res.json();
        if (data.success) setComments(data.data);
      } catch {}
      finally { setCommentsLoading(false); }
    };
    fetchComments();
  }, [post?.id]);



  const handleLike = async () => {
    if (!user || likePostMutation.isPending || !post) return;

    try {
      await likePostMutation.mutateAsync(post.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting || !post) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.data]);
        setNewComment('');
      }
    } catch { addToast('Failed to post comment', 'error'); }
    finally { setSubmitting(false); }
  };
  const handleDelete = async () => {
    if (!(await confirm({ title: 'Archive Post', message: 'Archive this post? It will no longer be visible to anyone.', confirmLabel: 'Archive', variant: 'warning' }))) return;
    const res = await fetch(`/api/posts/${params.id}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      addToast('Failed to archive post.', 'error');
      return;
    }
    addToast('Post archived.', 'success');
    router.push('/dashboard');
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" text={["LOADING POST...", "FETCHING VERDICT...", "PREPARING ARCHIVE..."]} />
    </div>
  );
  if (!post) return <div className="text-center py-20 text-muted-foreground">Post not found</div>;

  let breakdown: Record<string, number> = {};
  try {
    if (post.ai_explanation) breakdown = JSON.parse(post.ai_explanation);
  } catch {}

  return (
    <main className="min-h-dvh bg-transparent relative px-4 sm:px-6 lg:px-8 pb-12">
      <div className="fixed top-8 left-6 sm:left-12 z-40">
        <button
          onClick={() => router.back()}
          className="rounded-full glass-btn px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 group touch-target"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 group-focus-within:-translate-x-1" />
          Back to Feed
        </button>
      </div>

      <div className="max-w-5xl mx-auto pt-16">

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12">

          {/* ═══ Left: Score + Social + Pill + Details + Story ═══ */}
          <div className="flex flex-col gap-6">

            {/* Score Card — gradient border + rose glow */}
            <div className="rounded-3xl bg-gradient-to-br from-primary/40 via-gold/40 via-border/50 to-white/30 dark:from-primary/40 dark:via-gold/30 dark:via-border/30 dark:to-white/10 p-[1px] shadow-[var(--shadow-glow)]">
            <div className="text-center py-8 px-6 rounded-[calc(1.5rem-1px)] bg-card relative h-full">
              {/* Rose glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--primary)/0.08),transparent)] blur-3xl rounded-[calc(1.5rem-1px)] pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Score Ring */}
                <div className="flex justify-center">
                  <ScoreRing score={post.ai_score || 0} size={110} />
                </div>

                {/* Partner + Author */}
                {post.partner && (
                  <Link
                    href={`/users/${post.user_id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/60 border border-border/60 hover:border-primary/30 active:border-primary/40 transition-colors touch-target"
                  >
                    <span className="text-sm font-medium text-foreground">
                      @{post.profile?.username || 'user'}
                    </span>
                    <span className="text-muted-foreground/40">×</span>
                    <span className="text-sm text-foreground">{post.partner.name}</span>
                    <span>{post.partner.emoji}</span>
                  </Link>
                )}
                {authorRank && (
                  <p className="text-sm text-gold font-medium animate-slide-up">Ranked #{authorRank} globally 🏆</p>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                {/* Likes + Comments */}
                <div className="flex items-center justify-center gap-6">
                  <button onClick={handleLike} disabled={likePostMutation.isPending || !user} className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.has_liked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive/80 active:text-destructive'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Heart className={`h-4 w-4 ${post.has_liked ? 'fill-destructive text-destructive' : ''}`} />
                    <span className="text-xs">{post.likes_count ?? 0} {(post.likes_count ?? 0) === 1 ? 'like' : 'likes'}</span>
                  </button>
<span className="text-muted-foreground/20">|</span>
                  <button onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground active:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                  </button>
                </div>

                {/* Glass Pill */}
                <div className="flex justify-center pt-1">
                  <div className="glass-2 rounded-full inline-flex items-center gap-1 p-1 shadow-sm">
                    <button onClick={() => openShare('post', {
                      username: post.profile?.username || 'you',
                      partnerName: post.partner?.name,
                      headline: post.description,
                      verdict: post.ai_feedback || undefined,
                      score: post.ai_score || 0,
                      rank: authorRank,
                      city: post.post_city || post.profile?.city || undefined,
                      date: formatRelativeTime(post.created_at),
                      avatarUrl: post.profile?.avatar_url,
                    })} className="flex items-center justify-center gap-1.5 rounded-full glass-btn px-5 py-2.5 text-xs font-semibold shadow-[var(--shadow-glow)] hover:opacity-90 active:opacity-80 transition-all touch-target">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                    {user && post.user_id === user.id && (
                      <>
                        <button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center gap-1.5 rounded-full glass-btn px-4 py-2.5 text-xs font-semibold touch-target">
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button onClick={handleDelete} className="flex items-center justify-center gap-1.5 rounded-full glass-btn px-4 py-2.5 text-xs font-semibold hover:text-destructive hover:bg-destructive/5 active:text-destructive active:bg-destructive/10 transition-colors touch-target">
                          <Archive className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Archive</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>



            {/* Post details card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider">Posted</span>
                <span className="text-foreground font-medium">{formatRelativeTime(post.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider">Status</span>
                <Badge variant={post.is_public ? 'success' : 'default'} className="bg-elevated border-border text-[10px]">
                  {post.is_public ? 'Public Record' : 'Private Archive'}
                </Badge>
              </div>
              {post.post_city && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Location</span>
                  <span className="text-foreground font-medium">{post.post_city}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider">Verdict №</span>
                <span className="text-foreground font-medium">#{(Math.floor((post.ai_score || 0) * 137) % 9999).toLocaleString()}</span>
              </div>
            </div>

            {/* Original Story — grows to fill remaining space */}
            <div className="rounded-3xl border border-border bg-card p-8 flex-1">
              <h4 className="font-sans tracking-widest uppercase text-[10px] font-bold text-muted-foreground mb-4">
                Original Story
              </h4>
              <p className="text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap">{post.description}</p>
            </div>

          </div>

          {/* ═══ Right: Verdict → Breakdown ═══ */}
          <div className="flex flex-col gap-8">

            {/* AI Feedback */}
            {post.ai_feedback && (
              <div className="rounded-3xl border border-gold/20 bg-gold/[0.06] dark:bg-gold/5 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/[0.07] dark:bg-primary/5 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <span className="font-sans tracking-[0.2em] uppercase text-[10px] font-bold text-gold/80">Fond AI Verdict</span>
                  </div>
                  <p className="font-display text-2xl italic leading-relaxed text-foreground">
                    &ldquo;{post.ai_feedback}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Score Breakdown — grows to fill remaining space */}
            {Object.keys(breakdown).length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-8 flex-1">
                <h3 className="font-display text-2xl italic text-foreground mb-6">Score Breakdown</h3>
                <div className="space-y-5">
                  {Object.entries(breakdown).map(([key, value]) => {
                    const max = getMax(key);
                    const percentage = (value / max) * 100;
                    return (
                      <div key={key} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {BREAKDOWN_LABELS[key] || key.replace(/_/g, ' ')}
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

          </div>

        </div>

        {/* ═══ Comments — rich features ═══ */}
        <div id="comments" className="mt-12 pt-10 border-t border-border/60">
          <div className="max-w-5xl mx-auto">
            {/* Header with sort */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Love Notes</span>
                <span className="text-xs text-muted-foreground/50">({comments.length})</span>
              </div>
              <div className="h-px flex-1 mx-3 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              {comments.length > 0 && (
                <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all ${sortBy === 'popular' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground active:text-foreground'}`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all ${sortBy === 'recent' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground active:text-foreground'}`}
                  >
                    Recent
                  </button>
                </div>
              )}
            </div>

            {/* CommentInput */}
            {user ? (
              <div className="mb-6">
                <CommentInput onSubmit={(text) => {
                  if (!text.trim() || submitting) return;
                  setSubmitting(true);
                  fetch(`/api/posts/${post.id}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: text.trim() }),
                  }).then(res => res.json()).then(data => {
                    if (data.success) {
                      setComments(prev => [...prev, data.data]);
                    }
                  }).catch(() => addToast('Failed to post comment', 'error'))
                  .finally(() => setSubmitting(false));
                }} avatarUrl={profile?.avatar_url} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">
                <a href="/auth/login" className="text-primary hover:underline active:underline">Sign in</a> to leave a love note.
              </p>
            )}

            {commentsLoading ? (
              <div className="py-8 flex justify-center"><Spinner size="sm" /></div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10">
                <MessageCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No love notes yet.</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Be the first to leave one.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {[...comments]
                  .sort((a, b) =>
                    sortBy === 'popular'
                      ? ((b as any).votes || 0) - ((a as any).votes || 0)
                      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )
                  .map((comment) => (
                  <CommentCard key={comment.id} comment={comment as any} postId={post.id} onDelete={(id) => setComments(prev => prev.filter(c => c.id !== id))} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {post && user && post.user_id === user.id && (
        <EditPostModal
          post={post}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          isPremium={!!profile?.is_premium}
        />
      )}
    </main>
  );
}

const BREAKDOWN_LABELS: Record<string, string> = {
  thoughtfulness: 'Thoughtfulness',
  effort: 'Effort',
  creativity: 'Creativity',
  emotional_weight: 'Emotional Weight',
  authenticity: 'Authenticity',
};

function getMax(key: string): number {
  const maxes: Record<string, number> = {
    thoughtfulness: 30,
    effort: 25,
    creativity: 20,
    emotional_weight: 15,
    authenticity: 10,
  };
  return maxes[key] || 25;
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePost, useLikePost } from '@/lib/hooks/usePosts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { formatRelativeTime } from '@/lib/utils/format';
import { ArrowLeft, Sparkles, Archive, Heart, MessageCircle, Send, Share2, Pencil } from 'lucide-react';
import { ShareCard } from '@/components/posts/ShareCard';
import { Spinner } from '@/components/ui/Spinner';
import { useUser } from '@/components/providers/AuthProvider';
import { useShare } from '@/components/providers/ShareProvider';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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

  if (isLoading) return <Spinner size="lg" className="mx-auto mt-20" />;
  if (!post) return <div className="text-center py-20 text-muted-foreground">Post not found</div>;

  let breakdown: Record<string, number> = {};
  try {
    if (post.ai_explanation) breakdown = JSON.parse(post.ai_explanation);
  } catch {}

  return (
    <main className="min-h-screen bg-background relative px-4 sm:px-6 lg:px-8 pb-40">
      <div className="absolute top-8 left-6 sm:left-12">
        <button
          onClick={() => router.back()}
          className="rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Feed
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pt-16">

      {/* Score Hero */}
      <div className="text-center py-10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--primary)/0.1),transparent)] blur-3xl -z-10" />
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
        <div className="rounded-3xl border border-gold/20 bg-gold/[0.06] dark:bg-gold/5 p-8 shadow-sm relative overflow-hidden">
          {/* Subtle rose glow in corner */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/[0.07] dark:bg-primary/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="font-sans tracking-[0.2em] uppercase text-[10px] font-bold text-gold/80">Fond AI Verdict</span>
            </div>
            <p className="font-display text-2xl italic leading-relaxed text-foreground">
              "{post.ai_feedback}"
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="rounded-3xl border border-border bg-card p-8">
        <h4 className="font-sans tracking-widest uppercase text-[10px] font-bold text-muted-foreground mb-4">
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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
        <button
          onClick={() => openShare('post', {
            username: post.profile?.username || 'you',
            partnerName: post.partner?.name,
            headline: post.description,
            verdict: post.ai_feedback || undefined,
            score: post.ai_score || 0,
            rank: authorRank,
            city: post.post_city || post.profile?.city || undefined,
            date: formatRelativeTime(post.created_at),
            avatarUrl: post.profile?.avatar_url,
          })}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          <Share2 className="h-4 w-4" />
          Share This Verdict
        </button>
        {user && post.user_id === user.id && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
            >
              <Pencil className="h-4 w-4" />
              Edit Post
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-elevated/40 text-muted-foreground hover:text-foreground hover:bg-elevated/70 transition-colors text-sm font-medium"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Like + Comments count */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          onClick={handleLike}
          disabled={likePostMutation.isPending || !user}
          className={`flex items-center gap-2 text-sm transition-colors ${
            post.has_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`h-5 w-5 ${post.has_liked ? 'fill-red-500' : ''}`} />
          <span>{post.likes_count ?? 0} {(post.likes_count ?? 0) === 1 ? 'like' : 'likes'}</span>
        </button>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
        </span>
      </div>

      {/* Comments Section */}
      <div className="rounded-3xl border border-border bg-card p-8">
        <h3 className="font-display text-xl italic text-foreground mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleComment} className="flex items-center gap-3 mb-6">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              className="flex-1 rounded-full border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            <a href="/auth/login" className="text-primary hover:underline">Sign in</a> to leave a comment.
          </p>
        )}

        {commentsLoading ? (
          <div className="py-8 flex justify-center"><Spinner size="sm" /></div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(comment.profile?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/users/${comment.user_id}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      @{comment.profile?.username || 'unknown'}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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

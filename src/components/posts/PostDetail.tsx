'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelativeTime, getScoreColor, getScoreBgColor } from '@/lib/utils/format';
import { Sparkles, Trash2, Heart, MessageCircle, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import type { Post, Comment } from '@/types/database';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const { user } = useUser();
  const { addToast } = useToast();

  const [liked, setLiked] = useState(post.has_liked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);
  const [liking, setLiking] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const data = await res.json();
        if (data.success) setComments(data.data);
      } catch {
        // swallow
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [post.id]);

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch {
      // swallow
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting) return;
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
    } catch {
      addToast('Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const scoreColor = post.ai_score ? getScoreColor(post.ai_score) : 'text-gray-400';
  const scoreBg = post.ai_score ? getScoreBgColor(post.ai_score) : 'bg-gray-300';

  let breakdown: Record<string, number> = {};
  try {
    if (post.ai_explanation) breakdown = JSON.parse(post.ai_explanation);
  } catch {}

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    const supabase = createClient();
    await supabase.from('posts').delete().eq('id', post.id);
    addToast('Post deleted', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Score Hero */}
      <div className="text-center py-8">
        <div className={`w-24 h-24 rounded-3xl ${scoreBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <span className="text-3xl font-bold text-white">{post.ai_score || '?'}</span>
        </div>
        <h1 className={`text-2xl font-bold ${scoreColor}`}>
          {post.ai_score ? `${post.ai_score}/100` : 'Not yet scored'}
        </h1>
        {post.partner && (
          <p className="text-gray-500 mt-1">
            {post.partner.emoji} {post.partner.name}
          </p>
        )}
        {post.profile && (
          <p className="text-xs text-muted-foreground mt-1">
            by @{post.profile.username}
          </p>
        )}
      </div>

      {/* Like + Comment counts row */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <button
          onClick={handleLike}
          disabled={liking || !user}
          className={`flex items-center gap-2 transition-colors ${
            liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`h-5 w-5 ${liked ? 'fill-red-500' : ''}`} />
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        </button>
        <span className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
        </span>
      </div>

      {/* AI Feedback */}
      {post.ai_feedback && (
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-primary/30 dark:border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary dark:text-primary">LoveScore AI</span>
          </div>
          <p className="text-foreground/90 italic">{post.ai_feedback}</p>
        </Card>
      )}

      {/* Description */}
      <Card>
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{post.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <span>{formatRelativeTime(post.created_at)}</span>
          <span>&bull;</span>
          <Badge variant={post.is_public ? 'success' : 'default'}>
            {post.is_public ? 'Public' : 'Private'}
          </Badge>
        </div>
      </Card>

      {/* Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground capitalize w-32">
                  {key.replace('_', ' ')}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-accent rounded-full transition-all duration-1000"
                    style={{ width: `${(value / getMax(key)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground/90 w-8 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments ({comments.length})
        </h3>

        {/* Comment form */}
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

        {/* Comments list */}
        {commentsLoading ? (
          <div className="py-8 flex justify-center"><Spinner size="sm" /></div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(comment.profile?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      @{comment.profile?.username || 'unknown'}
                    </span>
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
      </Card>

      {/* Actions */}
      {user && post.user_id === user.id && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
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

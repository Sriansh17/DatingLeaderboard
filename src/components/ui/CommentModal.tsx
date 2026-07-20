'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/components/providers/AuthProvider';
import { CommentCard } from '@/components/ui/CommentCard';
import { CommentInput } from '@/components/ui/CommentInput';
import { MessageCircle, Sparkles } from 'lucide-react';
import type { Comment } from '@/types/database';

interface CommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  commentsCount?: number;
}

export function CommentModal({ postId, isOpen, onClose, commentsCount }: CommentModalProps) {
  const { user, profile } = useUser();
  const { addToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'popular' | 'recent'>('popular');

  useEffect(() => {
    if (!isOpen || !postId) return;
    fetchComments();
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.success) setComments(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (text: string) => {
    if (!user || !text.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.data]);
      }
    } catch {
      addToast('Failed to post comment', 'error');
    }
  };

  const sorted = [...comments].sort((a, b) => {
    if (sort === 'popular') {
      const aScore = (a.votes || 0) + (a.replies?.length || 0);
      const bScore = (b.votes || 0) + (b.replies?.length || 0);
      return bScore - aScore;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md">
      <div className="space-y-4">
        {/* Header + sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold shrink-0" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Love Notes</span>
            <span className="text-xs text-muted-foreground/50">({commentsCount ?? comments.length})</span>
          </div>
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              onClick={() => setSort('popular')}
              className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${sort === 'popular' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground active:text-foreground'}`}
            >
              Popular
            </button>
            <button
              onClick={() => setSort('recent')}
              className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${sort === 'recent' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground active:text-foreground'}`}
            >
              Recent
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-64 overflow-y-auto divide-y divide-border/30 [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size="sm" /></div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No love notes yet.</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Be the first to leave one.</p>
            </div>
          ) : (
            sorted.map(comment => (
              <CommentCard key={comment.id} comment={comment as any} postId={postId} onClose={onClose} />
            ))
          )}
        </div>

        {/* CommentInput */}
        {user ? (
          <CommentInput onSubmit={handleSubmit} avatarUrl={profile?.avatar_url} />
        ) : (
          <p className="text-sm text-muted-foreground text-center pt-3 border-t border-border/60">
            <Link href="/auth/login" className="text-primary hover:underline active:underline" onClick={onClose}>Sign in</Link> to leave a love note.
          </p>
        )}
      </div>
    </Modal>
  );
}

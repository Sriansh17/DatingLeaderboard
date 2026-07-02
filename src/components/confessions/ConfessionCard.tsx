'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, MessageCircle, ChevronDown, Trophy, Send } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/components/providers/AuthProvider';
import type { Confession, ReactionType, ConfessionReply } from '@/types/database';
import { REACTION_EMOJIS, REACTION_LABELS } from '@/types/database';

const REACTION_LIST: ReactionType[] = ['peek', 'spicy', 'relatable', 'dead', 'wholesome'];

interface ConfessionCardProps {
  confession: Confession;
}

export function ConfessionCard({ confession }: ConfessionCardProps) {
  const { user } = useUser();
  const { addToast } = useToast();
  const [userReaction, setUserReaction] = useState<ReactionType | null>(confession.user_reaction);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(confession.reaction_counts);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ConfessionReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesCount, setRepliesCount] = useState(confession.replies_count);
  const [replyText, setReplyText] = useState('');
  const [replyPending, setReplyPending] = useState(false);
  const [pendingReaction, setPendingReaction] = useState<ReactionType | null>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // --- Reactions ---
  const handleReact = async (reaction: ReactionType) => {
    if (!user) {
      addToast('Sign in to react', 'error');
      return;
    }

    // Optimistic update
    const prevReaction = userReaction;
    const prevCounts = { ...reactionCounts };

    if (userReaction === reaction) {
      // Toggle off
      setUserReaction(null);
      setReactionCounts(prev => ({ ...prev, [reaction]: Math.max(0, (prev[reaction] || 0) - 1) }));
    } else {
      // Set new reaction (remove old one first if exists)
      const newCounts = { ...reactionCounts };
      if (prevReaction) {
        newCounts[prevReaction] = Math.max(0, (newCounts[prevReaction] || 0) - 1);
      }
      newCounts[reaction] = (newCounts[reaction] || 0) + 1;
      setUserReaction(reaction);
      setReactionCounts(newCounts);
    }

    setPendingReaction(reaction);

    try {
      const res = await fetch(`/api/confessions/${confession.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to react');
      }
      // Server confirms — update with server state
      if (json.reaction === null) {
        setUserReaction(null);
      } else if (json.reaction !== userReaction) {
        // If server set a different reaction than our optimistic state, reconcile
      }
    } catch (error) {
      // Revert
      setUserReaction(prevReaction);
      setReactionCounts(prevCounts);
      console.error('Failed to react:', error);
    } finally {
      setPendingReaction(null);
    }
  };

  // --- Replies ---
  const toggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setShowReplies(true);

    if (replies.length === 0) {
      setRepliesLoading(true);
      try {
        const res = await fetch(`/api/confessions/${confession.id}/replies`);
        const json = await res.json();
        if (json.success) {
          setReplies(json.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch replies:', error);
      } finally {
        setRepliesLoading(false);
      }
    }

    // Focus reply input after opening
    setTimeout(() => replyInputRef.current?.focus(), 300);
  };

  const submitReply = async () => {
    if (!user) {
      addToast('Sign in to reply', 'error');
      return;
    }
    if (!replyText.trim()) return;

    setReplyPending(true);
    const text = replyText.trim();
    setReplyText('');

    // Optimistic: add a placeholder reply
    const optimisticReply: ConfessionReply = {
      id: 'temp-' + Date.now(),
      confession_id: confession.id,
      user_id: user.id,
      content: text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      anonymous_emoji: '🦊',
      anonymous_color: '#FF6B6B',
    };
    setReplies(prev => [...prev, optimisticReply]);
    setRepliesCount(prev => prev + 1);

    try {
      const res = await fetch(`/api/confessions/${confession.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to reply');
      }
      // Replace optimistic reply with real one
      setReplies(prev => prev.map(r => r.id === optimisticReply.id ? json.data : r));
    } catch (error) {
      // Remove optimistic reply on error
      setReplies(prev => prev.filter(r => r.id !== optimisticReply.id));
      setRepliesCount(prev => Math.max(0, prev - 1));
      addToast('Failed to post reply', 'error');
    } finally {
      setReplyPending(false);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, c) => sum + c, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative ${confession.is_confession_of_day ? 'scale-[1.02]' : ''}`}
    >
      <div className={`relative rounded-[2rem] overflow-hidden transition-all duration-500 p-6 sm:p-8 bg-card border ${
        confession.is_confession_of_day
          ? 'border-gold/40 shadow-[0_0_30px_-8px_rgba(212,175,55,0.3)]'
          : 'border-border hover:border-primary/20 hover:shadow-[0_8px_30px_-8px_rgba(232,69,107,0.1)] active:border-primary/30'
      }`}>
        {/* Confession of the Day Crown */}
        {confession.is_confession_of_day && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-br from-gold to-amber-600 text-white px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-lg">
              <Trophy className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Confession of the Day</span>
            </div>
          </div>
        )}

        {/* Anonymous badge + timestamp */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
            <Lock className="h-3 w-3 text-primary/60" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Anonymous</span>
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(confession.created_at)}
          </span>
        </div>

        {/* Content */}
        <div className="py-2">
          <p className="font-display text-2xl sm:text-3xl italic leading-[1.3] text-foreground">
            &ldquo;{confession.content}&rdquo;
          </p>
        </div>

        {/* Emoji Reactions */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {REACTION_LIST.map((reaction) => {
            const count = reactionCounts[reaction] || 0;
            const isActive = userReaction === reaction;
            const isPending = pendingReaction === reaction;

            return (
              <button
                key={reaction}
                onClick={() => handleReact(reaction)}
                disabled={!user || isPending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-primary/10 border-primary/30 text-primary shadow-sm scale-105'
                    : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border active:bg-muted/80'
                } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-base leading-none">{REACTION_EMOJIS[reaction]}</span>
                {count > 0 && (
                  <span className="text-xs font-bold tabular-nums">{count}</span>
                )}
              </button>
            );
          })}
          {totalReactions > 0 && (
            <span className="text-[10px] text-muted-foreground/60 ml-1">
              {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Footer: Replies toggle */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <button
            onClick={toggleReplies}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors active:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{repliesCount > 0 ? `${repliesCount} repl${repliesCount === 1 ? 'y' : 'ies'}` : 'Reply'}</span>
            {showReplies && <ChevronDown className="h-3 w-3 ml-1" />}
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium">
            Confession
          </span>
        </div>

        {/* Expandable Replies Section */}
        <AnimatePresence>
          {showReplies && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                {repliesLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-xs text-muted-foreground ml-2">Loading replies...</span>
                  </div>
                ) : replies.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-3">
                    No replies yet. Be the first to respond.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5">
                        <span className="text-lg leading-none mt-0.5 flex-shrink-0">
                          {reply.anonymous_emoji || '🦊'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {reply.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {formatRelativeTime(reply.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    ref={replyInputRef}
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitReply();
                      }
                    }}
                    placeholder="Anonymous reply..."
                    className="flex-1 rounded-full bg-muted/50 border border-border px-4 py-2 text-sm text-foreground outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/15 placeholder:text-muted-foreground/40 transition-all"
                    maxLength={500}
                    disabled={replyPending}
                  />
                  <button
                    onClick={submitReply}
                    disabled={!replyText.trim() || replyPending || !user}
                    className="flex items-center justify-center h-9 w-9 rounded-full glass-btn disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

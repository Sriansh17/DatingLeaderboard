'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/format';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, SmilePlus, Edit3, Trash2, Flag } from 'lucide-react';
import type { Comment } from '@/types/database';

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😍', '💀', '👏'];

interface CommentCardProps {
  comment: Comment;
  postId: string;
  onClose?: () => void;
  depth?: number;
  onDelete?: (id: string) => void;
}

function MentionText({ text }: { text: string }) {
  const { addToast } = useToast();
  const router = useRouter();
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <button
              key={i}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const res = await fetch(`/api/users/search?q=${encodeURIComponent(username)}`);
                  const data = await res.json();
                  if (data.success && data.data?.length > 0) {
                    router.push(`/users/${data.data[0].id}`);
                  } else {
                    addToast('User not found', 'error');
                  }
                } catch {
                  addToast('Failed to find user', 'error');
                }
              }}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Load/save user vote + reaction state to localStorage so it persists across refresh
function loadCommentState(commentId: string) {
  try {
    const raw = localStorage.getItem(`fond_comment_${commentId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveCommentState(commentId: string, state: Record<string, any>) {
  try {
    localStorage.setItem(`fond_comment_${commentId}`, JSON.stringify(state));
  } catch {}
}

export function CommentCard({ comment, postId, onClose, depth = 0, onDelete }: CommentCardProps) {
  const { user } = useUser();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const replyInputRef = useRef<HTMLInputElement>(null);

  // ─── Vote with localStorage persistence ──────────────────
  const savedState = loadCommentState(comment.id);
  const [votes, setVotes] = useState((comment as any).votes ?? 0);
  const votesRef = useRef(votes);
  votesRef.current = votes;
  const [voted, setVoted] = useState<'up' | 'down' | null>(savedState.voted || null);
  const [voteFloored, setVoteFloored] = useState(false);

  const handleVote = useCallback(async (type: 'up' | 'down') => {
    if (!user) { addToast('Sign in to vote', 'error'); return; }
    let newVoted: 'up' | 'down' | null;
    let delta = 0;

    if (voted === type) {
      newVoted = null;
      delta = type === 'up' ? -1 : 1;
    } else if (voted === null) {
      newVoted = type;
      delta = type === 'up' ? 1 : -1;
    } else {
      newVoted = type;
      delta = type === 'up' ? 2 : -2;
    }

    const rawNew = votesRef.current + delta;
    const clamped = Math.max(0, rawNew);

    // If the count hit the floor and undo would revive it, keep it at 0
    if (voteFloored && delta > 0 && clamped > votesRef.current) {
      setVoted(newVoted);
      setVoteFloored(false);
      return;
    }

    const newVotes = clamped;
    setVoted(newVoted);
    setVotes(newVotes);
    setVoteFloored(rawNew < 0);

    try {
      await fetch(`/api/posts/${postId}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: newVotes }),
      });
    } catch { /* optimistic */ }
  }, [user, voted, postId, comment.id, voteFloored]);

  // ─── Reactions with localStorage persistence ─────────────
  const [reactions, setReactions] = useState<Record<string, number>>((comment as any).reactions ?? {});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set(savedState.userReactions || []));
  const [showReactions, setShowReactions] = useState(false);

  const addReaction = async (emoji: string) => {
    if (!user) { addToast('Sign in to react', 'error'); return; }
    if (userReactions.has(emoji)) {
      // Toggle off
      const newCount = (reactions[emoji] || 0) - 1;
      setUserReactions(prev => { const next = new Set(prev); next.delete(emoji); return next; });
      if (newCount <= 0) {
        const { [emoji]: _, ...rest } = reactions;
        setReactions(rest);
      } else {
        setReactions(prev => ({ ...prev, [emoji]: newCount }));
      }
      setShowReactions(false);
      return;
    }

    // Toggle on
    setUserReactions(prev => new Set(prev).add(emoji));
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setShowReactions(false);

    try {
      await fetch(`/api/posts/${postId}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: emoji }),
      });
    } catch { /* optimistic */ }
  };

  // ─── Reply ───────────────────────────────────────────────
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localReplies, setLocalReplies] = useState<Comment[]>([]);

  const submitReply = async () => {
    if (!replyText.trim() || !user) return;
    const text = replyText.trim();
    setReplyText('');
    setShowReply(false);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `@${(comment.profile as any)?.username || 'user'} ${text}`,
          parent_id: comment.id,
        }),
      });
      const data = await res.json();
      if (data.success) setLocalReplies(prev => [...prev, data.data]);
    } catch { addToast('Failed to reply', 'error'); }
  };

  // ─── @ Mention Autocomplete ──────────────────────────────
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionUsers, setMentionUsers] = useState<{ id: string; username: string }[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);

  const handleReplyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReplyText(val);

    // Check if typing @
    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || val[atIndex - 1] === ' ')) {
      const query = val.slice(atIndex + 1);
      if (query.length >= 1 && !query.includes(' ')) {
        setMentionQuery(query);
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  };

  useEffect(() => {
    if (!mentionOpen || mentionQuery.length < 1) return;
    setMentionLoading(true);
    fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}`)
      .then(r => r.json())
      .then(data => { if (data.success) setMentionUsers(data.data || []); })
      .catch(() => {})
      .finally(() => setMentionLoading(false));
  }, [mentionQuery, mentionOpen]);

  const selectMention = (username: string) => {
    const atIndex = replyText.lastIndexOf('@');
    const before = replyText.slice(0, atIndex);
    setReplyText(`${before}@${username} `);
    setMentionOpen(false);
    replyInputRef.current?.focus();
  };

  // ─── Edit ────────────────────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const submitEdit = async () => {
    if (!editText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText.trim() }),
      });
      const data = await res.json();
      if (data.success) setShowEdit(false);
    } catch { addToast('Failed to edit', 'error'); }
    finally { setSaving(false); }
  };

  // ─── Delete ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!(await confirm({ title: 'Delete Comment', message: 'Delete this comment?', confirmLabel: 'Delete', variant: 'danger' }))) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { addToast('Comment deleted', 'success'); onDelete?.(comment.id); }
    } catch { addToast('Failed to delete', 'error'); }
    setShowActions(false);
  };

  const [expandedReplies, setExpandedReplies] = useState(false);
  const isOwner = user?.id === comment.user_id;
  const allReplies = [...((comment as any).replies || []), ...localReplies];

  // Persist vote + reaction state to localStorage
  useEffect(() => {
    saveCommentState(comment.id, { voted, userReactions: Array.from(userReactions) });
  }, [voted, userReactions, comment.id]);

  return (
    <div className={`${depth > 0 ? 'ml-10 pl-5 border-l-2 border-border/30' : ''}`}>
      <div className={`${depth === 0 ? 'glass-1 rounded-2xl p-4 my-2' : 'py-3'}`}>
        {/* Row 1: Avatar + name + time + more */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-elevated border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">
              {(comment.profile as any)?.avatar_url ? (
                <img src={(comment.profile as any).avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (comment.profile?.username?.[0] || 'U').toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/users/${comment.user_id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors" onClick={() => onClose?.()}>
                  @{comment.profile?.username || 'unknown'}
                </Link>
                <span className="text-[10px] text-muted-foreground/40">{formatRelativeTime(comment.created_at)}</span>
              </div>
            </div>
          </div>

          {/* More actions */}
          <div className="relative shrink-0">
            <button onClick={() => setShowActions(!showActions)} className="p-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground hover:bg-elevated transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-xl border border-border bg-popover shadow-lg py-1 overflow-hidden">
                  {isOwner ? (
                    <>
                      <button onClick={() => { setShowEdit(!showEdit); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { addToast('Comment reported', 'info'); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                      <Flag className="h-3 w-3" /> Report
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Comment body */}
        {showEdit ? (
          <div className="mb-2 ml-10">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 transition-colors resize-none" rows={2} />
            <div className="flex gap-2 mt-2">
              <button onClick={submitEdit} disabled={saving || !editText.trim()} className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40">Save</button>
              <button onClick={() => setShowEdit(false)} className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/75 leading-relaxed mb-3 ml-10"><MentionText text={comment.content} /></p>
        )}

        {/* Row 3: Actions bar */}
        <div className="flex items-center gap-3 ml-10">
          {/* Vote */}
          <div className="flex items-center gap-0.5 border border-border/40 rounded-full px-1.5 py-0.5">
            <button onClick={() => handleVote('up')} className={`p-0.5 rounded transition-colors ${voted === 'up' ? 'text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={voted === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5m0 0l-7 7m7-7l7 7"/></svg>
            </button>
            <span className={`text-[10px] font-medium min-w-[16px] text-center tabular-nums ${voted === 'up' ? 'text-primary' : 'text-muted-foreground/50'}`}>{votes}</span>
            <button onClick={() => handleVote('down')} className={`p-0.5 rounded transition-colors ${voted === 'down' ? 'text-destructive' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={voted === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m0 0l7-7m-7 7l-7-7"/></svg>
            </button>
          </div>

          {/* Reaction pills */}
          <div className="flex items-center gap-1">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs hover:bg-muted transition-colors ${userReactions.has(emoji) ? 'bg-primary/10 border-primary/30' : 'bg-elevated/70 border-border/50'}`}
              >
                <span className="text-[10px]">{emoji}</span>
                <span className="text-muted-foreground/50 text-[9px] tabular-nums">{count}</span>
              </button>
            ))}
            <div className="relative">
              <button onClick={() => setShowReactions(!showReactions)} className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground hover:bg-elevated transition-colors">
                <SmilePlus className="h-3.5 w-3.5" />
              </button>
              {showReactions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowReactions(false)} />
                  <div className="absolute bottom-full left-0 mb-1 z-50 flex gap-1 rounded-full border border-border bg-popover shadow-lg px-2.5 py-1.5">
                    {REACTION_EMOJIS.map(e => (
                      <button key={e} onClick={() => addReaction(e)} className="text-base hover:scale-125 transition-transform">{e}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reply */}
          <button onClick={() => { setShowReply(!showReply); setTimeout(() => replyInputRef.current?.focus(), 50); }} className="text-muted-foreground/50 hover:text-foreground transition-colors text-[11px] font-medium">
            Reply
          </button>
        </div>

        {/* Reply input with @mention */}
        {showReply && (
          <div className="ml-10 mt-3 relative">
            <div className="flex items-center gap-2">
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={handleReplyInput}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                placeholder={`Reply to @${(comment.profile as any)?.username || 'user'}...`}
                maxLength={500}
                className="flex-1 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 transition-colors"
              />
              <button onClick={submitReply} disabled={!replyText.trim()} className={`p-1.5 rounded-full transition-all ${replyText.trim() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/30'}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
              </button>
            </div>

            {/* Mention autocomplete dropdown */}
            {mentionOpen && mentionUsers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 z-50 w-56 rounded-xl border border-border bg-popover shadow-lg py-1 max-h-32 overflow-y-auto">
                {mentionUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => selectMention(u.username)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-elevated border border-border flex items-center justify-center text-[7px] font-bold text-muted-foreground">
                      {u.username[0].toUpperCase()}
                    </div>
                    @{u.username}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nested replies with thread preview */}
      {allReplies.length > 0 && (
        <div>
          {(expandedReplies || allReplies.length <= 1 ? allReplies : allReplies.slice(0, 1)).map((reply: Comment) => (
            <CommentCard key={reply.id} comment={reply} postId={postId} onClose={onClose} depth={depth + 1} onDelete={onDelete} />
          ))}
          {!expandedReplies && allReplies.length > 1 && (
            <button
              onClick={() => setExpandedReplies(true)}
              className="ml-10 mt-1 flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1">
                {allReplies.slice(0, 3).map((r, i) => (
                  <span key={i} className="w-5 h-5 rounded-full bg-elevated border border-border flex items-center justify-center text-[6px] font-bold text-muted-foreground -mr-1.5">
                    {((r.profile as any)?.username?.[0] || '?').toUpperCase()}
                  </span>
                ))}
              </span>
              <span>+{allReplies.length - 1} {allReplies.length - 1 === 1 ? 'reply' : 'replies'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

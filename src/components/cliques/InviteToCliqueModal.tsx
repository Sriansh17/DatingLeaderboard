'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Send, Users, PlusCircle, Sparkles, ArrowLeft, Check } from 'lucide-react';
import type { Circle } from '@/types/database';

interface InviteToBondModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUsername: string;
}

const emojiOptions = ['💫', '🌟', '✨', '🔥', '💕', '👑', '🎯', '🏆', '🌈', '🎉', '🦋', '🌙'];

export function InviteToBondModal({ isOpen, onClose, targetUserId, targetUsername }: InviteToBondModalProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💫');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setInvitedIds(new Set());
      fetchCircles();
    }
  }, [isOpen]);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.success) {
        setCircles(data.data || []);
      }
    } catch {
      addToast('Failed to load bonds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), emoji: newEmoji }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Bond created!', 'success');
        setShowCreate(false);
        setNewName('');
        setNewEmoji('💫');
        fetchCircles();
      } else {
        addToast(data.error || 'Failed to create bond', 'error');
      }
    } catch {
      addToast('Failed to create bond', 'error');
    } finally {
      setCreating(false);
    }
  };

  const uninvite = async (circleId: string) => {
    try {
      const res = await fetch(`/api/circles/${circleId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Invite cancelled', 'info');
        setInvitedIds(prev => { const next = new Set(prev); next.delete(circleId); return next; });
      } else {
        addToast(data.error || 'Failed to cancel', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const sendInvite = async (circleId: string) => {
    setInvitingId(circleId);
    try {
      const res = await fetch(`/api/circles/${circleId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Invited @${targetUsername}!`, 'success');
        setInvitedIds(prev => new Set(prev).add(circleId));
      } else {
        addToast(data.error || 'Failed to invite', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={showCreate ? 'Create New Bond' : `Invite @${targetUsername}`}>
      <div className="space-y-3 min-h-[140px]">
        {showCreate ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground active:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Weekend Warriors"
                maxLength={50}
                required
                className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                      newEmoji === e
                        ? 'bg-primary/20 border-2 border-primary scale-110'
                        : 'bg-muted/30 border border-border hover:bg-muted/50 active:bg-muted/70'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3 text-sm font-semibold disabled:opacity-40 transition-all"
            >
              {creating ? <Spinner size="sm" /> : <><Sparkles className="h-4 w-4" /> Create Bond</>}
            </button>
          </form>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" text={["LOADING BONDS..."]} />
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">No bonds yet</p>
            <p className="text-xs text-muted-foreground/60 mb-5">Create one to invite @{targetUsername}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-sm font-semibold transition-all"
            >
              <PlusCircle className="h-4 w-4" /> Create New Bond
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground/70">
                Invite @{targetUsername} to a bond
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-xs font-medium text-primary hover:text-primary/80 active:text-primary/60 flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="h-3 w-3" /> New Bond
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {circles.map((circle) => {
                const isInvited = invitedIds.has(circle.id);
                return (
                  <div
                    key={circle.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 hover:bg-card/60 active:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-2xl flex-shrink-0">{circle.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{circle.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {circle.member_count ?? 0}/{circle.max_members} members
                        </p>
                      </div>
                    </div>
                    {isInvited ? (
                      <button
                        onClick={() => uninvite(circle.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-success bg-success/10 border border-success/20 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 active:bg-destructive/15 active:text-destructive transition-all"
                        title="Click to cancel invite"
                      >
                        <Check className="h-3.5 w-3.5" /> Invited
                      </button>
                    ) : (
                      <button
                        onClick={() => sendInvite(circle.id)}
                        disabled={invitingId === circle.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold glass-btn flex-shrink-0 disabled:opacity-50 transition-all"
                      >
                        {invitingId === circle.id ? (
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        {invitingId === circle.id ? 'Sending...' : 'Invite'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// Backward-compatible alias while old imports are being migrated.
export const InviteToCliqueModal = InviteToBondModal;

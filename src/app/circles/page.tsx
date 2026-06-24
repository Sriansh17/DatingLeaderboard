'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { PlusCircle, Diamond, LogIn, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import type { Circle } from '@/types/database';

export default function CirclesPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  // Create circle form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💫');
  const [newPasscode, setNewPasscode] = useState('');
  const [creating, setCreating] = useState(false);

  // Join circle form
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCircles();
  }, [user]);

  const fetchCircles = async () => {
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.success) setCircles(data.data);
    } catch {
      addToast('Failed to load cliques', 'error');
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
        body: JSON.stringify({
          name: newName.trim(),
          emoji: newEmoji,
          passcode: newPasscode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Clique created! Share the invite code with friends.', 'success');
        setShowCreate(false);
        setNewName('');
        setNewPasscode('');
        fetchCircles();
      } else {
        addToast(data.error || 'Failed to create clique', 'error');
      }
    } catch {
      addToast('Failed to create clique', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || joining) return;
    setJoining(true);
    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Joined "${data.data.name}"!`, 'success');
        setShowJoin(false);
        setInviteCode('');
        fetchCircles();
      } else {
        addToast(data.error || 'Invalid code', 'error');
      }
    } catch {
      addToast('Failed to join circle', 'error');
    } finally {
      setJoining(false);
    }
  };

  const copyCode = async (code: string, id: string) => {
    const link = `${window.location.origin}/circles/join/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      addToast('Invite link copied!', 'success');
    } catch {
      // Fallback
      addToast(`Share this code: ${code}`, 'success');
    }
  };

  const emojiOptions = ['💫', '🌟', '✨', '🔥', '💕', '👑', '🎯', '🏆', '🌈', '🎉', '🦋', '🌙'];

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Diamond className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl italic text-foreground mb-2">Private Cliques</h1>
        <p className="text-muted-foreground mb-6">Sign in to create or join a private leaderboard with friends.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ScrollToTop label="Cliques" />
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold/80 to-primary flex items-center justify-center shadow-md">
          <Diamond className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cliques</h1>
          <p className="text-sm text-muted-foreground">Private leaderboards with friends</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => { setShowCreate(true); setShowJoin(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            showCreate
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-card/50 text-foreground hover:bg-card'
          }`}
        >
          <PlusCircle className="h-4 w-4" /> Create Clique
        </button>
        <button
          onClick={() => { setShowJoin(true); setShowCreate(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            showJoin
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-card/50 text-foreground hover:bg-card'
          }`}
        >
          <LogIn className="h-4 w-4" /> Join with Code
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-8 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-xl space-y-4">
          <h3 className="font-display text-lg italic text-foreground">New Clique</h3>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Batch of '23 Couples"
              maxLength={50}
              required
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <p className="text-[11px] text-muted-foreground/60 mt-1.5">Max <strong>10</strong> members allowed per circle</p>
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
                      : 'bg-muted/30 border border-border hover:bg-muted/50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Passcode <span className="text-muted-foreground/40 normal-case tracking-normal">(optional)</span></label>
            <input
              type="text"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="Members need this to join"
              maxLength={20}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <p className="text-[11px] text-muted-foreground/60 mt-1.5">Invite link expires in <strong>24 hours</strong></p>
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {creating ? <Spinner size="sm" /> : <><Sparkles className="h-4 w-4" /> Create Clique</>}
          </button>
        </form>
      )}

      {/* Join form */}
      {showJoin && (
        <form onSubmit={handleJoin} className="mb-8 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-xl space-y-4">
          <h3 className="font-display text-lg italic text-foreground">Join a Clique</h3>
          <p className="text-sm text-muted-foreground">Enter the invite code or paste the full invite link.</p>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => {
              // Extract code from full URL if pasted
              const val = e.target.value;
              const match = val.match(/\/circles\/join\/([a-z0-9]+)/i);
              setInviteCode(match ? match[1] : val);
            }}
            placeholder="Invite code (e.g. a3b9k2x1)"
            maxLength={50}
            required
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={joining || !inviteCode.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {joining ? <Spinner size="sm" /> : <><LogIn className="h-4 w-4" /> Join Clique</>}
          </button>
        </form>
      )}

      {/* Circles list */}
      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" text={["LOADING CLIQUES..."]} /></div>
      ) : circles.length === 0 ? (
        <div className="text-center py-16">
          <Diamond className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl italic text-foreground mb-2">No cliques yet</h3>
          <p className="text-sm text-muted-foreground">Create one or join with an invite code to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {circles.map((circle) => {
            const isCreator = circle.created_by === user.id;
            return (
              <Link
                key={circle.id}
                href={`/circles/${circle.id}`}
                className="block p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{circle.emoji}</span>
                    <div>
                      <h3 className="font-display text-lg italic text-foreground">{circle.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Diamond className="h-3 w-3" />
                        {circle.member_count ?? 0}/{circle.max_members} members
                        {isCreator && (
                          <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-semibold">Creator</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyCode(circle.code, circle.id);
                      }}
                      className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                      title="Copy invite link"
                    >
                      {copiedId === circle.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

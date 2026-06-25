'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { Spinner } from '@/components/ui/Spinner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { PageBell } from '@/components/ui/PageBell';
import { Avatar } from '@/components/ui/Avatar';
import { UserSearch } from '@/components/cliques/UserSearch';
import {
  PlusCircle, Diamond, LogIn, Copy, Check, ArrowRight, Sparkles,
  Users, UserPlus, Heart, UserCheck, X, Link2
} from 'lucide-react';
import type { Circle, Connection, ConnectionRequest } from '@/types/database';

type TabId = 'inner-circle' | 'cliques' | 'requests';

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'inner-circle', label: 'Inner Circle', icon: Heart },
  { id: 'cliques', label: 'Bonds', icon: Diamond },
  { id: 'requests', label: 'Requests', icon: UserPlus },
];

export default function BondsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState<TabId>('inner-circle');

  // Cliques state
  const [circles, setCircles] = useState<Circle[]>([]);
  const [circlesLoading, setCirclesLoading] = useState(true);

  // Connections state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  // Requests state
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

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
    fetchConnections();
    fetchRequests();
  }, [user]);

  const fetchCircles = async () => {
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.success) setCircles(data.data);
    } catch {
      addToast('Failed to load bonds', 'error');
    } finally {
      setCirclesLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      if (data.success) setConnections(data.data);
    } catch {
      // silently fail
    } finally {
      setConnectionsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/connections/requests');
      const data = await res.json();
      if (data.success) {
        setIncomingRequests(data.data.incoming || []);
        setOutgoingRequests(data.data.outgoing || []);
      }
    } catch {
      // silently fail
    } finally {
      setRequestsLoading(false);
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
        addToast('Bond created! Share the invite code.', 'success');
        setShowCreate(false);
        setNewName('');
        setNewPasscode('');
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
      addToast('Failed to join bond', 'error');
    } finally {
      setJoining(false);
    }
  };

  const handleRemoveConnection = async (connectedUserId: string, username: string) => {
    if (!(await confirm({ title: 'Remove Connection', message: `Remove @${username} from your Inner Circle?`, confirmLabel: 'Remove', variant: 'danger' }))) return;
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: connectedUserId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Removed @${username}`, 'info');
        fetchConnections();
      } else {
        addToast(data.error || 'Failed to remove', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'accepted') {
          addToast('Connected!', 'success');
        }
        fetchRequests();
        fetchConnections();
      } else {
        addToast(data.error || 'Failed to respond', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
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
      addToast(`Share this code: ${code}`, 'success');
    }
  };

  const emojiOptions = ['💫', '🌟', '✨', '🔥', '💕', '👑', '🎯', '🏆', '🌈', '🎉', '🦋', '🌙'];

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl italic text-foreground mb-2">Your Bonds</h1>
        <p className="text-muted-foreground mb-6">Sign in to connect with others and join private leaderboards.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    );
  }

  const unreadCount = incomingRequests.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      {/* Fond rose glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-blush/20 blur-3xl pointer-events-none" />

      <ScrollToTop label="Bonds" />

      {/* Header — aligned with dashboard/leaderboard pattern */}
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2 flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5" /> Connections
            </p>
            <h1 className="font-display text-5xl sm:text-6xl italic text-foreground tracking-tight leading-none">
              Your Bonds
            </h1>
          </div>
          <PageBell />
        </div>
      </header>

      {/* Tabs — Fond pill style */}
      <div className="flex gap-2 mb-8">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isRequests = tab.id === 'requests';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {isRequests && unreadCount > 0 && (
                <span className="h-4 min-w-[16px] flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═════ Inner Circle Tab ═════ */}
      {activeTab === 'inner-circle' && (
        <div>
          {/* Search */}
          <div className="mb-6">
            <UserSearch
              onSelect={(user) => {
                router.push(`/users/${user.id}`);
              }}
              excludeIds={[user.id, ...connections.map(c => c.connected_user_id)]}
            />
          </div>

          {/* Connections List */}
          <h2 className="font-display text-lg italic text-foreground mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Your Inner Circle
          </h2>

          {connectionsLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : connections.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-border bg-card/40">
              <UserCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display text-lg italic text-foreground mb-1">Your circle is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Search for people above and send a connection request to grow your Inner Circle.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {connections.map((conn) => {
                const profile = conn.profile;
                return (
                  <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-elevated transition-colors">
                    <Link href={`/users/${conn.connected_user_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar src={profile?.avatar_url} alt={profile?.username || ''} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {profile?.full_name || profile?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{profile?.username}{(profile as any)?.city ? ` · ${(profile as any).city}` : ''}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveConnection(conn.connected_user_id, profile?.username || 'unknown')}
                      className="text-[10px] text-muted-foreground hover:text-destructive underline transition-colors shrink-0 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═════ Cliques (Bonds) Tab ═════ */}
      {activeTab === 'cliques' && (
        <div>
          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                showCreate
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card/50 text-foreground hover:bg-card'
              }`}
            >
              <PlusCircle className="h-4 w-4" /> Create Bond
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
              <h3 className="font-display text-lg italic text-foreground">New Bond</h3>
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
                <p className="text-[11px] text-muted-foreground/60 mt-1.5">Max <strong>10</strong> members allowed</p>
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
                {creating ? <Spinner size="sm" /> : <><Sparkles className="h-4 w-4" /> Create Bond</>}
              </button>
            </form>
          )}

          {/* Join form */}
          {showJoin && (
            <form onSubmit={handleJoin} className="mb-8 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-xl space-y-4">
              <h3 className="font-display text-lg italic text-foreground">Join a Bond</h3>
              <p className="text-sm text-muted-foreground">Enter the invite code or paste the full invite link.</p>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
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
                {joining ? <Spinner size="sm" /> : <><LogIn className="h-4 w-4" /> Join Bond</>}
              </button>
            </form>
          )}

          {/* Circles list */}
          {circlesLoading ? (
            <div className="py-10 flex justify-center"><Spinner size="lg" text={["LOADING BONDS..."]} /></div>
          ) : circles.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-card/40">
              <Diamond className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display text-lg italic text-foreground mb-1">No bonds yet</h3>
              <p className="text-sm text-muted-foreground">Create one or join with an invite code.</p>
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
                            <Check className="h-4 w-4 text-success" />
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
      )}

      {/* ═════ Requests Tab ═════ */}
      {activeTab === 'requests' && (
        <div>
          {requestsLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-card/40">
              <UserPlus className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display text-lg italic text-foreground mb-1">No pending requests</h3>
              <p className="text-sm text-muted-foreground">Search for people and send a connection request!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Incoming */}
              {incomingRequests.length > 0 && (
                <div>
                  <h3 className="font-display text-base italic text-foreground mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" /> Incoming Requests
                  </h3>
                  <div className="space-y-2">
                    {incomingRequests.map((req) => {
                      const sender = req.sender as any;
                      return (
                        <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40">
                          <Link href={`/users/${sender?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full glass-2 flex items-center justify-center text-xs font-bold text-white">
                              {sender?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{sender?.full_name || sender?.username || 'Someone'}</p>
                              <p className="text-xs text-muted-foreground">@{sender?.username}</p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                              onClick={() => handleRespondToRequest(req.id, 'accepted')}
                              className="flex items-center gap-1 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                            >
                              <Check className="h-3.5 w-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(req.id, 'rejected')}
                              className="flex items-center gap-1 px-3 py-2 rounded-full border border-border text-muted-foreground text-xs hover:text-destructive hover:border-destructive/50 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Outgoing */}
              {outgoingRequests.length > 0 && (
                <div>
                  <h3 className="font-display text-base italic text-foreground mb-3 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" /> Sent Requests
                  </h3>
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => {
                      const receiver = req.receiver as any;
                      const isPending = req.status === 'pending';
                      return (
                        <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40">
                          <Link href={`/users/${receiver?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full glass-2 flex items-center justify-center text-xs font-bold text-white">
                              {receiver?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{receiver?.full_name || receiver?.username || 'Someone'}</p>
                              <p className="text-xs text-muted-foreground">@{receiver?.username}</p>
                            </div>
                          </Link>
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                            isPending ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                          }`}>
                            {isPending ? 'Pending' : 'Accepted'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  PlusCircle, Diamond, LogIn, Copy, Check, Sparkles,
  Users, UserPlus, Heart, UserCheck, X, Link2, Send, Search, ChevronDown, XCircle
} from 'lucide-react';
import type { Circle, Connection, ConnectionRequest } from '@/types/database';

export default function BondsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  // Data
  const [circles, setCircles] = useState<Circle[]>([]);
  const [circlesLoading, setCirclesLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // UI state
  const [requestsOpen, setRequestsOpen] = useState(true);
  const [icSearchOpen, setIcSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create form
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💫');
  const [newPasscode, setNewPasscode] = useState('');
  const [creating, setCreating] = useState(false);

  // Join form
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emojiOptions = ['💫', '🌟', '✨', '🔥', '💕', '👑', '🎯', '🏆', '🌈', '🎉', '🦋', '🌙'];

  // Search for people to connect
  const doSearch = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data.filter((u: any) => u.id !== user?.id));
    } catch {} finally { setSearching(false); }
  };

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    const timer = setTimeout(() => doSearch(val), 300);
    return () => clearTimeout(timer);
  };

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
    } catch {} finally { setCirclesLoading(false); }
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      if (data.success) setConnections(data.data);
    } catch {} finally { setConnectionsLoading(false); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/connections/requests');
      const data = await res.json();
      if (data.success) {
        setIncomingRequests(data.data.incoming || []);
        setOutgoingRequests(data.data.outgoing || []);
      }
    } catch {} finally { setRequestsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/circles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), emoji: newEmoji, passcode: newPasscode.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Bond created!', 'success');
        setShowCreateModal(false);
        setNewName(''); setNewPasscode('');
        fetchCircles();
      } else addToast(data.error || 'Failed', 'error');
    } catch { addToast('Something went wrong', 'error'); }
    finally { setCreating(false); }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || joining) return;
    setJoining(true);
    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Joined "${data.data.name}"!`, 'success');
        setShowJoinModal(false); setInviteCode('');
        fetchCircles();
      } else addToast(data.error || 'Invalid code', 'error');
    } catch { addToast('Failed to join', 'error'); }
    finally { setJoining(false); }
  };

  const handleRemoveConnection = async (connectedUserId: string, username: string) => {
    if (!(await confirm({ title: 'Remove Connection', message: `Remove @${username} from your Inner Circle?`, confirmLabel: 'Remove', variant: 'danger' }))) return;
    try {
      const res = await fetch('/api/connections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: connectedUserId }) });
      if ((await res.json()).success) { addToast(`Removed @${username}`, 'info'); fetchConnections(); }
    } catch { addToast('Something went wrong', 'error'); }
  };

  const respondToRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'accepted') addToast('Connected!', 'success');
        fetchRequests(); fetchConnections();
      } else addToast(data.error || 'Failed', 'error');
    } catch { addToast('Something went wrong', 'error'); }
  };

  const cancelRequest = async (requestId: string, username: string) => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, { method: 'DELETE' });
      if ((await res.json()).success) { addToast(`Cancelled invite to @${username}`, 'info'); fetchRequests(); }
    } catch { addToast('Failed to cancel', 'error'); }
  };

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/circles/join/${code}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      addToast('Invite link copied!', 'success');
    } catch { addToast(`Code: ${code}`, 'success'); }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Link2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="font-display text-4xl italic text-foreground mb-2">Your Bonds</h1>
        <p className="text-muted-foreground text-sm mb-6">Sign in to connect with others and form your inner circle.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    );
  }

  const pendingCount = incomingRequests.length;
  const sentCount = outgoingRequests.length;
  const totalRequests = pendingCount + sentCount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 relative">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      <ScrollToTop label="Bonds" />

      {/* Header — only bell */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-1">✦ Bonds</p>
          <h1 className="font-display text-5xl italic text-foreground tracking-tight">Your Bonds</h1>
        </div>
        <NotificationBell />
      </div>

      {/* Stats row — 3 columns */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center">
          <div className="font-score text-3xl text-foreground">{circles.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5"><Diamond className="h-3 w-3" /> Bonds</div>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center">
          <div className="font-score text-3xl text-gold">{connections.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5"><Users className="h-3 w-3" /> Connected</div>
        </div>
        <Link href="#requests" className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center hover:border-primary/30 transition-all block">
          <div className="font-score text-3xl text-primary">{totalRequests}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5"><UserPlus className="h-3 w-3" /> Requests</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[9px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">{pendingCount} pending</span>
            <span className="text-[9px] text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">{sentCount} sent</span>
          </div>
        </Link>
      </div>

      {/* ── Your Bonds Section ── */}
      <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold mb-4">Your Bonds</p>

      {circlesLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" text={["LOADING BONDS..."]} /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {circles.map(circle => (
            <Link
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm text-center transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-5xl block mb-3">{circle.emoji}</span>
              <p className="font-display text-base italic text-foreground leading-tight mb-1">{circle.name}</p>
              <p className="text-[10px] text-muted-foreground">{circle.member_count ?? 0}/{circle.max_members} members</p>
              {circle.created_by === user.id && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[8px] font-semibold">✦ Creator</span>
              )}
            </Link>
          ))}
          {/* Create Bond card */}
          <div className="p-6 rounded-2xl border border-dashed border-border/50 bg-card/30 text-center transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
            <span className="text-5xl block mb-3">✨</span>
            <p className="font-display text-base italic text-foreground leading-tight mb-3">Create Bond</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass-btn text-[10px] font-semibold"><PlusCircle className="h-3 w-3" /> Create</button>
              <button onClick={() => setShowJoinModal(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/60 text-[10px] text-muted-foreground"><LogIn className="h-3 w-3" /> Join</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inner Circle Section ── */}
      <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-4 flex items-center gap-2">
        <Heart className="h-3 w-3" /> Inner Circle
      </p>
      <div className="p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {connectionsLoading ? (
              <Spinner size="sm" />
            ) : connections.length === 0 ? (
              <p className="text-xs text-muted-foreground">No connections yet</p>
            ) : (
              connections.map(conn => (
                <Link
                  key={conn.id}
                  href={`/users/${conn.connected_user_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/30 text-xs text-foreground hover:bg-card/50 transition-colors"
                >
                  <Avatar src={conn.profile?.avatar_url} alt={conn.profile?.username || ''} size="xs" />
                  @{conn.profile?.username || 'unknown'}
                </Link>
              ))
            )}
          </div>
          <button
            onClick={() => setIcSearchOpen(!icSearchOpen)}
            className="w-8 h-8 rounded-full border border-dashed border-border bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all shrink-0 ml-2"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>
        {icSearchOpen && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); doSearch(e.target.value); }}
                placeholder="Search people to connect..."
                className="w-full rounded-full border border-border bg-muted/30 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>
            {searching && <div className="mt-2 text-xs text-muted-foreground">Searching...</div>}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-1">
                {searchResults.map((u: any) => {
                  const isConnected = connections.some(c => c.connected_user_id === u.id);
                  const isPending = outgoingRequests.some(r => (r.receiver as any)?.id === u.id);
                  const status = isConnected ? 'connected' : isPending ? 'sent' : 'none';
                  return (
                    <div
                      key={u.id}
                      onClick={async () => {
                        if (status !== 'none') return;
                        try {
                          const res = await fetch('/api/connections/requests', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receiver_id: u.id }),
                          });
                          const data = await res.json();
                          if (data.success) { addToast(`Request sent to @${u.username}!`, 'success'); fetchRequests(); }
                          else addToast(data.error || 'Failed', 'error');
                        } catch { addToast('Something went wrong', 'error'); }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${status === 'none' ? 'cursor-pointer hover:bg-card/40' : ''}`}
                    >
                      <Link href={`/users/${u.id}`} onClick={(e) => e.stopPropagation()} className="text-sm text-foreground underline decoration-dotted decoration-muted-foreground/30 hover:text-primary transition-colors flex items-center gap-2 min-w-0 flex-1">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center text-[9px] font-bold shrink-0">{u.username?.[0]?.toUpperCase() || '?'}</div>
                        )}
                        <span className="font-medium truncate">@{u.username}</span>
                        {u.city && <span className="text-xs text-muted-foreground truncate">· {u.city}</span>}
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-semibold shrink-0 ml-2 ${
                        status === 'connected' ? 'bg-success/10 text-success border border-success/20' :
                        status === 'sent' ? 'bg-warning/10 text-warning border border-warning/20' :
                        'glass-btn'
                      }`}>
                        {status === 'connected' ? 'Connected' : status === 'sent' ? 'Sent' : 'Connect'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* ── Requests — unified, collapsible ── */}
      <div id="requests">
      {!requestsLoading && (incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          <button onClick={() => setRequestsOpen(!requestsOpen)} className="w-full flex items-center justify-between p-5 hover:bg-card/20 transition-colors">
            <p className="text-[10px] uppercase tracking-widest text-foreground font-bold flex items-center gap-2">
              <UserPlus className="h-3.5 w-3.5 text-primary" /> Requests
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-primary font-medium">{pendingCount} pending</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-[10px] text-warning">{sentCount} sent</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${requestsOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {requestsOpen && (
            <div className="px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: To Accept */}
                <div className="p-4 rounded-xl border border-primary/15 bg-primary/[0.03]">
                  <p className="text-[9px] uppercase tracking-wider text-primary font-bold mb-3 flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" /> To Accept
                  </p>
                  <div className="space-y-2">
                    {incomingRequests.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No pending requests</p>
                    ) : (
                      incomingRequests.map(req => {
                        const sender = req.sender as any;
                        return (
                          <div key={req.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-border/60 bg-card/50">
                            <Link href={`/users/${sender?.id}`} className="text-sm text-foreground underline decoration-dotted decoration-muted-foreground/30 flex items-center gap-2 hover:text-primary transition-colors min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{sender?.username?.[0]?.toUpperCase() || '?'}</div>
                              <span className="font-medium truncate">@{sender?.username || 'unknown'}</span>
                            </Link>
                            <div className="flex gap-1 shrink-0 ml-2">
                              <button onClick={() => respondToRequest(req.id, 'accepted')} className="px-3 py-1 rounded-full glass-btn text-[9px] font-semibold">Accept</button>
                              <button onClick={() => respondToRequest(req.id, 'rejected')} className="p-1 rounded-full border border-border text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Pending */}
                <div className="p-4 rounded-xl border border-warning/15 bg-warning/[0.03]">
                  <p className="text-[9px] uppercase tracking-wider text-warning font-bold mb-3 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Pending
                  </p>
                  <div className="space-y-2">
                    {outgoingRequests.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No sent requests</p>
                    ) : (
                      outgoingRequests.map(req => {
                        const receiver = req.receiver as any;
                        return (
                          <div key={req.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-warning/20 bg-card/40">
                            <Link href={`/users/${receiver?.id}`} className="text-sm text-foreground/70 flex items-center gap-2 hover:text-foreground transition-colors min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-full bg-warning/20 flex items-center justify-center text-[10px] font-bold text-warning shrink-0">{receiver?.username?.[0]?.toUpperCase() || '?'}</div>
                              <span className="truncate">@{receiver?.username || 'unknown'}</span>
                            </Link>
                            <button onClick={() => cancelRequest(req.id, receiver?.username || 'unknown')} className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/40 text-[9px] text-muted-foreground hover:text-destructive transition-all shrink-0 ml-2">
                              <XCircle className="h-2.5 w-2.5" /> Cancel
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* ─── Create Bond Modal ─── */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Bond">
        <form onSubmit={handleCreate} className="space-y-4 mt-2">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Batch of '23 Couples" maxLength={50} required className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            <p className="text-[11px] text-muted-foreground/60 mt-1.5">Max <strong>10</strong> members</p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map(e => (
                <button key={e} type="button" onClick={() => setNewEmoji(e)} className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${newEmoji === e ? 'bg-primary/20 border-2 border-primary scale-110' : 'bg-muted/30 border border-border hover:bg-muted/50'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Passcode <span className="text-muted-foreground/40 normal-case">(optional)</span></label>
            <input type="text" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} placeholder="Members need this to join" maxLength={20} className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <button type="submit" disabled={creating || !newName.trim()} className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3 text-sm font-semibold disabled:opacity-40">
            {creating ? <Spinner size="sm" /> : <><Sparkles className="h-4 w-4" /> Create Bond</>}
          </button>
        </form>
      </Modal>

      {/* ─── Join with Code Modal ─── */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join a Bond">
        <form onSubmit={handleJoin} className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">Enter the invite code or paste the full invite link.</p>
          <input type="text" value={inviteCode} onChange={(e) => { const val = e.target.value; const m = val.match(/\/circles\/join\/([a-z0-9]+)/i); setInviteCode(m ? m[1] : val); }} placeholder="Invite code" maxLength={50} required className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
          <button type="submit" disabled={joining || !inviteCode.trim()} className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3 text-sm font-semibold disabled:opacity-40">
            {joining ? <Spinner size="sm" /> : <><LogIn className="h-4 w-4" /> Join Bond</>}
          </button>
        </form>
      </Modal>
    </div>
  );
}

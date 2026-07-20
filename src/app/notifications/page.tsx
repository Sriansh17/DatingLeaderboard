'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { Bell, Heart, UserPlus, Users, ChevronRight, ChevronDown, CheckCheck, LogIn, ArrowLeft, Check, X, Send, XCircle, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Notification, ConnectionRequest } from '@/types/database';

const NOTIFICATION_MESSAGES: Record<string, { icon: typeof Bell; message: (name: string) => string }> = {
  connection_request: { icon: UserPlus, message: (name) => `${name} wants to connect with you` },
  connection_accepted: { icon: Heart, message: (name) => `${name} accepted your connection request` },
  clique_invite: { icon: Users, message: (name) => `${name} invited you to a bond` },
  clique_joined: { icon: UserPlus, message: (name) => `${name} joined your bond` },
  post_like: { icon: Heart, message: (name) => `${name} liked your post` },
  post_comment: { icon: MessageCircle, message: (name) => `${name} commented on your post` },
};

export default function NotificationsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications(1);
    fetchRequests();
  }, [user]);

  const fetchNotifications = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${p}&limit=20`);
      const data = await res.json();
      if (data.success) {
        if (p === 1) {
          setNotifications(data.data || []);
        } else {
          setNotifications(prev => [...prev, ...(data.data || [])]);
        }
        setHasMore(data.has_more);
        setPage(p);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // silently fail
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
    } catch {}
  };

  const respondToRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (data.success) {
        addToast(action === 'accepted' ? 'Connected!' : 'Declined', 'success');
        fetchRequests();
      } else addToast(data.error || 'Failed', 'error');
    } catch { addToast('Something went wrong', 'error'); }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, { method: 'DELETE' });
      if ((await res.json()).success) { addToast('Request cancelled', 'info'); fetchRequests(); }
    } catch { addToast('Failed to cancel', 'error'); }
  };

  const handleClick = (notif: Notification) => {
    // Mark as read
    fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' }).catch(() => {});

    if (notif.type === 'clique_invite' && notif.reference_id) {
      router.push(`/circles/${notif.reference_id}`);
    } else if (notif.actor_id) {
      router.push(`/users/${notif.actor_id}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl italic text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground mb-6">Sign in to see your notifications.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full glass-btn text-sm hover:opacity-90 active:opacity-80 transition-opacity">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-xs font-semibold mb-6 touch-target"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Feed
      </Link>

      {/* Header — Fond pattern */}
      <header className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2 flex items-center gap-2">
            <Bell className="h-3.5 w-3.5" /> Updates
          </p>
          <h1 className="font-display text-4xl sm:text-5xl italic text-foreground tracking-tight leading-none">
            Notifications
          </h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline active:underline shrink-0 py-2 touch-target"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </header>

      {/* Requests section — compact, expandable */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <div className="mb-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          <button onClick={() => setRequestsOpen(!requestsOpen)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-card/20 active:bg-card/30 transition-colors">
            <span className="text-xs text-foreground font-bold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> Pending requests
            </span>
            <span className="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[10px]">
              {incomingRequests.length > 0 && <span className="text-primary font-medium whitespace-nowrap">{incomingRequests.length} to accept</span>}
              {outgoingRequests.length > 0 && <span className="text-warning whitespace-nowrap">{outgoingRequests.length} sent</span>}
              <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform shrink-0 ${requestsOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>
          {requestsOpen && (
            <div className="px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-primary font-medium">To Accept</p>
                  {incomingRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None</p>
                  ) : (
                    incomingRequests.map(req => {
                      const sender = req.sender as any;
                      return (
                        <div key={req.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-primary/15 bg-primary/[0.03]">
                          <Link href={`/users/${sender?.id}`} className="text-sm text-foreground font-medium hover:text-primary active:text-primary/80 transition-colors min-w-0 flex-1 truncate"><span className="no-underline">@</span><span className="underline decoration-dotted decoration-muted-foreground/30">{sender?.username || 'unknown'}</span></Link>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button onClick={() => respondToRequest(req.id, 'accepted')} className="inline-flex items-center justify-center w-7 h-7 rounded-full glass-btn touch-target"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => respondToRequest(req.id, 'rejected')} className="inline-flex items-center justify-center w-7 h-7 rounded-full glass-btn text-muted-foreground hover:text-destructive touch-target"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-warning font-medium">Pending</p>
                  {outgoingRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None</p>
                  ) : (
                    outgoingRequests.map(req => {
                      const receiver = req.receiver as any;
                      return (
                        <div key={req.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-warning/20 bg-warning/[0.03]">
                          <span className="text-sm text-foreground/70 min-w-0 flex-1 truncate">@{receiver?.username || 'unknown'}</span>
                          <button onClick={() => cancelRequest(req.id)} className="flex items-center gap-1 px-3.5 py-2 rounded-full glass-btn text-[10px] text-muted-foreground hover:text-destructive shrink-0 ml-2 touch-target"><XCircle className="h-3 w-3" /> Cancel</button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" text={["LOADING..."]} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border/50 bg-card/20 relative">
          <Bell className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/60">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unread section */}
          {notifications.filter(n => !n.read).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-foreground font-bold">New</h2>
              </div>
              <div className="space-y-2">
                {notifications.filter(n => !n.read).map(renderNotif)}
              </div>
            </div>
          )}

          {/* Earlier section */}
          {notifications.filter(n => n.read).length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border/50" />
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Earlier</h2>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="space-y-2">
                {notifications.filter(n => n.read).map(renderNotif)}
              </div>
            </div>
          )}

          {hasMore && (
            <button
              onClick={() => fetchNotifications(page + 1)}
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/80 active:text-primary/60 transition-colors text-center touch-target"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}
    </div>
  );

  function renderNotif(notif: Notification) {
    const config = NOTIFICATION_MESSAGES[notif.type];
    const Icon = config?.icon || Bell;
    const actor = notif.actor as any;
    return (
      <button
        key={notif.id}
        onClick={() => handleClick(notif)}
        className={`w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all text-left ${
          notif.read
            ? 'border-border bg-card/40 hover:bg-card/60 hover:shadow-sm active:bg-card/80 active:shadow-sm'
            : 'border-primary/15 bg-primary/[0.03] shadow-sm hover:shadow-md active:shadow-md'
        }`}
      >
        <div className="shrink-0">
          {actor?.avatar_url ? (
            <Avatar src={actor.avatar_url} alt={actor.username || ''} size="sm" />
          ) : (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
              notif.type === 'connection_request' ? 'bg-primary/10 text-primary' :
              notif.type === 'connection_accepted' ? 'bg-success/10 text-success' :
              'bg-primary/10 text-primary'
            }`}>
              {actor?.username?.[0]?.toUpperCase() || <Icon className="h-4 w-4" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${notif.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
            {config ? config.message(actor?.username || 'Someone') : 'Something happened'}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {formatTime(notif.created_at)}
          </p>
        </div>
        {!notif.read && (
          <div className="h-2 w-2 rounded-full bg-primary shrink-0 ring-2 ring-background" />
        )}
        <ChevronRight className={`h-4 w-4 shrink-0 ${notif.read ? 'text-muted-foreground/20' : 'text-gold/40'}`} />
      </button>
    );
  }
}

function formatTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

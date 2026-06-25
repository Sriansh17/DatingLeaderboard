'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { Spinner } from '@/components/ui/Spinner';
import { Bell, Heart, UserPlus, Users, ChevronRight, CheckCheck, LogIn, ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Notification } from '@/types/database';

const NOTIFICATION_MESSAGES: Record<string, { icon: typeof Bell; message: (name: string) => string }> = {
  connection_request: { icon: UserPlus, message: (name) => `${name} wants to connect with you` },
  connection_accepted: { icon: Heart, message: (name) => `${name} accepted your connection request` },
  clique_invite: { icon: Users, message: (name) => `${name} invited you to a clique` },
  clique_joined: { icon: UserPlus, message: (name) => `${name} joined your clique` },
};

export default function NotificationsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchNotifications(1);
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
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Feed
      </Link>

      {/* Header — Fond pattern */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2 flex items-center gap-2">
            <Bell className="h-3.5 w-3.5" /> Updates
          </p>
          <h1 className="font-display text-5xl italic text-foreground tracking-tight leading-none">
            Notifications
          </h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2 shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </header>

      {loading && notifications.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" text={["LOADING..."]} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-border bg-card/40 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
          <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4 relative" />
          <h3 className="font-display text-xl italic text-foreground mb-2 relative">All caught up!</h3>
          <p className="text-sm text-muted-foreground relative max-w-xs mx-auto">No notifications yet. Connect with people and join cliques to see activity here.</p>
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
              className="w-full py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors text-center"
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
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
          notif.read
            ? 'border-border bg-card/40 hover:bg-card/60 hover:shadow-sm'
            : 'border-primary/15 bg-primary/[0.03] shadow-sm hover:shadow-md'
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

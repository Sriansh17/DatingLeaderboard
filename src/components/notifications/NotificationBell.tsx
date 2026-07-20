'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, UserPlus, Users, ChevronRight, ChevronDown, MessageCircle, Check, X, Send, XCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import type { Notification as NotificationType, ConnectionRequest } from '@/types/database';
import { NOTIFICATION_POLL_INTERVAL } from '@/lib/utils/constants';

const NOTIFICATION_MESSAGES: Record<string, { icon: typeof Bell; message: (name: string) => string; color: string }> = {
  connection_request: {
    icon: UserPlus,
    message: (name) => `${name} wants to connect`,
    color: 'text-primary',
  },
  connection_accepted: {
    icon: Heart,
    message: (name) => `${name} accepted your connection request`,
    color: 'text-success',
  },
  clique_invite: {
    icon: Users,
    message: (name) => `${name} invited you to a bond`,
    color: 'text-gold',
  },
  clique_joined: {
    icon: UserPlus,
    message: (name) => `${name} joined your bond`,
    color: 'text-primary',
  },
  post_like: {
    icon: Heart,
    message: (name) => `${name} liked your post`,
    color: 'text-destructive',
  },
  post_comment: {
    icon: MessageCircle,
    message: (name) => `${name} commented on your post`,
    color: 'text-primary',
  },
  mention: {
    icon: MessageCircle,
    message: (name) => `${name} mentioned you in a comment`,
    color: 'text-gold',
  },
};

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestsExpanded, setRequestsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      const data = await res.json();
      if (data.success) setUnreadCount(data.data.count);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=5');
      const data = await res.json();
      if (data.success) setNotifications(data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/connections/requests');
      const data = await res.json();
      if (data.success) {
        setIncomingRequests(data.data.incoming || []);
        setOutgoingRequests(data.data.outgoing || []);
      }
    } catch {}
  }, []);

  const openDropdown = async () => {
    setOpen(true);
    await Promise.all([fetchNotifications(), fetchRequests()]);
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setUnreadCount(0);
    } catch {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, NOTIFICATION_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const respondToRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (data.success) {
        addToast(action === 'accepted' ? 'Connected!' : 'Declined', 'success');
        await Promise.all([fetchRequests(), fetchUnreadCount()]);
      } else addToast(data.error || 'Failed', 'error');
    } catch { addToast('Something went wrong', 'error'); }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        addToast('Request cancelled', 'info');
        await Promise.all([fetchRequests(), fetchUnreadCount()]);
      }
    } catch { addToast('Failed to cancel', 'error'); }
  };

  const hasRequests = incomingRequests.length > 0 || outgoingRequests.length > 0;
  const allItems = notifications.length + incomingRequests.length + outgoingRequests.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={openDropdown}
        className="relative p-2 rounded-full border border-border bg-card/80 backdrop-blur text-muted-foreground hover:text-foreground hover:bg-card active:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {(unreadCount > 0 || incomingRequests.length > 0) && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-destructive/15 backdrop-blur-[16px] border border-destructive/30 text-[10px] font-bold text-destructive px-1.5 leading-none shadow-[0_4px_12px_-4px_rgb(230,90,90,0.25)] ring-2 ring-background">
            {unreadCount + incomingRequests.length > 9 ? '9+' : unreadCount + incomingRequests.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed left-2 right-2 sm:absolute sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-[360px] rounded-2xl border border-border bg-card/80 backdrop-blur-2xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
              <h3 className="font-display text-sm italic text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-elevated active:bg-elevated/80 transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {/* Requests — expandable */}
              {hasRequests && (
                <div className="border-b border-border/50">
                  <button
                    onClick={() => setRequestsExpanded(!requestsExpanded)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-elevated/50 active:bg-elevated/70 transition-colors"
                  >
                    <span className="text-xs text-foreground font-medium flex items-center gap-2">
                      <UserPlus className="h-3.5 w-3.5 text-primary" /> Pending requests
                    </span>
                    <span className="flex items-center gap-2 text-[10px]">
                      {incomingRequests.length > 0 && <span className="text-primary font-medium">{incomingRequests.length} to accept</span>}
                      {outgoingRequests.length > 0 && <span className="text-warning">{outgoingRequests.length} sent</span>}
                      <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${requestsExpanded ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {requestsExpanded && (
                    <div className="px-4 pb-3 space-y-1.5">
                      {incomingRequests.slice(0, 5).map(req => {
                        const sender = req.sender as any;
                        return (
                          <div key={req.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-primary/5">
                            <Link href={`/users/${sender?.id}`} onClick={() => setOpen(false)} className="text-xs text-foreground font-medium hover:text-primary active:text-primary/80 transition-colors min-w-0 flex-1 truncate">
                              <span className="no-underline">@</span><span className="underline decoration-dotted decoration-muted-foreground/30">{sender?.username || 'Someone'}</span>
                            </Link>
                            <div className="flex gap-0.5 shrink-0 ml-1">
                              <button onClick={() => respondToRequest(req.id, 'accepted')} className="inline-flex items-center justify-center w-7 h-7 rounded-full glass-btn touch-target"><Check className="h-3.5 w-3.5" /></button>
                              <button onClick={() => respondToRequest(req.id, 'rejected')} className="inline-flex items-center justify-center w-7 h-7 rounded-full glass-btn text-muted-foreground hover:text-destructive touch-target"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        );
                      })}
                      {outgoingRequests.slice(0, 5 - incomingRequests.length).map(req => {
                        const receiver = req.receiver as any;
                        return (
                          <div key={req.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-warning/5">
                            <span className="text-xs text-muted-foreground min-w-0 flex-1 truncate">
                              @{receiver?.username || 'Someone'} <span className="text-warning">· sent</span>
                            </span>
                            <button onClick={() => cancelRequest(req.id)} className="p-1 rounded-full glass-btn text-muted-foreground hover:text-destructive shrink-0 ml-1">
                              <XCircle className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      {(incomingRequests.length + outgoingRequests.length) > 5 && (
                        <Link
                          href="/circles#requests"
                          onClick={() => setOpen(false)}
                          className="block text-center text-[10px] text-primary font-medium py-1.5 hover:underline active:underline"
                        >
                          View all {(incomingRequests.length + outgoingRequests.length) - 5} more →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications list */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 && !hasRequests ? (
                <div className="text-center py-12 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-elevated border border-border flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">All quiet here</p>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[240px] mx-auto">
                    Likes, comments, connection requests, and bond invites will show up here.
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => {
                    const config = NOTIFICATION_MESSAGES[notif.type];
                    const Icon = config?.icon || Bell;

                    // Build the display message — support grouped notifications
                    const grouped = (notif as any)._groupedActors as Array<{ id: string; username: string }> | undefined;
                    let displayMessage: string;
                    if (grouped && grouped.length > 0) {
                      const names = grouped.map(a => a.username || 'Someone');
                      if (names.length === 1) {
                        displayMessage = config ? config.message(names[0]) : `${names[0]} interacted with you`;
                      } else if (names.length === 2) {
                        displayMessage = config
                          ? config.message(`${names[0]} and ${names[1]}`)
                          : `${names[0]} and ${names[1]} interacted with you`;
                      } else {
                        const others = names.length - 2;
                        displayMessage = config
                          ? config.message(`${names[0]}, ${names[1]} and ${others} other${others > 1 ? 's' : ''}`)
                          : `${names[0]}, ${names[1]} and ${others} other${others > 1 ? 's' : ''} interacted with you`;
                      }
                    } else {
                      const actorName = notif.actor?.username || 'Someone';
                      displayMessage = config ? config.message(actorName) : `${actorName} interacted with you`;
                    }

                    return (
                      <button
                        key={notif.id}
                        onClick={() => { setOpen(false); handleNotifClick(notif); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated active:bg-elevated/80 transition-colors text-left border-b border-border/50 last:border-b-0"
                      >
                        <div className={`shrink-0 ${config?.color || 'text-muted-foreground'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{displayMessage}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatRelativeTime(notif.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gold/40 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary hover:bg-elevated active:bg-elevated/80 border-t border-border/80 transition-colors"
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function handleNotifClick(notif: NotificationType) {
    if (notif.type === 'clique_invite' && notif.reference_id) {
      router.push(`/circles/${notif.reference_id}`);
    } else if ((notif.type === 'post_comment' || notif.type === 'post_like' || notif.type === 'mention') && notif.reference_id) {
      router.push(`/posts/${notif.reference_id}`);
    } else if (notif.actor) {
      router.push(`/users/${notif.actor_id}`);
    }
  }
}

function formatRelativeTime(dateStr: string): string {
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

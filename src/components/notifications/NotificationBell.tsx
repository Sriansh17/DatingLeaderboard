'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, UserPlus, Users, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import type { Notification as NotificationType } from '@/types/database';

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
    message: (name) => `${name} invited you to a clique`,
    color: 'text-gold',
  },
  clique_joined: {
    icon: UserPlus,
    message: (name) => `${name} joined your clique`,
    color: 'text-primary',
  },
};

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch {
      // silently fail for polling
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=5');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const openDropdown = async () => {
    setOpen(true);
    await fetchNotifications();
    // Mark all as read
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  // Poll for unread count
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={openDropdown}
        className="relative flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:bg-card transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1 shadow-sm ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
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
            className="absolute right-0 top-full mt-2 w-[340px] rounded-2xl border border-border bg-card/80 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
              <h3 className="font-display text-sm italic text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* List */}
            <div className="max-h-[320px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 px-4 relative">
                  <div className="absolute inset-0 bg-primary/[0.02] blur-3xl pointer-events-none" />
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3 relative" />
                  <p className="text-sm text-muted-foreground relative">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 relative">
                    Your connections and cliques will show up here
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => {
                    const config = NOTIFICATION_MESSAGES[notif.type];
                    const Icon = config?.icon || Bell;
                    const actorName = (notif.actor as any)?.username || 'Someone';
                    return (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setOpen(false);
                          if (notif.type === 'clique_invite' && notif.reference_id) {
                            router.push(`/circles/${notif.reference_id}`);
                          } else if (notif.actor) {
                            router.push(`/users/${notif.actor_id}`);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors text-left border-b border-border/50 last:border-b-0"
                      >
                        <div className={`shrink-0 ${config?.color || 'text-muted-foreground'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            {config ? config.message(actorName) : `${actorName} interacted with you`}
                          </p>
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
              className="block text-center py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary hover:bg-elevated border-t border-border/80 transition-colors"
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

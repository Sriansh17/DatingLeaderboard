'use client';

import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { Settings, LogOut, Crown, Sparkles, ArrowLeft, User, Sun, Moon, Palette, Bell, BellOff, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PremiumLaunchModal } from '@/components/ui/PremiumLaunchModal';

export default function SettingsPage() {
  const { profile, user, signOut } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const { addToast } = useToast();
  const [notifStatus, setNotifStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [notifLoading, setNotifLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setNotifStatus('unsupported');
      return;
    }
    setNotifStatus(Notification.permission as 'default' | 'granted' | 'denied');
  }, []);

  const subscribeUser = async () => {
    try {
      setNotifLoading(true);

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported by this browser.');
      }

      if (!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '').trim()) {
        throw new Error('Push notifications are not configured (missing VAPID public key).');
      }

      const permission = await Notification.requestPermission();
      setNotifStatus(permission as 'granted' | 'denied' | 'default');
      if (permission !== 'granted') {
        addToast('Notification permission denied.', 'warning');
        return;
      }

      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (!existingRegistration) {
        await navigator.serviceWorker.register('/sw.js');
      }

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        const json = existing.toJSON();
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        if (!res.ok) throw new Error('Failed to sync existing subscription');
        addToast('Notifications already enabled.', 'info');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      const json = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error('Failed to save subscription');
      addToast('Push notifications enabled!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to enable notifications.', 'error');
    } finally {
      setNotifLoading(false);
    }
  };

  const unsubscribeUser = async () => {
    try {
      setNotifLoading(true);
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        addToast('Already unsubscribed.', 'info');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) { addToast('Already unsubscribed.', 'info'); return; }
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
      setNotifStatus('default');
      addToast('Push notifications disabled.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to disable notifications.', 'error');
    } finally {
      setNotifLoading(false);
    }
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 relative">
      {/* Fond rose glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/[0.05] blur-3xl pointer-events-none" />

      {/* Back button */}
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-xs font-semibold touch-target"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Profile
      </Link>

      {/* Fond header pattern */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2 flex items-center gap-2">
          <Settings className="h-3.5 w-3.5" /> Configuration
        </p>
        <h1 className="font-display text-5xl sm:text-6xl italic text-foreground tracking-tight leading-none">
          Settings
        </h1>
      </header>

      <div className="space-y-5">

        {/* Profile Summary */}
        <div className="glass-2 rounded-3xl p-5 flex items-center gap-4">
          <Avatar src={profile?.avatar_url} alt={profile?.username || ''} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg italic text-foreground truncate">
              {profile?.username || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
            </p>
          </div>
          {profile?.is_premium && (
            <Badge variant="info" className="shrink-0">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
        </div>

        {/* Account */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg italic text-foreground">Account</h2>
          </div>
          <div className="space-y-2">
            {profile?.is_premium ? (
              <Link href="/premium" className="flex items-center justify-start gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold w-full">
                <Crown className="h-4 w-4 text-gold" /> Manage Premium
              </Link>
            ) : (
              <button onClick={() => setShowPremiumModal(true)} className="flex items-center justify-start gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold w-full">
                <Sparkles className="h-4 w-4" /> Unlock Premium
              </button>
            )}
            <button onClick={signOut} className="flex items-center justify-start gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold w-full">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
          {profile?.is_admin && (
            <div className="mt-3 pt-3 border-t border-border">
              <Link href="/admin/notifications" className="flex items-center justify-start gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold w-full">
                <ShieldCheck className="h-4 w-4 text-gold" />
                Admin — Send Notifications
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg italic text-foreground">Notifications</h2>
          </div>
          {notifStatus === 'unsupported' ? (
            <p className="text-sm text-muted-foreground">Push notifications are not supported by your browser.</p>
          ) : notifStatus === 'denied' ? (
            <p className="text-sm text-muted-foreground">
              Notifications are blocked. Enable them in your browser site settings, then reload.
            </p>
          ) : notifStatus === 'granted' ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-green-500" /> Push notifications enabled
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">You will receive updates from Fond.</p>
              </div>
              <button
                onClick={unsubscribeUser}
                disabled={notifLoading}
                className="flex items-center gap-1.5 rounded-full glass-btn px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                <BellOff className="h-3.5 w-3.5" />
                {notifLoading ? 'Disabling…' : 'Disable'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Stay in the loop</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified about new scores, leaderboard changes and more.</p>
              </div>
              <button
                onClick={subscribeUser}
                disabled={notifLoading}
                className="flex items-center gap-1.5 rounded-full glass-btn px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                <Bell className="h-3.5 w-3.5" />
                {notifLoading ? 'Enabling…' : 'Enable'}
              </button>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg italic text-foreground">Appearance</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium border transition-all touch-target ${
                resolvedTheme === 'light'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium border transition-all touch-target ${
                resolvedTheme === 'dark'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>

        {/* About */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-gold" />
            <h2 className="font-display text-lg italic text-foreground">About Fond</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The world&apos;s first relationship leaderboard. Post one story. AI judges it. Couples compete in your city — and on the planet.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">🍷 AI that roasts</span>
            <span className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-semibold">🏆 12k+ couples</span>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">💅 Verdicts are final</span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">Version 1.0.0 · Made with ❤️</p>
        </div>

      </div>

      <PremiumLaunchModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        source="settings"
      />
    </div>
  );
}

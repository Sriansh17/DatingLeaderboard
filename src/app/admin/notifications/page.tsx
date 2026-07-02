'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Bell, Send, Users, Crown, User, ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Target = 'all' | 'premium' | string;

interface SendResult {
  sent: number;
  failed: number;
  message?: string;
}

export default function AdminNotificationsPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [target, setTarget] = useState<Target>('all');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [subCount, setSubCount] = useState<number | null>(null);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!loading && profile && !profile.is_admin) {
      router.replace('/dashboard');
    }
  }, [loading, profile, router]);

  // Fetch subscriber count
  useEffect(() => {
    if (!profile?.is_admin) return;
    fetch('/api/push/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setSubCount(d.count); })
      .catch(() => {});
  }, [profile?.is_admin]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      addToast('Title and message are required.', 'warning');
      return;
    }
    try {
      setIsSending(true);
      setResult(null);
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url: url.trim() || '/', target }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Send failed');
      setResult({ sent: json.sent, failed: json.failed, message: json.message });
    } catch (err: any) {
      addToast(err.message || 'Failed to send notifications.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile.is_admin) return null;

  return (
    <main className="max-w-2xl mx-auto px-5 py-8 min-h-screen">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2 flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" /> Admin
        </p>
        <h1 className="font-display text-5xl italic text-foreground leading-none">Send Notification</h1>
        {subCount !== null && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{subCount}</span> device{subCount === 1 ? '' : 's'} subscribed
          </p>
        )}
      </header>

      <div className="space-y-5">

        {/* Target audience */}
        <div className="glass-2 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">Audience</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'all', label: 'All Users', icon: Users },
              { value: 'premium', label: 'Premium Only', icon: Crown },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTarget(value as Target)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-all ${
                  target === value
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="glass-2 rounded-3xl p-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Message</p>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. New leaderboard update!"
              className="w-full rounded-2xl border border-border bg-card/80 px-5 py-3 text-sm text-foreground outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="e.g. Check out this week's top couples on the global leaderboard."
              className="w-full resize-none rounded-2xl border border-border bg-card/80 px-5 py-3 text-sm text-foreground outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/40"
            />
            <p className="text-right text-xs text-muted-foreground">{body.length}/200</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Link (optional)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. /leaderboards"
              className="w-full rounded-2xl border border-border bg-card/80 px-5 py-3 text-sm text-foreground outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="glass-2 rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">Preview</p>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-elevated/40 p-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title || 'Title'}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body || 'Message body…'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isSending || !title.trim() || !body.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="h-4 w-4" /> Send Notification</>
          )}
        </button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-2xl border p-4 flex items-center gap-3 ${
                result.sent > 0
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-border bg-elevated/40'
              }`}
            >
              {result.sent > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div>
                {result.message ? (
                  <p className="text-sm text-foreground">{result.message}</p>
                ) : (
                  <p className="text-sm text-foreground">
                    Sent to <span className="font-bold">{result.sent}</span> device{result.sent === 1 ? '' : 's'}
                    {result.failed > 0 && (
                      <span className="text-muted-foreground"> · {result.failed} failed</span>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

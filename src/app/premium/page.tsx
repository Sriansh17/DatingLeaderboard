'use client';

import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { Crown, Sparkles, ArrowLeft, Bell, Infinity, Users, Edit3, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const PREVIEW_FEATURES = [
  { icon: Infinity, label: 'Unlimited posts per day', desc: 'No more daily caps. Post as often as love inspires you.' },
  { icon: Users, label: 'Multiple partners', desc: 'Add everyone who makes your heart race — no limit.' },
  { icon: Edit3, label: 'Edit past posts', desc: 'Rewrite your story and get a fresh AI verdict.' },
  { icon: Zap, label: 'Priority AI scoring', desc: 'Skip the queue. Your posts get judged first.' },
];

export default function PremiumPage() {
  const { profile } = useUser();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-gold/[0.04] blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
        </Link>

        {/* Hero section */}
        <div className="text-center mb-12">
          {/* Crown with ring animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-20 h-20 mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border border-gold/30 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(199,169,107,0.3)]">
              <Crown className="h-9 w-9 text-gold" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-gold/70 mb-3">
              Coming Soon
            </p>
            <h1 className="font-display text-5xl sm:text-6xl italic text-foreground leading-tight mb-4">
              The Crown Awaits
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We&apos;re crafting something extraordinary — unlimited posts, deeper insights, and the full Fond experience. 
              The throne is almost ready.
            </p>
          </motion.div>
        </div>

        {/* Feature preview grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid sm:grid-cols-2 gap-3 mb-10"
        >
          {PREVIEW_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="group rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 hover:border-gold/20 hover:bg-gold/[0.02] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <h3 className="font-display text-base italic text-foreground">
                    {feature.label}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed pl-12">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          {profile?.is_premium ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-6 py-3 text-sm text-gold font-medium">
              <Crown className="h-4 w-4" />
              You&apos;re already Premium
            </div>
          ) : (
            <div className="space-y-4">
              <button
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-gold via-gold/80 to-gold px-10 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-8px_rgba(199,169,107,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  <Bell className="h-4 w-4" />
                  Notify Me When It Launches
                </span>
              </button>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                No spam. One ping when the crown is ready.
              </p>
            </div>
          )}
        </motion.div>

        {/* Bottom flourish */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground/40">
            <Sparkles className="h-3 w-3" />
            <span>Early birds get exclusive perks</span>
            <Heart className="h-3 w-3" />
            <span>Built with love, scored by AI</span>
            <Sparkles className="h-3 w-3" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

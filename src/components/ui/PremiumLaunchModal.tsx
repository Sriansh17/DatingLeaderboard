'use client';

import { Modal } from '@/components/ui/Modal';
import { Crown, Sparkles, Bell, Zap, Infinity, Users, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const PREVIEW_FEATURES = [
  { icon: Infinity, label: 'Unlimited posts per day' },
  { icon: Users, label: 'Multiple partners' },
  { icon: Edit3, label: 'Edit past posts' },
  { icon: Zap, label: 'Priority AI scoring' },
];

export function PremiumLaunchModal({ isOpen, onClose, source }: PremiumLaunchModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" className="max-w-sm bg-background/95 border-gold/20 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="relative py-2">
        {/* Ambient glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gold/[0.07] blur-[60px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-6">
          {/* Crown icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-16 h-16"
          >
            <div className="absolute inset-0 rounded-full glass-btn-gold animate-ping" style={{ animationDuration: '3s' }} />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center shadow-[0_0_30px_-8px_rgba(199,169,107,0.3)]">
              <Crown className="h-7 w-7 text-gold" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold/70 mb-2">
              Coming Soon
            </p>
            <h2 className="font-display text-3xl italic text-foreground leading-tight">
              The Crown Awaits
            </h2>
            <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed max-w-[260px] mx-auto">
              We&apos;re putting the final touches on something extraordinary. Premium unlocks the full Fond experience.
            </p>
          </motion.div>

          {/* Feature preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-2"
          >
            {PREVIEW_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-elevated/40 p-3 text-left"
                >
                  <Icon className="h-3.5 w-3.5 text-gold/70 shrink-0" />
                  <span className="text-[10px] font-medium text-foreground/70 leading-tight">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </motion.div>

          {/* Notify CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <button
              onClick={onClose}
              className="group relative w-full overflow-hidden rounded-full glass-btn-gold px-6 py-3.5 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-6px_rgba(199,169,107,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Bell className="h-4 w-4" />
                Notify Me When It Launches
              </span>
            </button>
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">
              No spam. Just one ping when we go live.
            </p>
          </motion.div>

          {/* Bottom sparkle accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/40"
          >
            <Sparkles className="h-3 w-3" />
            <span>Early birds get exclusive perks</span>
            <Sparkles className="h-3 w-3" />
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}

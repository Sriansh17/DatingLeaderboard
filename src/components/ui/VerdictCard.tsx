"use client";

import { tierForScore, scoreColor } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  score: number;
  verdict: string;
  username: string;
  partnerNickname: string;
  city?: string;
  globalRank?: number;
  suspectedFabrication?: boolean;
  compact?: boolean;
  explanationStr?: string | null;
}

export function VerdictCard({
  score,
  verdict,
  username,
  partnerNickname,
  city,
  globalRank,
  suspectedFabrication,
  compact,
  explanationStr,
}: Props) {
  const tier = tierForScore(score);
  const color = scoreColor(score);

  let breakdown: Record<string, number> | null = null;
  if (explanationStr) {
    try {
      breakdown = JSON.parse(explanationStr);
    } catch (e) {
      // Not valid JSON, ignore
    }
  }

  const containerVariants: any = {
    hidden: { opacity: 0, filter: "blur(20px)" },
    visible: { 
      opacity: 1, filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_40px_-15px_rgba(0,0,0,0.4)]"
      style={{ '--gold': color } as React.CSSProperties}
    >
      {/* Halo Pulse after score counts up */}
      <motion.div
        initial={{ boxShadow: `0 0 0 0 rgba(0,0,0,0)` }}
        animate={{ boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 40px ${color}00`] }}
        transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 rounded-3xl pointer-events-none"
      />

      {/* decorative corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-10 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal"
        style={{ background: color }}
      />

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground relative z-10">
        <span className="font-display italic text-gold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Fond
        </span>
        <span>Verdict № {Math.floor(score * 137) % 9999}</span>
      </div>

      <div className={`mt-6 flex items-end gap-4 ${compact ? "" : "sm:gap-6"} relative z-10`}>
        <div className="relative">
          {/* Layer 2: Romance Particles Anchored to Score */}
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const distance = 60 + Math.random() * 40;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.5, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="absolute w-2 h-2 rounded-full mix-blend-screen"
                  style={{ backgroundColor: color, filter: "blur(1px)" }}
                />
              );
            })}
          </div>

          <div
            className="font-score leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:drop-shadow-none [text-shadow:none] dark:[text-shadow:0_0_15px_var(--glow-color)] relative z-10"
            style={{
              fontSize: compact ? 80 : 112,
              color,
              "--glow-color": `color-mix(in oklab, ${color} 20%, transparent)`
            } as React.CSSProperties}
          >
            <AnimatedNumber value={score} delay={0.4} instant={false} />
          </div>
        </div>
        <div className="pb-2">
          <motion.div variants={itemVariants} className="font-display text-xl text-foreground relative overflow-hidden">
            {/* Soft shimmer across title once */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-overlay" 
            />
            {tier}
          </motion.div>
          <motion.div variants={itemVariants} className="text-xs text-muted-foreground">
            out of 100.0
          </motion.div>
        </div>
      </div>

      <motion.p variants={itemVariants} className="mt-6 font-display text-lg italic leading-snug text-foreground relative z-10">
        “{verdict}”
      </motion.p>

      <motion.div variants={itemVariants} className="relative z-10">
        {/* Detailed Score Breakdown */}
        {breakdown && !compact && (
          <div className="mt-8 space-y-4 rounded-2xl bg-elevated/40 p-6 border border-border">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              AI Score Breakdown
            </h4>
            {Object.entries(breakdown).map(([key, value]) => {
              const maxValues: Record<string, number> = { thoughtfulness: 30, romance: 25, effort: 20, uniqueness: 15, emotional_impact: 10 };
              const max = maxValues[key.toLowerCase()] || 25;
              const percentage = Math.min(100, Math.max(0, (Number(value) / max) * 100));
              const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-display text-foreground/90 text-base">{formattedKey}</span>
                    <span className="text-muted-foreground font-mono text-xs">{Number(value)}/{max}</span>
                  </div>
                  <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
          <span className="text-foreground font-medium">
            {username} <span className="text-muted-foreground">×</span>{" "}
            <span className="text-blush">{partnerNickname}</span>
          </span>
          {city && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{city}</span>
            </>
          )}
          {globalRank && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-gold">Global #{globalRank}</span>
            </>
          )}
        </div>
      </motion.div>

      {suspectedFabrication && (
        <div
          className="absolute right-4 top-20 rotate-12 rounded-md border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ borderColor: "var(--warning)", color: "var(--warning)" }}
        >
          Suspected Fabrication
        </div>
      )}
    </motion.div>
  );
}

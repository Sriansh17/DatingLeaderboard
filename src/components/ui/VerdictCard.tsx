"use client";

import { tierForScore, tierInfoForScore, scoreColor } from "@/lib/mock-data";
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
  const tier = tierInfoForScore(score);
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
      className={`relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_40px_-15px_rgba(0,0,0,0.4)] transition-all duration-700 ${
        score >= 97
          ? 'border-gold/50 shadow-[0_20px_40px_-10px_rgba(199,169,107,0.25)]'
          : score >= 90
          ? 'border-gold/20 shadow-[0_20px_40px_-15px_rgba(199,169,107,0.12)]'
          : 'border-border'
      }`}
      style={{ '--gold': color } as React.CSSProperties}
    >
      {/* Halo Pulse after score counts up */}
      <motion.div
        initial={{ boxShadow: `0 0 0 0 rgba(0,0,0,0)` }}
        animate={{ boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 40px ${color}00`] }}
        transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
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
            {[...Array(score >= 90 ? 14 : 8)].map((_, i) => {
              const total = score >= 90 ? 14 : 8;
              const angle = (i / total) * Math.PI * 2;
              const distance = score >= 90 ? 80 + Math.random() * 50 : 60 + Math.random() * 40;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: score >= 90 ? 2 : 1.5, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }}
                  transition={{ duration: score >= 90 ? 1.6 : 1.2, delay: score >= 90 ? 1.5 : 1.2, ease: "easeOut" }}
                  className="absolute w-2 h-2 rounded-full mix-blend-screen"
                  style={{ backgroundColor: color, filter: "blur(1px)" }}
                />
              );
            })}
          </div>

          {/* Legendary extra outer glow ring */}
          {score >= 90 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.4, 1.8] }}
              transition={{ delay: 0.8, duration: 2, ease: "easeOut" }}
              className="absolute inset-[-30px] rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }}
            />
          )}

          <div
            className="font-score leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:drop-shadow-none [text-shadow:none] dark:[text-shadow:0_0_15px_var(--glow-color)] relative z-10"
            style={{
              fontSize: compact ? 80 : 112,
              color,
              "--glow-color": `color-mix(in oklab, ${color} ${score >= 90 ? '35%' : '20%'}, transparent)`
            } as React.CSSProperties}
          >
            {/* Held-breath: show 0 briefly, then count up after 400ms pause */}
            <AnimatedNumber value={score} delay={1.1} instant={false} />
          </div>
        </div>
        <div className="pb-2">
          <motion.div variants={itemVariants} className="font-display text-2xl font-bold text-foreground relative overflow-hidden">
            {/* Soft shimmer across title once — delayed so user reads the tier name first */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ delay: 1.4, duration: 1.8, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-overlay"
            />
            <span className="flex items-center gap-2">
              <span>{tier.emoji}</span>
              <span>{tier.name}</span>
            </span>
          </motion.div>
          <motion.div variants={itemVariants} className="text-xs text-muted-foreground mt-0.5">
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
          <div className="mt-8 rounded-2xl bg-elevated/40 p-6 border border-border">
            <h4 className="font-sans text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5">
              Score Breakdown
            </h4>
            <div className="space-y-4">
              {Object.entries(breakdown).map(([key, value]) => {
                const DIMENSION_META: Record<string, { label: string; desc: string; max: number }> = {
                  thoughtfulness:   { label: 'Thoughtfulness',   desc: 'How well did they know you?',       max: 30 },
                  effort:           { label: 'Effort',           desc: 'What did they give of themselves?',  max: 25 },
                  creativity:       { label: 'Creativity',       desc: 'Was it inventive or unexpected?',    max: 20 },
                  emotional_weight: { label: 'Emotional Weight', desc: 'Did it land deep or bounce off?',    max: 15 },
                  authenticity:     { label: 'Authenticity',     desc: 'Selfless love, or for the photo?',  max: 10 },
                };
                const meta = DIMENSION_META[key.toLowerCase()] || { label: key, desc: '', max: 25 };
                const percentage = Math.min(100, Math.max(0, (Number(value) / meta.max) * 100));
                const barColor = percentage >= 80 ? color : percentage >= 50 ? `${color}99` : `${color}66`;

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans font-semibold text-foreground/90 text-sm">{meta.label}</span>
                        <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">{meta.desc}</span>
                      </div>
                      <span className="text-muted-foreground font-score text-sm tracking-wide tabular-nums">{Number(value)}<span className="text-[10px] opacity-40 font-sans">/{meta.max}</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
        <motion.div
          initial={{ opacity: 0, rotate: -6, scale: 0.85 }}
          animate={{ opacity: 1, rotate: -6, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-4 right-4 z-20 pointer-events-none"
        >
          <div
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded border-2 shadow-[0_0_20px_rgba(240,169,74,0.3)]"
            style={{
              borderColor: "rgb(var(--warning))",
              color: "rgb(var(--warning))",
              background: "rgb(var(--warning) / 0.08)",
              textShadow: "0 0 12px rgb(var(--warning) / 0.5)",
            }}
          >
            ⚠ Suspected Fabrication
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

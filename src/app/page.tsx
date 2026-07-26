'use client';

import Link from "next/link";
import { VerdictCard } from "@/components/ui/VerdictCard";
import { stories, tickerItems, leaderboard, scoreColor } from "@/lib/mock-data";
import { ArrowRight, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-cycle through the top 3 sample verdicts every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const hero = stories[heroIndex];

  return (
    <div className="min-h-dvh bg-transparent">
      {/* Nav */}
      <header className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
        <span className="font-display text-lg italic text-gold flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Fond
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden sm:inline-flex text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground active:text-foreground transition-colors"
          >
            Creators
          </Link>
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="rounded-full glass-btn px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 touch-target"
          >
            Open the App →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1400px] gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr,1fr] lg:items-center">
        <div className="animate-float-up overflow-visible">
          {/* Tagline badge — moved up from footer */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs text-primary font-medium mb-4">
            Romance meets reality TV
          </span>
          <span className="block text-xs uppercase tracking-[0.25em] text-gold font-bold mb-3">
            The world&apos;s first relationship leaderboard
          </span>
          <h1 className="font-display text-4xl leading-[1.2] tracking-tight sm:text-6xl text-foreground pb-3">
            Your relationship<br />
            has a{" "}
            <span className="text-gradient-crimson italic">score.</span>
            <br />
            <span className="text-gradient-gold italic">What&apos;s yours?</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Share a moment from your relationship. Our AI scores it out of 100. See how you rank against couples in your city and around the world.
          </p>

          {/* Social proof — near CTAs not buried in footer */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {['🇮🇳', '🇺🇸', '🇫🇷', '🇯🇵'].map((flag, i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-elevated border border-border text-[11px] flex items-center justify-center">{flag}</div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">12,402</span> couples ranked globally
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth/signup"
              className="rounded-full glass-btn px-6 py-3.5 text-base font-medium inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Get My Score <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leaderboards"
              className="rounded-full glass-btn px-6 py-3.5 text-base font-medium inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              See the Leaderboard
            </Link>
          </div>
        </div>

        {/* Auto-cycling VerdictCard */}
        <div className="lg:pl-6 relative w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <VerdictCard
                score={hero.score}
                verdict={hero.verdict}
                username={hero.username}
                partnerNickname={hero.partnerNickname}
                city={hero.city}
                globalRank={heroIndex + 1}
                suspectedFabrication={hero.suspectedFabrication}
              />
            </motion.div>
          </AnimatePresence>
          {/* Cycle indicator dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${heroIndex === i ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground active:bg-muted-foreground'}`}
                aria-label={`View verdict ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-border bg-elevated/40 py-4">
        <div className="mx-auto max-w-[1400px] px-6 flex items-center justify-center gap-8 sm:gap-12 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-2"><span className="font-bold text-foreground">12,402</span> couples ranked</span>
          <span className="hidden sm:flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" /></span>
          <span className="flex items-center gap-2"><span className="font-bold text-foreground">45,892</span> stories scored</span>
          <span className="hidden sm:flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" /></span>
          <span className="flex items-center gap-2"><span className="font-bold text-foreground">189</span> cities</span>
        </div>
      </section>

      {/* How it works — elevated background */}
      <section className="bg-elevated/20">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold">How it works</p>
        <h2 className="mt-2 font-display text-4xl italic text-foreground">Three steps to a verdict.</h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Write the story", d: "Tell us what your partner did. Be specific. Be honest." },
            { n: "02", t: "AI scores and roasts", d: "Out of 100. The verdict is one line. It will sting or sing." },
            { n: "03", t: "Share. Climb. Repeat.", d: "Share the card. Watch your rank move. Try to dethrone someone." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/20 active:border-primary/30 transition-colors">
              <div className="font-score text-5xl text-primary">{s.n}</div>
              <h3 className="mt-3 font-display text-xl text-foreground">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* AI humor showcase — elevated background */}
      <section className="bg-elevated/20">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Receipts</p>
        <h2 className="mt-2 font-display text-4xl italic text-foreground">The verdicts heard &apos;round the world.</h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 3).map((s) => (
            <VerdictCard
              key={s.id}
              score={s.score}
              verdict={s.verdict}
              username={s.username}
              partnerNickname={s.partnerNickname}
              city={s.city}
              suspectedFabrication={s.suspectedFabrication}
              compact
            />
          ))}
        </div>
        </div>
      </section>

      {/* Leaderboard preview */}
      <section className="mx-auto max-w-[1400px] px-6 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold">This week</p>
            <h2 className="mt-2 font-display text-4xl italic text-foreground">Top of the world.</h2>
          </div>
          <Link href="/leaderboards" className="text-sm text-primary hover:underline active:underline">
            View all →
          </Link>
        </div>

        <ol className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          {leaderboard.slice(0, 5).map((e, i) => (
            <motion.li
              key={e.rank}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t border-border" : ""} hover:bg-elevated/40 active:bg-elevated/60 transition-colors`}
            >
              <div className="font-score text-3xl shrink-0 w-12" style={{ color: e.rank <= 3 ? "rgb(var(--gold))" : "rgb(var(--muted-foreground))" }}>
                {e.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{e.username}</div>
                <div className="text-xs text-muted-foreground truncate">
                  with {e.partnerNickname} · {e.city}, {e.country}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.07 + 0.3 }}
                className="font-score text-2xl shrink-0"
                style={{ color: scoreColor(e.score) }}
              >
                {e.score.toFixed(1)}
              </motion.div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="font-display text-4xl italic sm:text-5xl text-foreground">
          Your partner deserves a score. <br />
          <span className="text-gradient-crimson">Give them one.</span>
        </h2>
        <Link
          href="/auth/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-full glass-btn px-8 py-4 text-lg font-medium hover:scale-105 active:scale-95 transition-transform"
        >
          Start For Free <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card. Just feelings.
        </p>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display italic text-gold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Fond
          </span>
        </div>
        <Link href="/contact" className="text-muted-foreground hover:text-foreground active:text-foreground transition-colors underline underline-offset-4 decoration-border">
          Meet the Creators
        </Link>
      </footer>
    </div>
  );
}

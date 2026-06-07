'use client';

import Link from "next/link";
import { VerdictCard } from "@/components/ui/VerdictCard";
import { stories, tickerItems, leaderboard, scoreColor } from "@/lib/mock-data";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const hero = stories[0];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-lg italic text-gold">Love Leaderboard</span>
        <Link
          href="/auth/login"
          className="rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur"
        >
          Open the App →
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr,1fr] lg:items-center">
        <div className="animate-float-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
            <Sparkles className="h-3.5 w-3.5" /> The world's first relationship leaderboard
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl text-foreground">
            Your relationship has a{" "}
            <span className="text-gradient-crimson italic">score.</span>{" "}
            <br />
            What's <span className="text-gradient-gold italic">yours?</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Post one story. AI judges it. The world sees it. Compete with couples in your city — and on the
            planet.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
            >
              Get My Score <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leaderboards"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/40 px-6 py-3.5 text-base text-foreground backdrop-blur hover:bg-elevated/60 transition-colors"
            >
              See the Leaderboard
            </Link>
          </div>
        </div>

        <div className="lg:pl-6">
          <VerdictCard
            score={hero.score}
            verdict={hero.verdict}
            username={hero.username}
            partnerNickname={hero.partnerNickname}
            city={hero.city}
            globalRank={4}
          />
        </div>
      </section>

      {/* Ticker */}
      <section className="overflow-hidden border-y border-border bg-elevated/40 py-3">
        <div className="flex w-max gap-10 whitespace-nowrap animate-marquee text-sm text-muted-foreground">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-blush" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">How it works</p>
        <h2 className="mt-2 font-display text-4xl italic text-foreground">Three steps to a verdict.</h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Write the story", d: "Tell us what your partner did. Be specific. Be honest." },
            { n: "02", t: "AI scores and roasts", d: "Out of 100. The verdict is one line. It will sting or sing." },
            { n: "03", t: "Share. Climb. Repeat.", d: "Share the card. Watch your rank move. Try to dethrone someone." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="font-score text-5xl text-blush">{s.n}</div>
              <h3 className="mt-3 font-display text-xl text-foreground">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI humor showcase */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Receipts</p>
        <h2 className="mt-2 font-display text-4xl italic text-foreground">The verdicts heard 'round the world.</h2>

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
      </section>

      {/* Leaderboard preview */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">This week</p>
            <h2 className="mt-2 font-display text-4xl italic text-foreground">Top of the world.</h2>
          </div>
          <Link href="/leaderboards" className="text-sm text-blush hover:underline">
            View all →
          </Link>
        </div>

        <ol className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          {leaderboard.slice(0, 5).map((e, i) => (
            <li
              key={e.rank}
              className={`flex items-center gap-4 px-5 py-4 ${
                i !== 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="font-score text-3xl" style={{ color: e.rank <= 3 ? "var(--gold)" : "var(--muted-foreground)", width: 44 }}>
                {e.rank}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{e.username}</div>
                <div className="text-xs text-muted-foreground">
                  with {e.partnerNickname} · {e.city}, {e.country}
                </div>
              </div>
              <div className="font-score text-2xl" style={{ color: scoreColor(e.score) }}>
                {e.score.toFixed(1)}
              </div>
            </li>
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
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
        >
          Start For Free <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          12,402 couples ranked. No credit card. Just feelings.
        </p>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <span className="font-display italic text-gold">Love Leaderboard</span> · Romance meets reality TV
      </footer>
    </div>
  );
}

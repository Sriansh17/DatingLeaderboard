'use client';

import { useQuery } from '@tanstack/react-query';
import { ConfessionCard } from './ConfessionCard';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkles, Lock, Heart, EyeOff } from 'lucide-react';
import { useAnonymousMode } from '@/components/providers/AnonymousModeProvider';
import Link from 'next/link';
import type { Confession } from '@/types/database';

async function fetchConfessions(): Promise<Confession[]> {
  const res = await fetch('/api/confessions');
  if (!res.ok) throw new Error('Failed to fetch confessions');
  const json = await res.json();
  return json.data || [];
}

export function ConfessionsFeed() {
  const { toggleAnonymousMode } = useAnonymousMode();
  const { data: confessions, isLoading, isError, error } = useQuery({
    queryKey: ['confessions'],
    queryFn: fetchConfessions,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <main className="w-full min-h-dvh bg-transparent">
      {/* Anonymous mode header bar — glass system */}
      <div className="border-b border-border/50 glass-1 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-bold text-primary">
            <Lock className="h-3 w-3 shrink-0" />
            <span>Anonymous Mode — Identity hidden</span>
          </div>
          <button
            onClick={toggleAnonymousMode}
            className="shrink-0 rounded-full glass-btn px-4 py-2 text-[11px] font-bold inline-flex items-center gap-1 touch-target"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Exit
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 pb-32">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm uppercase tracking-[0.25em] text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Anonymous Confessions
            </p>
          </div>
          <h1 className="font-display text-5xl md:text-6xl italic text-foreground tracking-tight">
            The Confession Wall
          </h1>
        </header>

        {isError ? (
          <div className="text-center py-16 sm:py-32 rounded-3xl border border-destructive/20 bg-destructive/5 backdrop-blur-xl">
            <div className="rounded-full glass-btn px-4 py-2">
              <Lock className="h-8 w-8 text-destructive/60" />
            </div>
            <h3 className="text-2xl font-display italic text-foreground mb-3">
              Couldn&apos;t load confessions
            </h3>
            <p className="text-muted-foreground text-sm mb-2 max-w-sm mx-auto">
              {error?.message || 'Something went wrong. The confessions table might not exist in Supabase yet.'}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">supabase-confessions-migration.sql</code> in your Supabase SQL editor
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-32 min-h-[50vh] items-center">
            <Spinner size="lg" text={["LOADING CONFESSIONS...", "ANONYMOUS MODE ACTIVE..."]} />
          </div>
        ) : !confessions || confessions.length === 0 ? (
          <div className="text-center py-32 rounded-3xl border border-border bg-elevated/50 backdrop-blur-xl">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-display italic text-foreground mb-4">
              No confessions yet.
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
              Be the first to share something real. Anonymously.
            </p>
            <Link
              href="/confessions/new"
              className="inline-flex items-center gap-2 rounded-2xl glass-btn text-sm font-bold shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98] px-6 py-3"
            >
              Write your confession
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {confessions.map((confession) => (
              <ConfessionCard key={confession.id} confession={confession} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

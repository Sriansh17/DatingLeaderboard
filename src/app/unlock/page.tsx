'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, Compass, PenLine } from 'lucide-react';

export default function UnlockPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  return (
    <main className="min-h-screen px-5 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl p-8 sm:p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Welcome
          </p>

          <h1 className="font-display text-4xl sm:text-5xl italic text-foreground leading-tight">
            Unlock Fond in one quick step
          </h1>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Add your first post to customize Fond around your story and unlock the full app. It only takes a minute.
          </p>

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Progress</p>
            <p className="mt-1 text-sm text-foreground">Step 1 of 1: First post</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/posts/new?first=1&next=${encodeURIComponent(nextPath)}`}
              className="inline-flex items-center justify-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-bold"
            >
              <PenLine className="h-4 w-4" /> Create First Post
            </Link>

            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold"
            >
              <Compass className="h-4 w-4" /> Explore Public Feed
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            You can still explore publicly now. Core features will unlock right after your first post.
          </p>

          <div className="mt-6 pt-5 border-t border-border/70">
            <Link
              href={`/posts/new?first=1&next=${encodeURIComponent(nextPath)}`}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-primary inline-flex items-center gap-1"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

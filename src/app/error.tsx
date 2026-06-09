'use client';

import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md w-full">
        <Heart className="h-10 w-10 text-primary/40 mx-auto mb-6 drop-shadow-sm" />
        <h1 className="text-3xl font-display italic text-foreground mb-4 leading-tight">
          Something went wrong
        </h1>
        <div className="bg-elevated/40 border border-border rounded-xl p-4 mb-8 text-left overflow-auto max-h-40">
          <p className="text-xs font-mono text-muted-foreground/80 leading-relaxed">
            {error.message || 'An unexpected error occurred in the motion system. Please try again.'}
          </p>
        </div>
        <button 
          onClick={reset}
          className="px-8 py-3 rounded-full bg-foreground text-background hover:scale-105 transition-transform duration-300 font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(var(--primary),0.15)]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

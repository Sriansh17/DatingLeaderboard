'use client';

import { Sparkles } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/50 backdrop-blur-sm text-foreground/80 hover:bg-card hover:text-foreground hover:shadow-glow transition-all duration-300 ${className}`}
      aria-label="Toggle Theme"
    >
      <Sparkles className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Sparkles className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}

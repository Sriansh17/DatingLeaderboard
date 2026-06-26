'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  label?: string;
  offset?: number;
}

export function ScrollToTop({ label, offset = 300 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > offset);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed top-28 left-1/2 -translate-x-1/2 z-40 rounded-full bg-white/90 dark:bg-background/90 border border-border shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)] backdrop-blur-2xl px-5 py-2.5 flex items-center gap-2.5 transition-all duration-300 cursor-pointer hover:bg-white dark:hover:bg-surface/80 active:bg-white dark:active:bg-surface ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="h-3.5 w-3.5 text-gold" />
      {label && <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">{label}</span>}
    </button>
  );
}

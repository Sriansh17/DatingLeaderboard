'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Trophy, Heart, Users, Settings, PlusCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

interface Action {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const actions: Action[] = [
    { id: 'new-post', label: 'New Post', description: 'Share a story', icon: <PlusCircle className="h-4 w-4" />, href: '/posts/new' },
    { id: 'leaderboard', label: 'Leaderboard', description: 'See the standings', icon: <Trophy className="h-4 w-4" />, href: '/leaderboards' },
    { id: 'bonds', label: 'Bonds', description: 'Your inner circle', icon: <Users className="h-4 w-4" />, href: '/circles' },
    { id: 'partners', label: 'Partners', description: 'Manage partners', icon: <Heart className="h-4 w-4" />, href: '/partners' },
    { id: 'settings', label: 'Settings', description: 'Account & preferences', icon: <Settings className="h-4 w-4" />, href: '/settings' },
  ];

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const filtered = query.trim()
    ? actions.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.description?.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  const handleSelect = useCallback((item: Action) => {
    onClose();
    if (item.href) router.push(item.href);
    if (item.action) item.action();
  }, [onClose, router]);

  useEffect(() => {
    if (!isOpen) { setQuery(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const el = document.querySelector<HTMLButtonElement>('[data-cmd-item]:not([data-cmd-hidden])');
        el?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('cmd-search')?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:bg-black/40"
            onClick={onClose}
          />

          {/* Mobile: bottom sheet | Desktop: centered modal */}
          <motion.div
            initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: '100%', opacity: 0 }}
            animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0, opacity: 1 }}
            exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 z-[110]
                       md:mx-auto md:max-w-lg
                       bottom-0 md:bottom-auto md:top-[15vh]
                       rounded-t-3xl md:rounded-3xl md:border md:border-border md:shadow-2xl
                       border-t border-border bg-popover backdrop-blur-2xl overflow-hidden"
          >
            {/* Handle for mobile drag indicator */}
            <div className="md:hidden mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/30" />

            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="cmd-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                autoComplete="off"
              />
              <kbd className="hidden md:inline-flex text-[10px] font-mono text-muted-foreground/40 border border-border rounded-md px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Actions list */}
            <div className="max-h-[50vh] overflow-y-auto p-2 space-y-0.5">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground/50 py-8">No results for &ldquo;{query}&rdquo;</p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    data-cmd-item
                    onClick={() => handleSelect(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = e.currentTarget.nextElementSibling as HTMLButtonElement;
                        next?.focus();
                      }
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = e.currentTarget.previousElementSibling as HTMLButtonElement;
                        if (prev) prev.focus();
                        else document.getElementById('cmd-search')?.focus();
                      }
                      if (e.key === 'Enter') handleSelect(item);
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm',
                      'text-foreground hover:bg-muted/50 active:bg-muted/80 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset'
                    )}
                  >
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-[11px] text-muted-foreground truncate">{item.description}</div>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

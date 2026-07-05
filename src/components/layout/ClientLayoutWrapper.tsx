'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppDock } from '@/components/ui/AppDock';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Search } from 'lucide-react';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Only show bottom padding for AppDock on pages that render it
  const showDock = pathname !== '/' && !pathname.startsWith('/auth') && !pathname.startsWith('/onboarding');

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        // Only on pages where dock is shown
        if (showDock) {
          e.preventDefault();
          setCmdOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDock]);

  return (
    <div className="min-h-dvh flex flex-col relative overflow-x-hidden">
      <div className={`flex-1 w-full mx-auto ${showDock ? 'pb-28 md:pb-32' : ''}`}>
        {children}
      </div>
      {showDock && (
        <div className="fixed bottom-[102px] sm:bottom-[122px] left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setCmdOpen(true)}
            className="h-8 px-3 rounded-full glass-btn inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider shadow-lg mx-auto touch-target"
            aria-label="Search (⌘K)"
          >
            <Search className="h-3 w-3" />
            Search
            <kbd className="hidden sm:inline-flex text-[8px] font-mono text-current/50 border border-current/20 rounded px-1 py-0.5 ml-0.5">⌘K</kbd>
          </button>
        </div>
      )}
      <AppDock />
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

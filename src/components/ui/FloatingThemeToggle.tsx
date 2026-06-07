'use client';

import { usePathname } from "next/navigation";
import { useTheme } from '@/components/providers/ThemeProvider';
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingThemeToggle() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!(pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding'))) {
    return null;
  }

  if (!isMounted) return null;

  return (
    <button 
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="fixed top-6 right-6 z-50 flex items-center justify-center h-12 w-12 rounded-full text-gold hover:bg-black/5 dark:hover:bg-white/5 transition-colors group bg-white/50 dark:bg-black/40 backdrop-blur-md border border-border dark:border-white/10 shadow-sm"
      title="Toggle Theme"
    >
      <Sparkles className="h-6 w-6 transition-transform group-hover:scale-110" />
    </button>
  );
}

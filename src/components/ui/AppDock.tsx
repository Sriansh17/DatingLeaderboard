'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Plus, Heart, User, Sparkles, X, Mail } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAtmosphere, type Atmosphere } from '@/components/providers/AtmosphereProvider';

const tabs = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/leaderboards", label: "Ranks", icon: Trophy },
  { href: "/partners", label: "Partners", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
] as const;

const BubblesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="18" r="3" />
    <circle cx="16" cy="12" r="4" />
    <circle cx="9" cy="6" r="2" />
  </svg>
);

// ─── Atmosphere Panel content (shared between popover and bottom sheet) ───────

function AtmospherePanel({
  atmosphere,
  setAtmosphere,
  particlesEnabled,
  setParticlesEnabled,
  onClose,
}: {
  atmosphere: Atmosphere;
  setAtmosphere: (a: Atmosphere) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (v: boolean) => void;
  onClose?: () => void;
}) {
  const getAtmColor = (a: string) => {
    switch (a) {
      case 'soft-blush': return 'bg-primary/50 dark:bg-primary/30';
      case 'mesh-rose': return 'bg-gradient-to-br from-primary/70 via-primary/30 to-gold/50 dark:from-primary/50 dark:via-primary/20 dark:to-gold/30';
      case 'vignette-rose': return 'bg-[radial-gradient(circle_at_center,rgba(209,47,88,0.7)_0%,transparent_100%)]';
      case 'prismatic-rose': return 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(209,47,88,0.7),rgba(199,169,107,0.7),rgba(209,47,88,0.7))]';
      case 'aura': return 'bg-[radial-gradient(circle_at_top_left,rgba(232,69,107,0.8)_0%,transparent_70%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.6)_0%,transparent_70%)] bg-[#120E15]';
      case 'minimal': return 'bg-transparent border border-black/20 dark:border-white/20';
    }
  };

  const ATM_OPTIONS = ['soft-blush', 'mesh-rose', 'vignette-rose', 'prismatic-rose', 'aura', 'minimal'] as const;
  const ATM_NAMES: Record<string, string> = {
    'soft-blush': 'Soft Blush',
    'mesh-rose': 'Mesh Rose',
    'vignette-rose': 'Vignette',
    'prismatic-rose': 'Prismatic',
    'aura': 'Aura',
    'minimal': 'Minimal',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold tracking-[0.15em] text-foreground uppercase">
          Atmosphere
        </span>
        <span className="text-[10px] text-muted-foreground">
          {ATM_NAMES[atmosphere] || atmosphere}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-5">
        {ATM_OPTIONS.map((atm) => {
          const isActive = atmosphere === atm;
          return (
            <button
              key={atm}
              onClick={() => { setAtmosphere(atm); onClose?.(); }}
              className={`relative aspect-square rounded-full transition-all duration-300 ${getAtmColor(atm)} shadow-lg flex items-center justify-center hover:scale-105`}
              title={ATM_NAMES[atm]}
            >
              {isActive && (
                <>
                  <div className="absolute inset-[-3px] rounded-full border-[2px] border-black/80 dark:border-white shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-black/80 dark:bg-white" />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Particles toggle */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <BubblesIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-foreground">Magic particles</span>
        </div>
        <button
          onClick={() => setParticlesEnabled(!particlesEnabled)}
          className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
            particlesEnabled ? 'bg-gold' : 'bg-muted-foreground/30'
          }`}
        >
          <motion.div
            animate={{ x: particlesEnabled ? 16 : 2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>

      <div className="pt-3 border-t border-border">
        <Link
          href="/contact"
          onClick={onClose}
          className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1.5 transition-colors"
        >
          <Mail className="h-3 w-3" /> Meet the Creators
        </Link>
      </div>
    </div>
  );
}

export function AppDock() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { atmosphere, setAtmosphere, particlesEnabled, setParticlesEnabled } = useAtmosphere();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    setIsMounted(true);
    return () => clearTimeout(timer);
  }, []);

  // Close sheet on route change
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  const renderTab = ({ href, label, icon: Icon }: typeof tabs[number]) => {
    const isActive = pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={`outline-none group relative flex flex-col items-center justify-center transition-all duration-300 rounded-full ${isActive ? "text-primary w-14 sm:w-16 h-12 sm:h-14" : "text-muted-foreground hover:text-primary w-12 sm:w-14 h-12 sm:h-14"}`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-dock-active-pill"
            className="absolute inset-0 rounded-full bg-white/40 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Icon className={`relative z-10 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${isActive ? 'scale-100 -translate-y-1.5 sm:-translate-y-2' : 'group-hover:scale-110 group-hover:-translate-y-1'}`} />
        <span className={`absolute bottom-1.5 sm:bottom-2 z-10 text-[8px] sm:text-[9px] font-bold tracking-wide opacity-0 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'group-hover:opacity-100 group-hover:translate-y-0 translate-y-2'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSheetOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed bottom-0 inset-x-0 z-50 md:hidden rounded-t-3xl border-t border-border bg-popover px-6 pt-5 pb-10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.2)]"
            >
              {/* Drag handle */}
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/30" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display italic text-xl text-foreground">Customise</h2>
                <div className="flex items-center gap-3">
                  {/* Theme toggle inside sheet */}
                  <button
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-elevated"
                  >
                    {resolvedTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AtmospherePanel
                atmosphere={atmosphere}
                setAtmosphere={setAtmosphere}
                particlesEnabled={particlesEnabled}
                setParticlesEnabled={setParticlesEnabled}
                onClose={() => setSheetOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Dock ── */}
      <div className={`fixed bottom-6 sm:bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} w-max max-w-[95vw]`}>
        <nav className="flex items-center gap-1 sm:gap-2 rounded-full border border-border dark:border-white/10 bg-white/80 dark:bg-black/40 px-2.5 sm:px-4 py-2 sm:py-3 backdrop-blur-2xl shadow-[0_8px_30px_-8px_rgba(232,69,107,0.15),0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] max-w-[95vw] sm:max-w-none mx-auto">

          {/* Brand Icon — mobile: tap opens sheet | desktop: hover opens popover */}
          {isMounted ? (
            <div className="relative group/sparkle mr-1 sm:mr-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // On mobile: open sheet. On desktop: also toggle theme (hover handles popover).
                  if (window.innerWidth < 768) {
                    setSheetOpen(true);
                  } else {
                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                  }
                }}
                className="relative z-[60] flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full text-gold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Customise atmosphere"
                aria-label="Open atmosphere settings"
              >
                <Sparkles className="h-6 w-6 transition-transform group-hover/sparkle:scale-110" />
              </button>

              {/* Desktop hover popover — hidden on mobile */}
              <div className="hidden md:block absolute bottom-[calc(100%+24px)] left-0 opacity-0 scale-95 pointer-events-none group-hover/sparkle:opacity-100 group-hover/sparkle:scale-100 group-hover/sparkle:pointer-events-auto transition-all duration-300 origin-bottom-left z-50">
                <div className="absolute inset-0 -bottom-14" />
                <div className="bg-popover border border-border rounded-2xl p-5 shadow-2xl relative z-10 w-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-elevated"
                    >
                      {resolvedTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                    </button>
                  </div>
                  <AtmospherePanel
                    atmosphere={atmosphere}
                    setAtmosphere={setAtmosphere}
                    particlesEnabled={particlesEnabled}
                    setParticlesEnabled={setParticlesEnabled}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full text-gold mr-1 sm:mr-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}

          {tabs.slice(0, 2).map(renderTab)}

          {/* FAB */}
          <div className="px-1 sm:px-2">
            <Link
              href="/posts/new"
              className="outline-none group relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-110 focus-visible:scale-110 animate-pulse-glow"
              aria-label="New post"
            >
              <Plus className="h-5 w-5 sm:h-7 sm:w-7 transition-transform group-hover:rotate-90 duration-300" />
            </Link>
          </div>

          {tabs.slice(2).map(renderTab)}
        </nav>
      </div>
    </>
  );
}


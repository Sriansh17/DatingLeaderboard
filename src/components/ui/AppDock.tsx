'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, Plus, Heart, User, Sparkles, X, Mail, Settings } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAtmosphere, type Atmosphere } from '@/components/providers/AtmosphereProvider';
import { useAnonymousMode } from '@/components/providers/AnonymousModeProvider';

// ─── Bond Icon: two interlocking circles ──
const BondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
    <circle cx="8.5" cy="12" r="4.5" />
    <circle cx="15.5" cy="12" r="4.5" />
  </svg>
);

const fullTabs = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/leaderboards", label: "Ranks", icon: Trophy },
  { href: "/circles", label: "Bond", icon: BondIcon },
  { href: "/partners", label: "Partners", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
] as const;

const anonymousTabs = [
  { href: "/dashboard", label: "Feed", icon: Home },
] as const;

const BubblesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="18" r="3" />
    <circle cx="16" cy="12" r="4" />
    <circle cx="9" cy="6" r="2" />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─── Atmosphere Panel ──────────────────────────────────────────────────────────────

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
  const { resolvedTheme, setTheme } = useTheme();

  const getAtmColor = (a: string) => {
    switch (a) {
      case 'soft-blush': return 'bg-primary/50 dark:bg-primary/30';
      case 'mesh-rose': return 'bg-gradient-to-br from-primary/70 via-primary/30 to-gold/50 dark:from-primary/50 dark:via-primary/20 dark:to-gold/30';
      case 'vignette-rose': return 'bg-[radial-gradient(circle_at_center,rgba(209,47,88,0.7)_0%,transparent_100%)]';
      case 'prismatic-rose': return 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(209,47,88,0.7),rgba(199,169,107,0.7),rgba(209,47,88,0.7))]';
      case 'aura': return 'bg-[radial-gradient(circle_at_top_left,rgba(232,69,107,0.8)_0%,transparent_70%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.6)_0%,transparent_70%)] bg-[#120E15]';
      case 'minimal': return 'bg-transparent border border-black/20 dark:border-border';
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
        <span className="text-[10px] font-bold tracking-[0.15em] text-foreground uppercase">
          Atmosphere <span className="text-muted-foreground font-normal">·</span>{' '}
          <span className="text-muted-foreground font-normal normal-case tracking-normal">{ATM_NAMES[atmosphere] || atmosphere}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setParticlesEnabled(!particlesEnabled)}
            className={`p-2 rounded-full border transition-colors ${particlesEnabled ? 'text-gold border-gold/30 bg-gold/10' : 'text-muted-foreground border-border bg-card hover:text-foreground active:text-foreground'}`}
            title={particlesEnabled ? 'Disable particles' : 'Enable particles'}
          >
            <BubblesIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground active:text-foreground transition-colors"
            title={resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {resolvedTheme === 'dark'
              ? <SunIcon className="h-3.5 w-3.5" />
              : <MoonIcon className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-5">
        {ATM_OPTIONS.map((atm) => {
          const isActive = atmosphere === atm;
          return (
            <button
              key={atm}
              onClick={() => { setAtmosphere(atm); onClose?.(); }}
              className={`relative aspect-square rounded-full transition-all duration-300 ${getAtmColor(atm)} shadow-lg flex items-center justify-center hover:scale-105 active:scale-95`}
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

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Links</span>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            onClick={onClose}
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground active:text-foreground uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <Settings className="h-3 w-3" /> Settings
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground active:text-foreground uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <Mail className="h-3 w-3" /> Creators
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── AppDock ────────────────────────────────────────────────────────────────────────

export function AppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { atmosphere, setAtmosphere, particlesEnabled, setParticlesEnabled } = useAtmosphere();
  const { isAnonymousMode, toggleAnonymousMode } = useAnonymousMode();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    setIsMounted(true);
    return () => clearTimeout(timer);
  }, []);

  // Close sheet on route change
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  // Redirect when anonymous mode toggles
  const prevModeRef = useRef(isAnonymousMode);
  useEffect(() => {
    const prev = prevModeRef.current;
    if (prev !== isAnonymousMode) {
      if (!isAnonymousMode && pathname.startsWith('/confessions')) router.push('/dashboard');
      if (isAnonymousMode && pathname === '/posts/new') router.push('/confessions/new');
      prevModeRef.current = isAnonymousMode;
    }
  }, [isAnonymousMode, pathname, router]);

  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  const tabs = isAnonymousMode ? anonymousTabs : fullTabs;

  const renderTab = ({ href, label, icon: Icon }: typeof tabs[number]) => {
    const isActive = pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={`outline-none group relative flex flex-col items-center justify-center transition-all duration-300 rounded-full ${isActive ? "text-primary w-12 sm:w-14 lg:w-16 h-10 sm:h-12 lg:h-14" : "text-muted-foreground hover:text-primary active:text-primary/80 w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14"}`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-dock-active-pill"
            className="absolute inset-0 rounded-full bg-white/40 dark:bg-white/10 border border-black/5 dark:border-border shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Icon className={`relative z-10 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-transform duration-300 ${isActive ? 'scale-100 -translate-y-1.5 sm:-translate-y-2' : 'group-hover:scale-110 group-hover:-translate-y-1 group-focus-within:scale-110 group-focus-within:-translate-y-1'}`} />
        <span className={`absolute bottom-1 sm:bottom-1.5 lg:bottom-2 z-10 text-[8px] sm:text-[10px] lg:text-[11px] font-bold tracking-wide opacity-0 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 translate-y-2'}`}>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed bottom-0 inset-x-0 z-[60] md:hidden rounded-t-3xl border-t border-border bg-popover px-6 pt-5 pb-10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.2)]"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center justify-end mb-6">
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-2.5 rounded-full text-muted-foreground hover:text-foreground active:text-foreground transition-colors touch-target"
                >
                  <X className="h-4 w-4" />
                </button>
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
      <div className={`fixed bottom-6 sm:bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} w-max max-w-[95vw] pb-safe`}>
        <nav className="flex items-center gap-1 sm:gap-2 rounded-full border border-border dark:border-border bg-white/80 dark:bg-black/40 px-2.5 sm:px-4 py-2 sm:py-3 backdrop-blur-2xl shadow-[0_8px_30px_-8px_rgba(232,69,107,0.15),0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] max-w-[95vw] sm:max-w-none mx-auto overflow-x-auto hide-scrollbar">

          {/* Brand Icon — tap toggles theme | hover opens atmosphere popover */}
          {isMounted ? (
            <div className="relative group/sparkle mr-1 sm:mr-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const isMobile = window.innerWidth < 768;
                  if (isMobile) {
                    setSheetOpen(true);
                  } else {
                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                  }
                }}
                className="relative z-[60] flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full text-gold hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer"
                title="Toggle theme"
                aria-label="Toggle light/dark mode"
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover/sparkle:scale-110" />
              </button>

              {/* Desktop hover popover — hidden on mobile */}
              <div className="hidden md:block absolute bottom-[calc(100%+24px)] left-0 opacity-0 scale-95 pointer-events-none group-hover/sparkle:opacity-100 group-hover/sparkle:scale-100 group-hover/sparkle:pointer-events-auto transition-all duration-300 origin-bottom-left z-50">
                <div className="absolute inset-0 -bottom-14" />
                <div className="bg-popover border border-border rounded-2xl p-5 shadow-2xl relative z-10 w-[300px]">
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
            <div className="flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full text-gold mr-1 sm:mr-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}

          {/* Show only Feed in anonymous mode, otherwise show Feed + Ranks */}
          {isAnonymousMode
            ? tabs.slice(0, 1).map(renderTab)
            : tabs.slice(0, 2).map(renderTab)
          }

          {/* FAB */}
          <div className="px-1 sm:px-2">
            <Link
              href={isAnonymousMode ? "/confessions/new" : "/posts/new"}
              className="outline-none group relative flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus-visible:scale-110 active:scale-100 animate-pulse-glow"
              aria-label={isAnonymousMode ? "New confession" : "New post"}
              style={{
                background: 'linear-gradient(180deg, rgb(var(--primary)), color-mix(in oklab, rgb(var(--primary)) 85%, black))',
                boxShadow: '0 6px 20px -6px rgba(var(--primary), 0.5), 0 2px 6px -1px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-white transition-transform duration-300 group-hover:rotate-90 group-focus-within:rotate-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
            </Link>
          </div>

          {/* Remaining tabs (in anonymous mode, only Feed was rendered above) */}
          {!isAnonymousMode && tabs.slice(2).map(renderTab)}
        </nav>
      </div>
    </>
  );
}

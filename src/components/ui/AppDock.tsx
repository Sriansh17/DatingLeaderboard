'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Plus, Heart, User, Sparkles, X, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

export function AppDock() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { atmosphere, setAtmosphere, particlesEnabled, setParticlesEnabled } = useAtmosphere();

  useEffect(() => {
    // Small delay to allow the layout's fade-in to happen before dock pops up
    const timer = setTimeout(() => setIsVisible(true), 100);
    setIsMounted(true);
    return () => clearTimeout(timer);
  }, []);

  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 sm:bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} w-max max-w-[95vw]`}>
      <nav className="flex items-center gap-1 sm:gap-2 rounded-full border border-border dark:border-white/10 bg-white/80 dark:bg-black/40 px-2.5 sm:px-4 py-2 sm:py-3 backdrop-blur-2xl shadow-[0_8px_30px_-8px_rgba(232,69,107,0.15),0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] max-w-[95vw] sm:max-w-none mx-auto">
        
        {/* Brand Icon / Theme Toggle */}
        {isMounted ? (
          <div className="relative group/sparkle mr-1 sm:mr-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
              className="relative z-[60] flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full text-gold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              <Sparkles className="h-6 w-6 transition-transform group-hover/sparkle:scale-110" />
            </button>
            
            {/* Atmosphere Popover (Robust Hover) */}
            <div className="absolute bottom-[calc(100%+24px)] sm:bottom-[calc(100%+28px)] left-0 opacity-0 scale-95 pointer-events-none group-hover/sparkle:opacity-100 group-hover/sparkle:scale-100 group-hover/sparkle:pointer-events-auto transition-all duration-300 origin-bottom-left z-50">
              {/* Invisible bridge to prevent mouse leave */}
              <div className="absolute inset-0 -bottom-14" />
              
              <div className="bg-popover border border-border rounded-2xl p-4 sm:p-5 shadow-2xl relative z-10 w-[260px] sm:w-[340px] max-w-[90vw]">
                
                <div className="flex items-center justify-between mb-3 sm:mb-4 pr-8">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center">
                    Atmosphere <span className="text-foreground/30 mx-2">•</span> <span className="text-foreground">{atmosphere.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                  </span>
                  
                  {/* The Bubbles Toggle */}
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setParticlesEnabled(!particlesEnabled); }}
                    className={`flex items-center justify-center h-6 w-6 rounded-full transition-colors border ${particlesEnabled ? 'bg-gold/20 border-gold/30 text-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' : 'bg-black/5 dark:bg-white/5 border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    <BubblesIcon className="h-3 w-3" />
                  </button>
                </div>
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* close handled by group-hover */ }}
                  className="absolute -top-2.5 -right-2.5 h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors shadow-lg z-20"
                >
                  <X className="h-3 w-3 text-foreground" />
                </button>

                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {(['soft-blush', 'mesh-rose', 'vignette-rose', 'prismatic-rose', 'aura', 'minimal'] as const).map((atm) => {
                    const getAtmColor = (a: string) => {
                      switch(a) {
                        case 'soft-blush': return 'bg-primary/50 dark:bg-primary/30';
                        case 'mesh-rose': return 'bg-gradient-to-br from-primary/70 via-primary/30 to-gold/50 dark:from-primary/50 dark:via-primary/20 dark:to-gold/30';
                        case 'vignette-rose': return 'bg-[radial-gradient(circle_at_center,rgba(209,47,88,0.7)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(230,76,117,0.5)_0%,transparent_100%)]';
                        case 'prismatic-rose': return 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(209,47,88,0.7),rgba(199,169,107,0.7),rgba(209,47,88,0.7))]';
                        case 'aura': return 'bg-[radial-gradient(circle_at_top_left,rgba(232,69,107,0.8)_0%,transparent_70%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.6)_0%,transparent_70%),radial-gradient(circle_at_bottom_left,rgba(232,69,107,0.8)_0%,transparent_70%)] bg-[#120E15]';
                        case 'minimal': return 'bg-transparent border border-black/20 dark:border-white/20';
                      }
                    };
                    const isActive = atmosphere === atm;
                    return (
                      <button
                        key={atm}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAtmosphere(atm);
                        }}
                        className={`relative w-full aspect-square rounded-full transition-all duration-300 ${getAtmColor(atm)} shadow-lg flex items-center justify-center hover:scale-105 sm:w-10 sm:h-10`}
                        title={atm}
                      >
                         {isActive && (
                           <>
                             <div className="absolute inset-[-3px] sm:inset-[-4px] rounded-full border-[2px] sm:border-[3px] border-black/80 dark:border-white shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                             <div className="h-1.5 w-1.5 rounded-full bg-black/80 dark:bg-white" />
                           </>
                         )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">More</span>
                  <Link href="/contact" className="text-[9px] sm:text-[10px] font-bold text-foreground hover:text-primary uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Meet the Creators
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full text-gold mr-1 sm:mr-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}

        {tabs.slice(0, 2).map(({ href, label, icon: Icon }) => {
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
        })}

        {/* Floating Action Button for New Post */}
        <div className="px-1 sm:px-2">
          <Link
            href="/posts/new"
            className="outline-none group relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-110 focus-visible:scale-110 animate-pulse-glow"
            aria-label="New post"
          >
            <Plus className="h-5 w-5 sm:h-7 sm:w-7 transition-transform group-hover:rotate-90 duration-300" />
          </Link>
        </div>

        {tabs.slice(2).map(({ href, label, icon: Icon }) => {
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
        })}
      </nav>
    </div>
  );
}

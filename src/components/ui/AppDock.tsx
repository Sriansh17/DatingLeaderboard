'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Plus, Heart, User, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAtmosphere, type Atmosphere } from '@/components/providers/AtmosphereProvider';

const tabs = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/leaderboards", label: "Ranks", icon: Trophy },
  { href: "/partners", label: "Partners", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function AppDock() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { atmosphere, setAtmosphere } = useAtmosphere();

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
    <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <nav className="flex items-center gap-2 rounded-full border border-border dark:border-white/10 bg-white/80 dark:bg-black/40 px-4 py-3 backdrop-blur-2xl shadow-[0_8px_30px_-8px_rgba(232,69,107,0.15),0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
        
        {/* Brand Icon / Theme Toggle */}
        {isMounted ? (
          <div className="relative group/sparkle mr-1 sm:mr-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
              className="relative z-[60] flex items-center justify-center h-12 w-12 rounded-full text-gold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              <Sparkles className="h-6 w-6 transition-transform group-hover/sparkle:scale-110" />
            </button>
            
            {/* Atmosphere Popover (Robust Hover) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-4 opacity-0 scale-95 pointer-events-none group-hover/sparkle:opacity-100 group-hover/sparkle:scale-100 group-hover/sparkle:pointer-events-auto transition-all duration-300 origin-bottom z-50">
              {/* Invisible bridge to prevent mouse leave */}
              <div className="absolute inset-0 -bottom-8" />
              
              <div className="bg-[#121016] border border-white/5 rounded-2xl p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] relative z-10 w-max">
                
                <div className="flex items-center justify-between mb-4 pr-2">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-white/50 uppercase">Atmosphere</span>
                </div>
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* close handled by group-hover */ }}
                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-[#2A2B36] border border-white/5 flex items-center justify-center hover:bg-[#3A3B46] transition-colors shadow-lg z-20"
                >
                  <X className="h-3.5 w-3.5 text-white/70" />
                </button>

                <div className="flex items-center gap-3">
                  {(['sunset', 'blush', 'crimson', 'champagne', 'amethyst'] as const).map((atm) => {
                    const getAtmColor = (a: string) => {
                      switch(a) {
                        case 'sunset': return 'bg-gradient-to-br from-pink-500 to-orange-400';
                        case 'blush': return 'bg-gradient-to-br from-pink-400 to-pink-300';
                        case 'crimson': return 'bg-gradient-to-br from-red-600 to-red-500';
                        case 'champagne': return 'bg-gradient-to-br from-white via-rose-100 to-orange-100';
                        case 'amethyst': return 'bg-gradient-to-br from-[#c084fc] to-[#e879f9]';
                      }
                    };
                    const isActive = atmosphere === atm;
                    return (
                      <button
                        key={atm}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAtmosphere(atm as any);
                        }}
                        className={`relative w-10 h-10 rounded-full transition-all duration-300 ${getAtmColor(atm)} shadow-lg flex items-center justify-center hover:scale-105`}
                        title={atm}
                      >
                         {isActive && (
                           <>
                             <div className="absolute inset-[-4px] rounded-full border-[3px] border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                             <div className="h-1.5 w-1.5 rounded-full bg-white" />
                           </>
                         )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-12 w-12 rounded-full text-gold mr-1 sm:mr-2">
            <Sparkles className="h-6 w-6" />
          </div>
        )}

        {tabs.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`outline-none group relative flex h-12 w-12 sm:w-16 flex-col items-center justify-center rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 focus-visible:bg-black/10 dark:focus-visible:bg-white/10 ${isActive ? "text-[#f4cdda] bg-black/5 dark:bg-white/10" : "text-[#a898a3] hover:text-[#f4cdda]"}`}
            >
              <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-1'}`} />
              <span className={`absolute -bottom-1 text-[9px] font-medium opacity-0 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'group-hover:opacity-100 group-hover:translate-y-0 translate-y-2'}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Floating Action Button for New Post */}
        <div className="px-2">
          <Link
            href="/posts/new"
            className="outline-none group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#f4cdda] to-[#f4b5cb] text-[#1a1a1a] shadow-[0_0_30px_-5px_rgba(244,205,218,0.6)] transition-transform hover:scale-110 focus-visible:scale-110 animate-pulse-glow"
            aria-label="New post"
          >
            <Plus className="h-7 w-7 transition-transform group-hover:rotate-90 duration-300" />
          </Link>
        </div>

        {tabs.slice(2).map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`outline-none group relative flex h-12 w-12 sm:w-16 flex-col items-center justify-center rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 focus-visible:bg-black/10 dark:focus-visible:bg-white/10 ${isActive ? "text-[#f4cdda] bg-black/5 dark:bg-white/10" : "text-[#a898a3] hover:text-[#f4cdda]"}`}
            >
              <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-1'}`} />
              <span className={`absolute -bottom-1 text-[9px] font-medium opacity-0 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'group-hover:opacity-100 group-hover:translate-y-0 translate-y-2'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

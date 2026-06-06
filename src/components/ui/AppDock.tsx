'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Plus, Heart, User, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/leaderboards", label: "Ranks", icon: Trophy },
  { href: "/partners/new", label: "Partners", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function AppDock() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow the layout's fade-in to happen before dock pops up
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
        
        {/* Brand Icon (Desktop only) */}
        <Link 
          href="/dashboard" 
          className="hidden md:flex items-center justify-center h-12 w-12 rounded-full text-gold hover:bg-white/5 transition-colors group mr-2"
        >
          <Sparkles className="h-6 w-6 transition-transform group-hover:scale-110" />
        </Link>

        {tabs.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href) && href !== '/';
          return (
            <Link
              key={href}
              href={href}
              className={`outline-none group relative flex h-12 w-12 sm:w-16 flex-col items-center justify-center rounded-full transition-all duration-300 hover:bg-white/5 focus-visible:bg-white/10 ${isActive ? "text-blush" : "text-muted-foreground hover:text-foreground"}`}
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
            className="outline-none group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_-5px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:scale-110 focus-visible:scale-110 animate-pulse-glow"
            aria-label="New post"
          >
            <Plus className="h-7 w-7 transition-transform group-hover:rotate-90 duration-300" />
          </Link>
        </div>

        {tabs.slice(2).map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href) && href !== '/';
          return (
            <Link
              key={href}
              href={href}
              className={`outline-none group relative flex h-12 w-12 sm:w-16 flex-col items-center justify-center rounded-full transition-all duration-300 hover:bg-white/5 focus-visible:bg-white/10 ${isActive ? "text-blush" : "text-muted-foreground hover:text-foreground"}`}
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

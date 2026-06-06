'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  Heart,
  Trophy,
  PlusCircle,
  Users,
  User,
  Settings,
  Mail,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Explore', icon: Compass },
  { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
  { href: '/posts/new', label: 'New Post', icon: PlusCircle },
  { href: '/partners', label: 'Partners', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    setIsMounted(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', String(nextState));
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 self-start bg-gradient-to-b from-background via-primary/5 to-background border-r border-primary/15 dark:border-primary/15 transition-all duration-300 ease-in-out relative group/sidebar',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Decorative art blob */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-pink-300/20 to-rose-400/10 dark:from-primary/10 dark:to-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-300/20 to-pink-300/10 dark:from-purple-500/10 dark:to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Collapse Toggle Button */}
      {isMounted && (
        <button
          onClick={toggleCollapse}
          className={cn(
            'absolute top-12 -right-3 z-50 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-primary shadow-md hover:scale-115 transition-all cursor-pointer',
            'opacity-0 group-hover/sidebar:opacity-100 focus:opacity-100'
          )}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}

      {/* Logo — artistic centerpiece */}
      <div className={cn('relative pt-10 pb-8 transition-all duration-300', isCollapsed ? 'px-5' : 'px-6')}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/30 blur-xl rounded-full" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-accent flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Heart className="h-5 w-5 text-white fill-white/90" />
            </div>
          </div>
          <div
            className={cn(
              'transition-all duration-300 overflow-hidden whitespace-nowrap',
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            )}
          >
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-rose-500 to-purple-500 bg-clip-text text-transparent">
              LoveBoard
            </h1>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">
              Share the love
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn('relative flex-1 space-y-0.5 transition-all duration-300', isCollapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-2xl text-sm font-medium transition-all duration-300 relative group',
                isActive
                  ? 'text-primary dark:text-primary'
                  : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300',
                isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'
              )}
            >
              {/* Active background with glassmorphism */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-100/80 to-rose-100/50 dark:from-primary/15 dark:to-accent/10 border border-primary/30/50 dark:border-pink-400/20 shadow-sm backdrop-blur-sm" />
              )}

              {/* Hover glow */}
              {!isActive && (
                <span className="absolute inset-0 rounded-2xl bg-gray-100/50 dark:bg-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              )}

              {/* Active indicator dot */}
              {isActive && !isCollapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-primary to-accent shadow-sm shadow-pink-500/30" />
              )}

              <Icon
                className={cn(
                  'relative h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span
                className={cn(
                  'relative transition-all duration-300 overflow-hidden whitespace-nowrap',
                  isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn('relative py-6 transition-all duration-300 flex justify-center', isCollapsed ? 'px-2' : 'px-6')}>
        <div className={cn('border-t border-primary/15 dark:border-primary/15 pt-4 w-full text-center', isCollapsed ? 'border-t-0 pt-0' : '')}>
          {isCollapsed ? (
            <span className="animate-pulse text-lg">❤️</span>
          ) : (
            <p className="text-[11px] text-muted-foreground tracking-wide whitespace-nowrap overflow-hidden">
              Made with
              <span className="inline-block mx-1 animate-pulse">❤️</span>
              for lovers
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

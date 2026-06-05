'use client';

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

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-gradient-to-b from-white via-pink-50/30 to-white dark:from-gray-950 dark:via-pink-950/10 dark:to-gray-950 border-r border-pink-100/50 dark:border-pink-900/20">
      {/* Decorative art blob */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-pink-300/20 to-rose-400/10 dark:from-pink-500/10 dark:to-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-300/20 to-pink-300/10 dark:from-purple-500/10 dark:to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo — artistic centerpiece */}
      <div className="relative px-6 pt-10 pb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-pink-500/20 dark:bg-pink-500/30 blur-xl rounded-full" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Heart className="h-5 w-5 text-white fill-white/90" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
              LoveBoard
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 tracking-wide uppercase">
              Share the love
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 relative group',
                isActive
                  ? 'text-pink-600 dark:text-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {/* Active background with glassmorphism */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-100/80 to-rose-100/50 dark:from-pink-500/15 dark:to-rose-500/10 border border-pink-200/50 dark:border-pink-400/20 shadow-sm backdrop-blur-sm" />
              )}

              {/* Hover glow */}
              {!isActive && (
                <span className="absolute inset-0 rounded-2xl bg-gray-100/50 dark:bg-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              )}

              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-pink-500 to-rose-500 shadow-sm shadow-pink-500/30" />
              )}

              <Icon
                className={cn(
                  'relative h-5 w-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="relative px-6 py-6">
        <div className="border-t border-pink-100/50 dark:border-pink-900/20 pt-4">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center tracking-wide">
            Made with
            <span className="inline-block mx-1 animate-pulse">❤️</span>
            for lovers
          </p>
        </div>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Heart, Trophy, PlusCircle, Users, User, Settings, LayoutDashboard, Mail } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
      {/* Logo area */}
      <div className="flex items-center gap-2 px-3 py-2 mb-6">
        <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
        <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          LoveBoard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-400 text-center">
          Made with ❤️
        </p>
      </div>
    </aside>
  );
}

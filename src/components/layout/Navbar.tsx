'use client';

import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Heart, Menu, X, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function Navbar() {
  const { user, profile, signOut } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LoveBoard
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary dark:hover:text-pink-400 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/leaderboards"
                  className="text-sm text-muted-foreground hover:text-primary dark:hover:text-pink-400 transition-colors"
                >
                  Leaderboards
                </Link>
                <Link
                  href="/posts/new"
                  className="text-sm text-muted-foreground hover:text-primary dark:hover:text-pink-400 transition-colors"
                >
                  New Post
                </Link>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary dark:hover:text-pink-400 transition-colors"
                >
                  <Mail className="h-4 w-4 inline mr-1" />
                  Contact
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                  <Link href="/profile" className="flex items-center gap-2">
                    <Avatar src={profile?.avatar_url} alt={profile?.username || user.email || ''} size="sm" />
                    <span className="text-sm text-foreground/90">
                      {profile?.username || user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-4 py-3 space-y-2 border-t border-border">
          {user ? (
            <>
              <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/leaderboards" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Leaderboards</Link>
              <Link href="/posts/new" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>New Post</Link>
              <Link href="/partners" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Partners</Link>
              <Link href="/contact" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Contact</Link>
              <Link href="/profile" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/auth/signup" className="block px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/15" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

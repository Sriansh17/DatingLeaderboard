'use client';

import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Settings, LogOut, Crown, Sparkles, ArrowLeft, User, Sun, Moon, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { profile, user, signOut } = useUser();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="max-w-lg mx-auto px-4 py-8 relative">
      {/* Fond rose glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/[0.05] blur-3xl pointer-events-none" />

      {/* Back button */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/40 px-5 py-2.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 active:bg-elevated transition-colors mb-6 touch-target"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Profile
      </Link>

      {/* Fond header pattern */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2 flex items-center gap-2">
          <Settings className="h-3.5 w-3.5" /> Configuration
        </p>
        <h1 className="font-display text-5xl italic text-foreground tracking-tight leading-none">
          Settings
        </h1>
      </header>

      <div className="space-y-5">

        {/* Profile Summary */}
        <div className="glass-2 rounded-3xl p-5 flex items-center gap-4">
          <Avatar src={profile?.avatar_url} alt={profile?.username || ''} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg italic text-foreground truncate">
              {profile?.username || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
            </p>
          </div>
          {profile?.is_premium && (
            <Badge variant="info" className="shrink-0">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
        </div>

        {/* Account */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg italic text-foreground">Account</h2>
          </div>
          <div className="space-y-2">
            <Link href="/premium">
              <Button
                variant={profile?.is_premium ? 'outline' : 'primary'}
                className="w-full justify-start"
              >
                {profile?.is_premium ? (
                  <><Crown className="h-4 w-4 text-gold" /> Manage Premium</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Unlock Premium</>
                )}
              </Button>
            </Link>
            <Button variant="danger" className="w-full justify-start" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg italic text-foreground">Appearance</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium border transition-all touch-target ${
                resolvedTheme === 'light'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium border transition-all touch-target ${
                resolvedTheme === 'dark'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>

        {/* About */}
        <div className="glass-2 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-gold" />
            <h2 className="font-display text-lg italic text-foreground">About Fond</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The world&apos;s first relationship leaderboard. Post one story. AI judges it. Couples compete in your city — and on the planet.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">Version 1.0.0 · Made with ❤️</p>
        </div>

      </div>
    </div>
  );
}

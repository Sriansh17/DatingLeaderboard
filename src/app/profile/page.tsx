'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { StoryCard } from '@/components/ui/StoryCard';
import { Modal } from '@/components/ui/Modal';
import { usePosts, useArchivedPosts } from '@/lib/hooks/usePosts';
import { calculateStreak } from '@/lib/utils/streak';
import { formatRelativeTime } from '@/lib/utils/format';
import { tierForScore } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Post } from '@/types/database';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Tooltip } from '@/components/ui/Tooltip';
import { PageBell } from '@/components/ui/PageBell';
import { Heart, PlusCircle, Trophy, Flame, LogOut, Settings, Archive, ArchiveRestore, Share2, Sparkles as SparklesIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AvatarSelectionModal } from '@/components/profile/AvatarSelectionModal';
import { EditPostModal } from '@/components/posts/EditPostModal';
import { useShare } from '@/components/providers/ShareProvider';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Spinner } from '@/components/ui/Spinner';
import { useStreak } from '@/lib/hooks/useStreak';
import { BADGES } from '@/lib/utils/constants';

export default function ProfilePage() {
  const RESTORE_STREAK_AMOUNT = 49;
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = usePosts(user?.id);
  const { data: archivedPosts, isLoading: archivedLoading, refetch: refetchArchived } = useArchivedPosts(user?.id);
  const [partners, setPartners] = useState<{id: string, name: string, emoji: string}[]>([]);
  const [bondCount, setBondCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [bondEmojis, setBondEmojis] = useState<string[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);
  const { data: streakBadges } = useStreak();

  const handleUnarchive = useCallback(async (postId: string) => {
    try {
      setUnarchivingId(postId);
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: false }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to unarchive');
      await refetchArchived();
      addToast('Post restored to your profile.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to unarchive post.', 'error');
    } finally {
      setUnarchivingId(null);
    }
  }, [refetchArchived]);
  const { openShare } = useShare();
  const { addToast } = useToast();

  // Build override from profile DB columns so restoration survives page refresh
  const streakOverride = useMemo(() => {
    if (!profile?.streak_override_count || !profile?.streak_override_date) return null;
    return { count: profile.streak_override_count, date: profile.streak_override_date };
  }, [profile?.streak_override_count, profile?.streak_override_date]);

  const streak = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return calculateStreak(posts.map((p) => p.created_at), streakOverride);
  }, [posts, streakOverride]);

  // How long the most-recent consecutive chain of past posts was
  const restorableStreakLength = useMemo(() => {
    if (!posts || posts.length === 0) return 0;
    const uniqueDays = Array.from(new Set(posts.map((p) => p.created_at.slice(0, 10))))
      .sort((a, b) => b.localeCompare(a));
    if (uniqueDays.length === 0) return 0;
    let chain = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) chain++; else break;
    }
    return chain;
  }, [posts]);

  // streak is already resolved (override applied inside calculateStreak)
  const displayStreak = streak;

  // Only block restore if an override is *currently active* (saved today or yesterday).
  // Once the window expires the user can pay to restore a new broken streak.
  const overrideIsCurrentlyActive = useMemo(() => {
    if (!profile?.streak_override_count || !profile?.streak_override_date) return false;
    const overrideDay = new Date(profile.streak_override_date);
    const today = new Date();
    const diffMs = today.getTime() - overrideDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }, [profile?.streak_override_count, profile?.streak_override_date]);

  const canRestoreStreak = !!streak && streak.currentStreak === 0 && !overrideIsCurrentlyActive && restorableStreakLength > 0;

  const [isRestoringStreak, setIsRestoringStreak] = useState(false);

  const handleConfirmRestoreStreak = async () => {
    try {
      setIsRestoringStreak(true);
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak_override_count: restorableStreakLength,
          streak_override_date: today,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to restore streak');
      await refreshProfile();
      setIsRestoreModalOpen(false);
      addToast(`Streak restored to ${restorableStreakLength} days.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to restore streak. Please try again.', 'error');
    } finally {
      setIsRestoringStreak(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('partners').select('id, name, emoji').eq('user_id', user.id)
      .then(({ data }) => setPartners(data || []));

    // Fetch bonds count + emojis
    fetch('/api/circles')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setBondCount(data.data?.length || 0);
          setBondEmojis((data.data || []).map((c: any) => c.emoji).filter(Boolean));
        }
      })
      .catch(() => {});

    // Fetch connections count
    fetch('/api/connections')
      .then(r => r.json())
      .then(data => {
        if (data.success) setConnectionCount(data.data?.length || 0);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const scores = posts.filter((p) => p.ai_score).map((p) => p.ai_score!);
      if (scores.length > 0) {
        setAvgScore(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
      }
    }
  }, [posts]);

  if (isLoggingOut) return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-background">
      <Spinner size="lg" text={["SIGNING OUT..."]} />
    </div>
  );

  if (authLoading) return (
    <div className="py-20 text-center animate-pulse">
      <div className="h-8 w-48 bg-elevated rounded-full mx-auto mb-4" />
    </div>
  );

  if (!profile) {
    // Not logged in at all
    if (!user) {
      return (
        <div className="text-center py-20 text-muted-foreground">
          <p className="mb-4 text-lg font-display italic">Sign in to view your profile.</p>
          <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-sm font-semibold">
            Sign In
          </Link>
        </div>
      );
    }
    // Logged in but profile query returned nothing (edge case)
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="mb-4">Profile not found.</p>
        <Link href="/auth/login" className="text-blush hover:underline active:underline">Log in</Link>
      </div>
    );
  }

  const scoredPosts = posts?.filter((p) => p.ai_score) || [];
  const bestScore = scoredPosts.length > 0 ? Math.max(...scoredPosts.map((p) => p.ai_score || 0)) : 0;

  return (
    <main className="w-full mx-auto min-h-dvh bg-transparent relative pb-12 px-4 sm:px-8">
      <ScrollToTop label="The Archives" />
      <header className="px-5 pb-8 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-2"
          >
            The Archives
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl italic text-foreground leading-none"
          >
            My Profile
          </motion.h1>
        </div>
        <div className="flex items-center gap-2">
          <PageBell />
          <Tooltip content="Settings">
            <Link href="/settings" className="glass-btn rounded-full p-2.5 inline-flex items-center justify-center touch-target" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Tooltip>
          <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-full glass-btn text-xs font-semibold touch-target">
            Edit
          </button>
          <Tooltip content="Sign out">
            <button onClick={async () => {
              setIsLoggingOut(true);
              await signOut();
            }} className="p-2.5 rounded-full glass-btn text-muted-foreground hover:text-destructive active:text-destructive touch-target inline-flex items-center justify-center" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      </header>

      <div className="p-5">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Left Panel: Identity */}
          <div className="md:col-span-1 rounded-3xl border border-border dark:border-border bg-card/60 p-5 sm:p-8 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-xl gap-5 relative">

            {/* Share icon — top right */}
            <button
              onClick={() => openShare('profile', {
                username: profile.username,
                avatarUrl: profile.avatar_url,
                score: avgScore,
                rank: undefined,
                city: profile.city || undefined,
                streak: displayStreak?.currentStreak || 0,
                bestScore,
                totalPosts: posts?.length || 0,
                bio: profile.bio,
                age: (profile as any)?.age,
                gender: (profile as any)?.gender,
                occupation: (profile as any)?.occupation,
                country: (profile as any)?.country,
              })}
              className="absolute top-4 right-4 p-2 rounded-full glass-btn text-muted-foreground hover:text-foreground"
              aria-label="Share profile"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-full border-4 border-elevated shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] bg-transparent flex items-center justify-center font-display text-4xl sm:text-6xl text-muted-foreground overflow-hidden">
                {profile.avatar_url ? (
                  profile.avatar_url.startsWith('http') ? (
                    <img src={profile.avatar_url} alt="Profile Avatar" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{profile.avatar_url}</span>
                  )
                ) : (
                  profile.username[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white">Edit Photo</span>
              </div>
            </div>

            {/* Username + tier */}
            <div>
              <h2 className="font-display text-2xl italic text-foreground leading-tight">@{profile.username}</h2>
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold">
                {tierForScore(avgScore)}
              </span>
            </div>

            {/* City + streak row */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {profile.city && (
                <span className="text-xs text-muted-foreground font-medium">
                  📍 {profile.city}
                </span>
              )}
              {displayStreak && (
                <span className="inline-flex items-center gap-1 text-xs text-score-mid font-semibold">
                  <Flame className="h-3.5 w-3.5 fill-score-mid" /> {displayStreak.currentStreak}d streak
                </span>
              )}
            </div>

            {/* Badges showcase */}
            {streakBadges?.badges && streakBadges.badges.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-center flex-wrap gap-2">
                  {streakBadges.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2.5 py-1 text-[10px] font-medium text-foreground/80"
                      title={badge.name}
                    >
                      {badge.emoji} {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Bio & Details */}
          <div className="md:col-span-2 rounded-3xl border border-border dark:border-border bg-card/60 p-5 sm:p-8 shadow-lg backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl italic text-foreground">Bio & other details</h3>
                <div className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_10px_var(--success)]" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 border-y border-border dark:border-border py-6 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Name</p>
                  <p className="text-foreground/90 font-medium">{(profile as any)?.full_name || profile.username}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Age</p>
                  <p className="text-foreground/90 font-medium">{(profile as any)?.age || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Gender</p>
                  <p className="text-foreground/90 font-medium">{(profile as any)?.gender || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">City</p>
                  <p className="text-foreground/90 font-medium">{profile.city || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Occupation</p>
                  <p className="text-foreground/90 font-medium">{(profile as any)?.occupation || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Country</p>
                  <p className="text-foreground/90 font-medium">{(profile as any)?.country || '—'}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold mb-3">Dating Philosophy</p>
                <p className="font-display italic text-muted-foreground/80 leading-relaxed text-lg">
                  "{profile.bio || "Reviewing dates, analyzing romance, and sharing stories. Welcome to my archive of romantic adventures."}"
                </p>
              </div>

              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold mb-3">Partners</p>
                {partners.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {partners.map(p => (
                      <div key={p.id} className="px-4 py-2 rounded-full border border-border bg-secondary/30 dark:bg-elevated/50 text-sm flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    ))}
                    <Link href="/partners/new" className="px-5 py-2.5 rounded-full glass-btn text-sm inline-flex items-center gap-2 touch-target">
                      <PlusCircle className="h-4 w-4" /> Add
                    </Link>
                  </div>
                ) : (
                  <Link href="/partners/new" className="inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-sm font-semibold touch-target">
                    <PlusCircle className="h-4 w-4" /> Add your first partner
                  </Link>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {/* Avg Score — dominant */}
              <div className="col-span-2 p-5 rounded-2xl border border-primary/20 bg-primary/[0.04] backdrop-blur-md flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Avg Score</div>
                <div className="font-score text-4xl sm:text-5xl text-primary leading-none"><AnimatedNumber value={avgScore} delay={0.2} /></div>
              </div>
              {/* Best Score — dominant */}
              <div className="col-span-2 p-5 rounded-2xl border border-gold/20 bg-gold/[0.04] backdrop-blur-md flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Best Score</div>
                <div className="font-score text-4xl sm:text-5xl text-gold leading-none"><AnimatedNumber value={bestScore} delay={0.4} /></div>
              </div>
              {/* Posts */}
              <div className="col-span-1 p-3 rounded-2xl border border-border bg-secondary/30 dark:bg-elevated/50 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="font-score text-xl text-foreground">{posts?.length || 0}</div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Posts</div>
              </div>
              {/* Partners */}
              <div className="col-span-1 p-3 rounded-2xl border border-border bg-secondary/30 dark:bg-elevated/50 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="font-score text-xl text-primary">{partners.length}</div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Partners</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="px-3 py-1.5 rounded-full border border-border/50 bg-secondary/20 text-[10px] text-muted-foreground font-medium">
                {bondCount} Bonds
              </div>
              <div className="px-3 py-1.5 rounded-full border border-border/50 bg-secondary/20 text-[10px] text-muted-foreground font-medium">
                {connectionCount} Connections
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Social Media / Actions */}
        <div className="rounded-3xl border border-border dark:border-border bg-card/60 p-5 sm:p-8 mb-6 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-w-0">
          <div className="w-full min-w-0 flex-1">
            <h3 className="font-display text-2xl italic text-foreground mb-6">Quick Actions</h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 [&::-webkit-scrollbar]:hidden scroll-fade-right">
              <Link href="/partners/new" className="block snap-start min-w-max">
                <div className="flex items-center gap-3 bg-secondary/30 dark:bg-elevated/40 hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-md active:bg-black/10 dark:active:bg-white/15 active:translate-y-0 active:shadow-sm border border-border dark:border-border rounded-full pr-5 pl-2 py-2 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-black/40 grid place-items-center transition-transform">
                    <Heart className="h-4 w-4 text-primary dark:text-blush" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Add Partner</span>
                </div>
              </Link>
              <Link href="/posts/new" className="block snap-start min-w-max">
                <div className="flex items-center gap-3 bg-secondary/30 dark:bg-elevated/40 hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-md active:bg-black/10 dark:active:bg-white/15 active:translate-y-0 active:shadow-sm border border-border dark:border-border rounded-full pr-5 pl-2 py-2 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-black/40 grid place-items-center transition-transform">
                    <PlusCircle className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Share Post</span>
                </div>
              </Link>
              <button 
                className="flex items-center gap-3 bg-secondary/30 dark:bg-elevated/40 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 border border-border dark:border-border rounded-full pr-5 pl-2 py-2 transition-all duration-300 group snap-start min-w-max"
                onClick={() => {
                  openShare('profile', {
                    username: profile.username,
                    avatarUrl: profile.avatar_url,
                    score: avgScore,
                    city: profile.city || undefined,
                    streak: displayStreak?.currentStreak || 0,
                  });
                }}
              >
                <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-black/40 grid place-items-center transition-transform">
                  <Share2 className="h-4 w-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Share Scorecard</span>
              </button>
            </div>
          </div>
          {displayStreak && (
            <motion.div 
              initial={{ scale: 0.97, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-warning/10 border border-warning/30"
            >
              <Flame className="h-8 w-8 text-warning fill-warning" />
              <div>
                <p className="text-lg font-display italic text-warning">
                  {displayStreak.message}
                </p>
                <p className="text-xs text-warning/80 uppercase tracking-widest font-medium">
                  Longest Streak: {displayStreak.longestStreak} days
                </p>
                {canRestoreStreak && (
                  <button
                    onClick={() => setIsRestoreModalOpen(true)}
                    className="mt-3 inline-flex items-center rounded-full glass-btn px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] touch-target"
                  >
                    Restore Streak
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Panel: My Productions (Verdicts) */}
        <div className="rounded-3xl border border-border dark:border-border bg-card/60 p-5 sm:p-8 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl italic text-foreground">My Verdicts</h3>
            {posts && posts.length > 0 && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {posts.length} post{posts.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="h-6 w-32 bg-black/5 dark:bg-white/5 rounded-full mx-auto animate-pulse" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {posts.map((post) => {
                const story = {
                  id: post.id,
                  username: profile?.username ? `@${profile.username}` : '@you',
                  partnerNickname: post.partner?.name || 'partner',
                  city: post.post_city || profile?.city || 'Unknown',
                  country: (profile as any)?.country || 'Earth',
                  headline: post.description || '',
                  score: post.ai_score || 0,
                  verdict: post.ai_feedback || 'No feedback provided.',
                  reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                  believable: 0,
                  sus: 0,
                  postedAt: formatRelativeTime(post.created_at),
                };
                return (
                  <div key={post.id} className="break-inside-avoid">
                    <StoryCard story={story} compact={true} post={post} onEdit={() => setEditingPost(post)} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-display italic text-foreground mb-2">The archives are empty</h3>
              <p className="text-muted-foreground text-sm mb-6">No verdicts yet. The board is waiting to judge.</p>
              <Link href="/posts/new" className="inline-flex items-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-medium touch-target">
                Claim your first verdict
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Archived Posts Panel */}
      <div className="p-5">
        <div className="rounded-3xl border border-border dark:border-border bg-card/40 p-5 sm:p-8 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl italic text-foreground flex items-center gap-3">
              <Archive className="h-5 w-5 text-muted-foreground" />
              Archived Posts
            </h3>
            {archivedPosts && archivedPosts.length > 0 && (
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {archivedPosts.length} post{archivedPosts.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {archivedLoading ? (
            <div className="py-12 text-center">
              <div className="h-6 w-32 bg-black/5 dark:bg-white/5 rounded-full mx-auto animate-pulse" />
            </div>
          ) : archivedPosts && archivedPosts.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {archivedPosts.map((post) => {
                const story = {
                  id: post.id,
                  username: profile?.username ? `@${profile.username}` : '@you',
                  partnerNickname: post.partner?.name || 'partner',
                  city: post.post_city || profile?.city || 'Unknown',
                  country: (profile as any)?.country || 'Earth',
                  headline: post.description || '',
                  score: post.ai_score || 0,
                  verdict: post.ai_feedback || 'No feedback provided.',
                  reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                  believable: 0,
                  sus: 0,
                  postedAt: formatRelativeTime(post.created_at),
                };
                return (
                  <div key={post.id} className="break-inside-avoid relative">
                    {/* Dimmed overlay to signal archived state */}
                    <div className="opacity-60 pointer-events-none select-none">
                      <StoryCard story={story} compact={true} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => handleUnarchive(post.id)}
                        disabled={unarchivingId === post.id}
                        className="flex items-center gap-2 rounded-full glass-btn px-6 py-3 text-xs font-semibold shadow-lg backdrop-blur touch-target disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                        {unarchivingId === post.id ? 'Restoring...' : 'Restore Post'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Archive className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No archived posts.</p>
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        currentProfile={profile}
        currentUser={user}
        onSuccess={() => {
          refreshProfile();
          queryClient.invalidateQueries({ queryKey: ['explore-posts'] });
          setIsEditing(false);
        }}
      />

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentProfile={profile}
        onSuccess={() => {
          refreshProfile();
          queryClient.invalidateQueries({ queryKey: ['explore-posts'] });
          setIsAvatarModalOpen(false);
        }}
      />

      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          isPremium={!!profile?.is_premium}
        />
      )}

      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Streak"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Payment flow placeholder: restoring your streak currently simulates a successful payment.
          </p>
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Amount</p>
            <p className="font-score text-3xl text-foreground">Rs {RESTORE_STREAK_AMOUNT}</p>
            <p className="text-xs text-muted-foreground mt-2">
              This will restore your streak to {restorableStreakLength} day{restorableStreakLength === 1 ? '' : 's'}.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsRestoreModalOpen(false)}
              className="rounded-full glass-btn px-5 py-3 text-xs font-semibold touch-target"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRestoreStreak}
              disabled={isRestoringStreak}
              className="rounded-full glass-btn px-6 py-3 text-xs font-semibold touch-target disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRestoringStreak ? 'Restoring...' : 'Pay & Restore (Placeholder)'}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

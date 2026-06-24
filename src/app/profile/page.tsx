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
import { Heart, PlusCircle, Trophy, Flame, LogOut, Settings, Archive, ArchiveRestore } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AvatarSelectionModal } from '@/components/profile/AvatarSelectionModal';
import { EditPostModal } from '@/components/posts/EditPostModal';
import { Share2 } from 'lucide-react';
import { useShare } from '@/components/providers/ShareProvider';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Spinner } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const RESTORE_STREAK_AMOUNT = 49;
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = usePosts(user?.id);
  const { data: archivedPosts, isLoading: archivedLoading, refetch: refetchArchived } = useArchivedPosts(user?.id);
  const [partners, setPartners] = useState<{id: string, name: string, emoji: string}[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
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
          <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
        </div>
      );
    }
    // Logged in but profile query returned nothing (edge case)
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="mb-4">Profile not found.</p>
        <Link href="/auth/login" className="text-blush hover:underline">Log in</Link>
      </div>
    );
  }

  const scoredPosts = posts?.filter((p) => p.ai_score) || [];
  const bestScore = scoredPosts.length > 0 ? Math.max(...scoredPosts.map((p) => p.ai_score || 0)) : 0;

  return (
    <main className="w-full mx-auto min-h-screen bg-transparent relative pb-12 px-4 sm:px-8">
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
          <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 rounded-full border border-border bg-card/50 text-xs font-semibold text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            Edit
          </button>
          <button onClick={async () => {
            setIsLoggingOut(true);
            await signOut();
          }} className="p-2 rounded-full border border-border bg-card/50 text-muted-foreground hover:text-destructive hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-5">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Left Panel: Identity */}
          <div className="md:col-span-1 rounded-3xl border border-border dark:border-border bg-card/60 p-8 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-xl gap-5 relative">

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
              className="absolute top-4 right-4 p-2 rounded-full border border-border bg-card hover:bg-elevated text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share profile"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="h-44 w-44 rounded-full border-4 border-elevated shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] bg-transparent flex items-center justify-center font-display text-6xl text-muted-foreground overflow-hidden">
                {profile.avatar_url ? (
                  profile.avatar_url.startsWith('http') ? (
                    <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{profile.avatar_url}</span>
                  )
                ) : (
                  profile.username[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                <span className="inline-flex items-center gap-1 text-xs text-orange-500 font-semibold">
                  <Flame className="h-3.5 w-3.5 fill-orange-500" /> {displayStreak.currentStreak}d streak
                </span>
              )}
            </div>


          </div>

          {/* Right Panel: Bio & Details */}
          <div className="md:col-span-2 rounded-3xl border border-border dark:border-border bg-card/60 p-8 shadow-lg backdrop-blur-xl flex flex-col justify-between">
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
                      <div key={p.id} className="px-4 py-1.5 rounded-full border border-border bg-secondary/30 dark:bg-elevated/50 text-sm flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    ))}
                    <Link href="/partners/new" className="px-4 py-1.5 rounded-full border border-dashed border-border dark:border-border text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground">
                      <PlusCircle className="h-4 w-4" /> Add
                    </Link>
                  </div>
                ) : (
                  <Link href="/partners/new" className="inline-flex items-center gap-2 text-sm text-blush hover:text-blush/80 transition-colors">
                    <PlusCircle className="h-4 w-4" /> Add your first partner
                  </Link>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-border dark:border-border bg-secondary/30 dark:bg-elevated/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Posts</div>
                <div className="font-score text-2xl text-foreground">{posts?.length || 0}</div>
              </div>
              <div className="p-4 rounded-2xl border border-border dark:border-border bg-secondary/30 dark:bg-elevated/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Avg Score</div>
                <div className="font-score text-2xl text-primary"><AnimatedNumber value={avgScore} delay={0.2} /></div>
              </div>
              <div className="p-4 rounded-2xl border border-border dark:border-border bg-secondary/30 dark:bg-elevated/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Best Score</div>
                <div className="font-score text-2xl text-gold"><AnimatedNumber value={bestScore} delay={0.4} /></div>
              </div>
              <div className="p-4 rounded-2xl border border-border dark:border-border bg-secondary/30 dark:bg-elevated/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Partners</div>
                <div className="font-score text-2xl text-primary">{partners.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Social Media / Actions */}
        <div className="rounded-3xl border border-border dark:border-border bg-card/60 p-8 mb-6 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-w-0">
          <div className="w-full min-w-0 flex-1">
            <h3 className="font-display text-2xl italic text-foreground mb-6">Quick Actions</h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 [&::-webkit-scrollbar]:hidden">
              <Link href="/partners/new" className="block snap-start min-w-max">
                <div className="flex items-center gap-3 bg-secondary/30 dark:bg-elevated/40 hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-md border border-border dark:border-border rounded-full pr-5 pl-2 py-2 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-black/40 grid place-items-center transition-transform">
                    <Heart className="h-4 w-4 text-primary dark:text-blush" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Add Partner</span>
                </div>
              </Link>
              <Link href="/posts/new" className="block snap-start min-w-max">
                <div className="flex items-center gap-3 bg-secondary/30 dark:bg-elevated/40 hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-md border border-border dark:border-border rounded-full pr-5 pl-2 py-2 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-black/40 grid place-items-center transition-transform">
                    <PlusCircle className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Share Post</span>
                </div>
              </Link>
              <button 
                className="flex items-center gap-3 bg-secondary/30 dark:bg-elevated/40 hover:bg-black/5 dark:hover:bg-white/10 border border-border dark:border-border rounded-full pr-5 pl-2 py-2 transition-all duration-300 group snap-start min-w-max"
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
              className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20"
            >
              <Flame className="h-8 w-8 text-orange-500 dark:text-orange-500 fill-orange-500" />
              <div>
                <p className="text-lg font-display italic text-orange-600 dark:text-orange-400">
                  {displayStreak.message}
                </p>
                <p className="text-xs text-orange-500/80 dark:text-orange-500/70 uppercase tracking-widest font-medium">
                  Longest Streak: {displayStreak.longestStreak} days
                </p>
                {canRestoreStreak && (
                  <button
                    onClick={() => setIsRestoreModalOpen(true)}
                    className="mt-3 inline-flex items-center rounded-full border border-orange-300/50 bg-orange-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-600 transition-colors hover:bg-orange-500/20 dark:text-orange-300"
                  >
                    Restore Streak
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Panel: My Productions (Verdicts) */}
        <div className="rounded-3xl border border-border dark:border-border bg-card/60 p-8 shadow-lg backdrop-blur-xl">
          <h3 className="font-display text-2xl italic text-foreground mb-8">My Verdicts</h3>

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
                    <StoryCard story={story} compact={true} onEdit={() => setEditingPost(post)} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-display italic text-foreground mb-2">The archives are empty</h3>
              <p className="text-muted-foreground text-sm mb-6">No verdicts yet. The board is waiting to judge.</p>
              <Link href="/posts/new">
                <button className="inline-flex items-center gap-2 rounded-full border border-border dark:border-border bg-black/5 dark:bg-white/5 px-6 py-2.5 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  Claim your first verdict
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Archived Posts Panel */}
      <div className="p-5">
        <div className="rounded-3xl border border-border dark:border-border bg-card/40 p-8 shadow-lg backdrop-blur-xl">
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
                        className="flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-elevated shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                        {unarchivingId === post.id ? 'Restoring…' : 'Restore Post'}
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
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRestoreStreak}
              disabled={isRestoringStreak}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRestoringStreak ? 'Restoring...' : 'Pay & Restore (Placeholder)'}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

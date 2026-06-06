'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { StoryCard } from '@/components/ui/StoryCard';
import { usePosts } from '@/lib/hooks/usePosts';
import { calculateStreak } from '@/lib/utils/streak';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { Heart, PlusCircle, Trophy, Flame, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AvatarSelectionModal } from '@/components/profile/AvatarSelectionModal';

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useUser();
  const { data: posts, isLoading } = usePosts(user?.id);
  const [partners, setPartners] = useState<{id: string, name: string, emoji: string}[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const streak = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return calculateStreak(posts.map((p) => p.created_at));
  }, [posts]);

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

  if (authLoading) return (
    <div className="py-20 text-center animate-pulse">
      <div className="h-8 w-48 bg-elevated rounded-full mx-auto mb-4" />
    </div>
  );

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="mb-4">Profile not found.</p>
        <Link href="/auth/login" className="text-blush hover:underline">Log in</Link>
      </div>
    );
  }

  const scoredPosts = posts?.filter((p) => p.ai_score) || [];
  const bestScore = scoredPosts.length > 0 ? Math.max(...scoredPosts.map((p) => p.ai_score || 0)) : 0;

  const meta = user?.user_metadata || {};

  return (
    <main className="max-w-5xl mx-auto w-full min-h-screen bg-background relative pb-32">
      <header className="px-5 pb-8 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-3">The Archives</p>
          <h1 className="font-display text-5xl sm:text-6xl italic text-foreground leading-none">My Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-full border border-white/10 bg-card/50 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-white/5 transition-colors">
            Edit Profile
          </button>
          <button onClick={() => {
            const supabase = createClient();
            supabase.auth.signOut().then(() => window.location.href = '/');
          }} className="p-2 rounded-full border border-white/10 bg-card/50 text-muted-foreground hover:text-destructive hover:bg-white/5 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-5">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Left Panel: Identity */}
          <div className="md:col-span-1 rounded-3xl border border-white/10 bg-card/60 p-8 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-xl">
            <h2 className="font-display text-3xl text-foreground mb-1">@{profile.username}</h2>
            <p className="text-xs font-medium text-success mb-8">Premium User</p>
            <div className="relative group cursor-pointer mb-4" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="h-48 w-48 rounded-full border-4 border-elevated shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] bg-background flex items-center justify-center font-display text-6xl text-muted-foreground overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.username[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white">Edit Photo</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Bio & Details */}
          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-card/60 p-8 shadow-lg backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl italic text-foreground">Bio & other details</h3>
                <div className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_10px_var(--success)]" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 border-y border-white/5 py-6 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Name</p>
                  <p className="text-foreground/90 font-medium">{profile.username}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Age</p>
                  <p className="text-foreground/90 font-medium">{meta.age || '24'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Gender</p>
                  <p className="text-foreground/90 font-medium">{meta.gender || 'Non-binary'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">City</p>
                  <p className="text-foreground/90 font-medium">{meta.city || 'San Francisco'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Occupation</p>
                  <p className="text-foreground/90 font-medium">{meta.occupation || 'Creative Director'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Status</p>
                  <p className="text-foreground/90 font-medium">{meta.status || 'Exploring'}</p>
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
                      <div key={p.id} className="px-4 py-1.5 rounded-full border border-white/10 bg-background/50 text-sm flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    ))}
                    <Link href="/partners/new" className="px-4 py-1.5 rounded-full border border-dashed border-white/20 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors text-muted-foreground">
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
              <div className="p-4 rounded-2xl border border-white/5 bg-background/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Posts</div>
                <div className="font-score text-2xl text-foreground">{posts?.length || 0}</div>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-background/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Avg Score</div>
                <div className="font-score text-2xl text-primary">{avgScore}</div>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-background/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Best Score</div>
                <div className="font-score text-2xl text-gold">{bestScore.toFixed(1)}</div>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-background/50 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Partners</div>
                <div className="font-score text-2xl text-blush">{partners.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Social Media / Actions */}
        <div className="rounded-3xl border border-white/10 bg-card/60 p-8 mb-6 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl italic text-foreground mb-6">Quick Actions</h3>
            <div className="flex gap-4">
              <Link href="/partners/new" className="flex items-center gap-3 bg-elevated/40 hover:bg-white/5 border border-white/10 rounded-full pr-5 pl-2 py-2 transition-colors group">
                <div className="h-10 w-10 rounded-full bg-black/40 grid place-items-center group-hover:scale-105 transition-transform">
                  <Heart className="h-4 w-4 text-blush" />
                </div>
                <span className="text-sm font-medium text-foreground">Add Partner</span>
              </Link>
              <Link href="/posts/new" className="flex items-center gap-3 bg-elevated/40 hover:bg-white/5 border border-white/10 rounded-full pr-5 pl-2 py-2 transition-colors group">
                <div className="h-10 w-10 rounded-full bg-black/40 grid place-items-center group-hover:scale-105 transition-transform">
                  <PlusCircle className="h-4 w-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Share Post</span>
              </Link>
            </div>
          </div>
          {streak && (
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-orange-900/10 border border-orange-500/20">
              <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
              <div>
                <p className="text-lg font-display italic text-orange-400">
                  {streak.message}
                </p>
                <p className="text-xs text-orange-500/70 uppercase tracking-widest">
                  Longest Streak: {streak.longestStreak} days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel: My Productions (Verdicts) */}
        <div className="rounded-3xl border border-white/10 bg-card/60 p-8 shadow-lg backdrop-blur-xl">
          <h3 className="font-display text-2xl italic text-foreground mb-8">My Verdicts</h3>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="h-6 w-32 bg-white/5 rounded-full mx-auto animate-pulse" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {posts.map((post) => {
                const story = {
                  id: post.id,
                  username: profile?.username ? `@${profile.username}` : '@you',
                  partnerNickname: post.partner?.name || 'partner',
                  city: profile?.city || 'Unknown',
                  country: profile?.country || 'Earth',
                  headline: post.description || '',
                  score: post.ai_score || 0,
                  verdict: post.ai_feedback || 'No feedback provided.',
                  reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
                  believable: 0,
                  sus: 0,
                  postedAt: new Date(post.created_at).toLocaleDateString(),
                };
                return (
                  <div key={post.id} className="break-inside-avoid">
                    <StoryCard story={story} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-display italic text-foreground mb-2">The archives are empty</h3>
              <p className="text-muted-foreground text-sm mb-6">Share your first appreciation post to get scored!</p>
              <Link href="/posts/new">
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors">
                  Share Your First Post
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        currentProfile={profile}
        onSuccess={() => window.location.reload()}
      />

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentProfile={profile}
        onSuccess={() => window.location.reload()}
      />
    </main>
  );
}

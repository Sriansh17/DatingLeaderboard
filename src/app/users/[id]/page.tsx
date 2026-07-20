'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageBell } from '@/components/ui/PageBell';
import { ArrowLeft, Heart, MapPin, Sparkles, MessageCircle, LogIn, Users, Diamond, Share2, Trophy, Flame } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ConnectButton } from '@/components/cliques/ConnectButton';
import { StoryCard } from '@/components/ui/StoryCard';
import { RankCarousel } from '@/components/ui/RankCarousel';
import { InviteToCliqueModal } from '@/components/cliques/InviteToCliqueModal';
import { formatRelativeTime } from '@/lib/utils/format';
import { tierForScore, scoreColor } from '@/lib/mock-data';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useUser } from '@/components/providers/AuthProvider';
import { motion } from 'framer-motion';
import type { Post, ConnectionStatus } from '@/types/database';

interface PublicProfileData {
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    age?: string | null;
    gender?: string | null;
    occupation?: string | null;
    country?: string | null;
    created_at?: string;
  };
  stats: {
    post_count: number;
    average_score: number;
    top_partner_name: string | null;
    top_partner_emoji: string | null;
    rank?: number | null;
  };
  posts: Post[];
  partners?: { id: string; name: string; emoji: string }[];
  extended_posts?: boolean;
  connection_status?: ConnectionStatus;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [bondCount, setBondCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;
    setLoading(true);

    const isUuid = id.includes('-');

    if (isUuid) {
      fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setData(json.data);
            setConnectionStatus(json.data.connection_status || 'none');
          } else setError(json.error || 'User not found');
        })
        .catch(() => setError('Failed to load profile'))
        .finally(() => setLoading(false));

      fetch(`/api/circles?userId=${id}`)
        .then(r => r.json()).then(d => { if (d.success) setBondCount(d.data?.length || 0); }).catch(() => {});
      fetch(`/api/connections?userId=${id}`)
        .then(r => r.json()).then(d => { if (d.success) setConnectionCount(d.data?.length || 0); }).catch(() => {});
    } else {
      fetch(`/api/users/search?q=${encodeURIComponent(id)}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data?.length > 0) {
            router.replace(`/users/${json.data[0].id}`);
          } else {
            setError('User not found');
            setLoading(false);
          }
        })
        .catch(() => { setError('Failed to load profile'); setLoading(false); });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center">
        <Spinner size="lg" text={["LOADING PROFILE...", "FETCHING VERDICTS..."]} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center text-center px-4">
        <div>
          <p className="text-muted-foreground mb-4 text-lg font-display italic">{error || 'User not found'}</p>
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full glass-btn px-5 py-2.5 text-sm font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const { profile, stats, posts, partners } = data;
  const isOwnProfile = user?.id === profile.id;
  const bestScore = posts.length > 0 ? Math.max(...posts.filter(p => p.ai_score).map(p => p.ai_score || 0)) : 0;

  // Compute streak from post dates
  const userStreak = (() => {
    if (!posts || posts.length === 0) return null;
    const dates = Array.from(new Set(posts.map(p => p.created_at?.slice(0, 10)))).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) return null;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dates[0] !== today && dates[0] !== yesterday) return { currentStreak: 0, longestStreak: 0 };
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      if (isNaN(prev.getTime()) || isNaN(curr.getTime())) break;
      const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak++; else break;
    }
    return { currentStreak: streak, longestStreak: streak };
  })();

  return (
    <main className="w-full mx-auto min-h-dvh bg-transparent relative pb-12 px-4 sm:px-8">
      <header className="px-5 pb-8 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-2">Profile</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl italic text-foreground leading-none">@{profile.username}</motion.h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="px-5 py-2.5 rounded-full glass-btn text-xs font-semibold touch-target">
            <ArrowLeft className="h-3.5 w-3.5 inline mr-1" /> Back</button>
          <PageBell />
        </div>
      </header>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Left Panel: Identity — mirroring own profile layout */}
          <div className="md:col-span-1 rounded-3xl border border-border bg-card/60 p-5 sm:p-8 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-xl gap-5 relative">

            {/* Share button */}
            <button onClick={() => { try { navigator.share({ title: `@${profile.username} on Fond`, text: `Check out @${profile.username}'s profile on Fond!`, url: window.location.href }); } catch {} }}
              className="absolute top-4 right-4 p-2 rounded-full glass-btn text-muted-foreground hover:text-foreground" aria-label="Share profile">
              <Share2 className="h-4 w-4" />
            </button>

            {/* Avatar */}
            <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-full border-4 border-elevated shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] bg-transparent flex items-center justify-center font-display text-4xl sm:text-6xl text-muted-foreground overflow-hidden">
              {profile.avatar_url ? (
                profile.avatar_url.startsWith('http') ? (
                  <img src={profile.avatar_url} alt={profile.username} loading="lazy" className="w-full h-full object-cover" />
                ) : (<span className="text-5xl">{profile.avatar_url}</span>)
              ) : (profile.username[0]?.toUpperCase() || '?')}
            </div>

            {/* Username + tier — same as own profile */}
            <div>
              <h2 className="font-display text-2xl italic text-foreground leading-tight">@{profile.username}</h2>
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold">
                {tierForScore(stats.average_score)}
              </span>
            </div>

            {/* City + streak row — matching own profile exactly */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {profile.city && (
                <span className="text-xs text-muted-foreground font-medium">📍 {profile.city}</span>
              )}
              {userStreak && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${userStreak.currentStreak > 0 ? 'text-score-mid' : 'text-muted-foreground/50'}`}>
                  <Flame className={`h-3.5 w-3.5 ${userStreak.currentStreak > 0 ? 'fill-score-mid text-score-mid' : 'text-muted-foreground/40'}`} /> {userStreak.currentStreak}d streak
                </span>
              )}
            </div>

            {/* Dating Philosophy — improved design */}
            {profile.bio && (
              <div className="w-full pt-4 mt-1">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                  <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gold/70 shrink-0">Dating Philosophy</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                </div>
                <p className="font-display italic text-muted-foreground/75 leading-relaxed text-sm">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Details & Stats */}
          <div className="md:col-span-2 rounded-3xl border border-border bg-card/60 p-5 sm:p-8 shadow-lg backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl italic text-foreground mb-6">Bio & other details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 border-y border-border py-6 mb-6">
                <div><p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Age</p><p className="text-foreground/90 font-medium">{profile.age || '—'}</p></div>
                <div><p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Gender</p><p className="text-foreground/90 font-medium">{profile.gender || '—'}</p></div>
                <div><p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">City</p><p className="text-foreground/90 font-medium">{profile.city || '—'}</p></div>
                <div><p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Occupation</p><p className="text-foreground/90 font-medium">{profile.occupation || '—'}</p></div>
                <div><p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1">Country</p><p className="text-foreground/90 font-medium">{profile.country || '—'}</p></div>
              </div>

              {/* Partners */}
              {partners && partners.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold mb-3">Partners</p>
                  <div className="flex flex-wrap gap-2">
                    {partners.map(p => (
                      <div key={p.id} className="px-4 py-2 rounded-full border border-border bg-secondary/30 text-sm flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats grid — matching own profile layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-1 p-3 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary/[0.04] blur-xl pointer-events-none" />
                <div className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: scoreColor(stats.average_score) }}>Avg Score</div>
                <div className="font-score text-2xl sm:text-3xl leading-none" style={{ color: scoreColor(stats.average_score) }}><AnimatedNumber value={stats.average_score} delay={0.2} /></div>
                <div className="text-[8px] font-medium mt-1" style={{ color: scoreColor(stats.average_score) }}>{tierForScore(stats.average_score)}</div>
              </div>
              <div className="col-span-1 p-3 rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-gold/[0.02] backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gold/[0.04] blur-xl pointer-events-none" />
                <div className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: scoreColor(bestScore) }}>Best Score</div>
                <div className="font-score text-2xl sm:text-3xl leading-none" style={{ color: scoreColor(bestScore) }}><AnimatedNumber value={bestScore} delay={0.4} /></div>
                <div className="text-[8px] font-medium mt-1" style={{ color: scoreColor(bestScore) }}>{tierForScore(bestScore)}</div>
              </div>
              <div className="col-span-1 flex">{profile.id && <RankCarousel userId={profile.id} city={profile.city} />}</div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <div className="flex-1 p-2.5 rounded-2xl border border-primary/20 bg-primary/[0.04] backdrop-blur-md flex flex-col items-center justify-center">
                  <div className="font-score text-lg text-primary">{partners?.length || 0}</div>
                  <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5">Partners</div>
                </div>
                <div className="flex-1 p-2.5 rounded-2xl border border-border bg-secondary/30 backdrop-blur-md flex flex-col items-center justify-center">
                  <div className="font-score text-lg text-foreground">{bondCount}</div>
                  <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5">Bonds</div>
                </div>
                <div className="flex-1 p-2.5 rounded-2xl border border-border bg-secondary/30 backdrop-blur-md flex flex-col items-center justify-center">
                  <div className="font-score text-lg text-gold">{connectionCount}</div>
                  <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5">Connections</div>
                </div>
              </div>
            </div>

            {/* Connect/Invite action */}
            {!isOwnProfile && (
              <div className="mt-6 pt-6 border-t border-border">
                {user ? (
                  <div className="glass-2 rounded-full inline-flex items-center gap-1 p-1 shadow-sm">
                    <ConnectButton targetUserId={profile.id} initialStatus={connectionStatus} onStatusChange={(newStatus) => setConnectionStatus(newStatus)} />
                    <button onClick={() => setInviteOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-full bg-primary/15 backdrop-blur-xl border border-primary/25 text-primary hover:bg-primary/25 active:bg-primary/35 shadow-[var(--shadow-glow)] px-4 py-2 text-sm font-semibold transition-all">
                      <Users className="h-4 w-4" /> Invite to Bond
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LogIn className="h-4 w-4" />
                    <Link href="/auth/login" className="text-primary hover:underline active:underline">Sign in</Link>
                    <span>to connect with @{profile.username}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts section */}
        <div className="rounded-3xl border border-border bg-card/60 p-5 sm:p-8 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl italic text-foreground">Verdicts</h3>
            {posts.length > 0 && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{posts.length} post{posts.length === 1 ? '' : 's'}</span>}
          </div>
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-display italic text-foreground mb-2">No public verdicts yet</h3>
              <p className="text-muted-foreground text-sm">Their story is still being written.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {posts.map((post) => {
                const story = {
                  id: post.id, username: `@${profile.username}`, userAvatarUrl: profile?.avatar_url || null,
                  partnerNickname: post.partner?.name || 'partner', partnerAvatarUrl: post.partner?.avatar_url || null,
                  city: profile.city || 'Unknown', country: profile.country || 'Earth',
                  headline: post.description || '', score: post.ai_score || 0,
                  verdict: post.ai_feedback || 'No feedback provided.',
                  reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 }, believable: 0, sus: 0,
                  postedAt: formatRelativeTime(post.created_at),
                };
                return (<div key={post.id} className="break-inside-avoid"><StoryCard story={story} compact={true} post={post} /></div>);
              })}
            </div>
          )}
        </div>
      </div>

      <InviteToCliqueModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} targetUserId={profile.id} targetUsername={profile.username} />
    </main>
  );
}

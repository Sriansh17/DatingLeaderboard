'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageBell } from '@/components/ui/PageBell';
import { ArrowLeft, Heart, Trophy, MapPin, Sparkles, MessageCircle, LogIn, Users, Diamond } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ConnectButton } from '@/components/cliques/ConnectButton';
import { InviteToCliqueModal } from '@/components/cliques/InviteToCliqueModal';
import { formatRelativeTime } from '@/lib/utils/format';
import { useUser } from '@/components/providers/AuthProvider';
import type { Post, Profile, ConnectionStatus } from '@/types/database';

interface PublicProfileData {
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    created_at?: string;
  };
  stats: {
    post_count: number;
    average_score: number;
    top_partner_name: string | null;
    top_partner_emoji: string | null;
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

      // Fetch social counts
      fetch(`/api/circles?userId=${id}`)
        .then(r => r.json()).then(d => { if (d.success) setBondCount(d.data?.length || 0); }).catch(() => {});
      fetch(`/api/connections?userId=${id}`)
        .then(r => r.json()).then(d => { if (d.success) setConnectionCount(d.data?.length || 0); }).catch(() => {});
    } else {
      // Username lookup — search then redirect to UUID URL
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
      <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
        <Spinner size="lg" text={["LOADING PROFILE...", "FETCHING VERDICTS..."]} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">{error || 'User not found'}</p>
        <button onClick={() => router.back()} className="text-primary hover:underline active:underline">Go Back</button>
      </div>
    );
  }

  const { profile, stats, posts, partners } = data;
  const isOwnProfile = user?.id === profile.id;
  const scoreColor = stats.average_score >= 92 ? 'text-score-legendary'
    : stats.average_score >= 75 ? 'text-score-high'
    : stats.average_score >= 55 ? 'text-score-mid'
    : 'text-score-low';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 relative">
      {/* Fond rose glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      {/* Back button — Fond pill style */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/40 px-5 py-2.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 active:bg-elevated transition-colors mb-6 touch-target"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* PageBell — floating top-right */}
      <div className="absolute top-8 right-4 z-10">
        <PageBell />
      </div>

      {/* Bento Grid — same as profile page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* Left Panel: Identity */}
        <div className="md:col-span-1 glass-2 rounded-3xl p-5 sm:p-8 flex flex-col items-center text-center gap-5 relative">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Public Profile</p>

          {/* Avatar */}
          <div className="h-28 w-28 rounded-full glass-2 flex items-center justify-center text-3xl font-bold text-foreground shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              profile.username[0]?.toUpperCase() || '?'
            )}
          </div>

          {/* Username + name */}
          <div>
            <h1 className="font-display text-2xl italic text-foreground leading-tight">@{profile.username}</h1>
            {profile.full_name && (
              <p className="text-muted-foreground text-sm mt-1">{profile.full_name}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-foreground/70 leading-relaxed">{profile.bio}</p>
          )}

          {/* City */}
          {profile.city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {profile.city}
            </p>
          )}

        </div>

        {/* Right Panel: Bio, Stats & Actions */}
        <div className="md:col-span-2 glass-2 rounded-3xl p-5 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl italic text-foreground">Stats & Activity</h3>
            <span className="text-[10px] text-muted-foreground/60">
              Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}
            </span>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-elevated/50 text-center">
              <div className="font-score text-2xl text-foreground">{stats.post_count}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Posts</div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-elevated/50 text-center">
              <div className={`font-score text-2xl ${scoreColor}`}>
                {stats.average_score > 0 ? stats.average_score.toFixed(1) : '—'}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Avg Score</div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-elevated/50 text-center">
              <div className="text-2xl">{stats.top_partner_emoji || '💔'}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stats.top_partner_name || 'Partner'}</div>
            </div>
          </div>

          {/* Social stats — bonds + connections */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-2xl border border-border bg-elevated/50 text-center">
              <div className="font-score text-xl text-foreground">{bondCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Diamond className="h-3 w-3" /> Bonds
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-elevated/50 text-center">
              <div className="font-score text-xl text-gold">{connectionCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" /> Connections
              </div>
            </div>
          </div>

          {/* Bio & details — if available */}
          {(profile.bio || partners) && (
            <div className="border-t border-border pt-6 space-y-4">
              {profile.bio && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold mb-2">Dating Philosophy</p>
                  <p className="font-display italic text-muted-foreground/80 leading-relaxed text-base">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                </div>
              )}

              {partners && partners.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold mb-2">Partners</p>
                  <div className="flex flex-wrap gap-2">
                    {partners.map(p => (
                      <span key={p.id} className="px-3 py-1 rounded-full border border-border bg-elevated/50 text-sm flex items-center gap-1.5">
                        <span>{p.emoji}</span>
                        <span className="text-foreground font-medium">{p.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action pill */}
          {!isOwnProfile && (
            <div className="border-t border-border pt-6">
              {user ? (
                <div className="glass-2 rounded-full inline-flex items-center gap-1 p-1 shadow-sm">
                  <ConnectButton
                    targetUserId={profile.id}
                    initialStatus={connectionStatus}
                    onStatusChange={(newStatus) => setConnectionStatus(newStatus)}
                  />
                  <button
                    onClick={() => setInviteOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-elevated active:text-foreground active:bg-elevated/80 transition-colors touch-target"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Invite to Bond
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

      {/* Invite modal */}
      <InviteToCliqueModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        targetUserId={profile.id}
        targetUsername={profile.username}
      />

      {/* Recent posts */}
      <h2 className="font-display text-2xl italic text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Recent Verdicts
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-border bg-card/40">
          <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No public posts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block p-5 rounded-2xl border border-border glass-2 hover:border-primary/30 active:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    {post.partner && (
                      <span>{post.partner.emoji} {post.partner.name}</span>
                    )}
                    <span>&bull;</span>
                    <span>{formatRelativeTime(post.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2 italic">
                    &ldquo;{post.description}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.ai_score && (
                    <span className={`font-score text-xl ${
                      post.ai_score >= 92 ? 'text-score-legendary' : post.ai_score >= 75 ? 'text-score-high' : post.ai_score >= 55 ? 'text-score-mid' : 'text-score-low'
                    }`}>
                      {post.ai_score}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {(post as any).likes_count ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {(post as any).comments_count ?? 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

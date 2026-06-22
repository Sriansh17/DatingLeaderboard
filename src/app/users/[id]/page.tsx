'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Trophy, MapPin, Sparkles, MessageCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Post, Profile } from '@/types/database';

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
}

export default function UserProfilePage() {
  const params = useParams();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/users/${params.id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError(json.error || 'User not found');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <Spinner size="lg" className="mx-auto" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">{error || 'User not found'}</p>
        <Link href="/explore" className="text-primary hover:underline">Back to Explore</Link>
      </div>
    );
  }

  const { profile, stats, posts, partners } = data;
  const scoreColor = stats.average_score >= 80 ? 'text-green-500'
    : stats.average_score >= 60 ? 'text-yellow-500'
    : stats.average_score >= 40 ? 'text-orange-500'
    : 'text-red-400';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Explore
      </Link>

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-3xl font-bold text-white shrink-0 overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            profile.username[0]?.toUpperCase() || '?'
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h1 className="font-display text-3xl italic text-foreground">
            @{profile.username}
          </h1>
          {profile.full_name && (
            <p className="text-muted-foreground text-sm mt-0.5">{profile.full_name}</p>
          )}
          {profile.bio && (
            <p className="text-foreground/70 text-sm mt-2 max-w-md">{profile.bio}</p>
          )}
          {profile.city && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="h-3 w-3" /> {profile.city}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl border border-border bg-card/60 text-center">
          <div className="font-score text-2xl text-foreground">{stats.post_count}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Posts</div>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card/60 text-center">
          <div className={`font-score text-2xl ${scoreColor}`}>
            {stats.average_score > 0 ? stats.average_score.toFixed(1) : '—'}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Avg Score</div>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card/60 text-center">
          <div className="text-2xl">
            {stats.top_partner_emoji || '💔'}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Partner</div>
        </div>
      </div>

      {/* Recent posts */}
      <h2 className="font-display text-xl italic text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Recent Verdicts
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-border bg-card/40">
          <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No public posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block p-5 rounded-2xl border border-border bg-card/60 hover:bg-card/80 hover:border-primary/30 transition-all"
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
                      post.ai_score >= 80 ? 'text-green-500' : post.ai_score >= 60 ? 'text-yellow-500' : 'text-orange-400'
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

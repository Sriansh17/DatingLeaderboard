'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { PostCard } from '@/components/posts/PostCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { usePosts } from '@/lib/hooks/usePosts';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { calculateStreak } from '@/lib/utils/streak';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { Heart, PlusCircle, Trophy, Flame } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useUser();
  const { data: posts, isLoading } = usePosts(user?.id);
  const [partnerCount, setPartnerCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  const { data: globalLeaderboard } = useLeaderboard({ type: 'global', limit: 3 });

  const streak = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return calculateStreak(posts.map((p) => p.created_at));
  }, [posts]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('partners').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      .then(({ count }) => setPartnerCount(count || 0));
  }, [user]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const scores = posts.filter((p) => p.ai_score).map((p) => p.ai_score!);
      if (scores.length > 0) {
        setAvgScore(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
      }
    }
  }, [posts]);

  if (authLoading || !profile) return <Spinner size="lg" className="mx-auto mt-20" />;

  const scoredPosts = posts?.filter((p) => p.ai_score) || [];
  const totalScore = scoredPosts.reduce((a, b) => a + (b.ai_score || 0), 0);
  const bestScore = scoredPosts.length > 0 ? Math.max(...scoredPosts.map((p) => p.ai_score || 0)) : 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <ProfileHeader
        profile={profile}
        postCount={posts?.length || 0}
        partnerCount={partnerCount}
        averageScore={avgScore}
        streak={streak}
      />

      <ProfileStats
        postCount={posts?.length || 0}
        partnerCount={partnerCount}
        averageScore={avgScore}
        totalScore={totalScore}
        bestScore={bestScore}
      />

      {/* Streak + Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        {streak && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {streak.message}
              </p>
              <p className="text-xs text-orange-500/70">
                Longest: {streak.longestStreak} days
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <Link href="/leaderboards">
            <Button variant="outline" size="sm">
              <Trophy className="h-4 w-4" />
              Rankings
            </Button>
          </Link>
          <Link href="/posts/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Weekly Top 3 */}
      {globalLeaderboard && globalLeaderboard.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              🏆 This Week&apos;s Champions
            </h2>
            <Link href="/leaderboards">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <LeaderboardTable entries={globalLeaderboard.slice(0, 3)} />
        </div>
      )}

      {/* My Recent Posts */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">My Recent Posts</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.slice(0, 10).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-10 w-10 text-pink-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm mb-4">Share your first appreciation post to get scored!</p>
            <Link href="/posts/new">
              <Button>Share Your First Post</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

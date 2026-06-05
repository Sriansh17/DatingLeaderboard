'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { PostFeed } from '@/components/posts/PostFeed';
import { Spinner } from '@/components/ui/Spinner';
import { usePosts } from '@/lib/hooks/usePosts';
import { calculateStreak } from '@/lib/utils/streak';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useUser();
  const { data: posts } = usePosts(user?.id);
  const [partnerCount, setPartnerCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('partners').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      .then(({ count }) => setPartnerCount(count || 0));
  }, [user]);

  const streak = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return calculateStreak(posts.map((p) => p.created_at));
  }, [posts]);

  if (authLoading || !profile) return <Spinner size="lg" className="mx-auto mt-20" />;

  const scoredPosts = posts?.filter((p) => p.ai_score) || [];
  const avgScore = scoredPosts.length > 0
    ? Math.round(scoredPosts.reduce((a, b) => a + (b.ai_score || 0), 0) / scoredPosts.length)
    : 0;
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

      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Posts</h2>
        <PostFeed
          posts={posts?.slice(0, 5)}
          showCreateButton={false}
          emptyTitle="No posts yet"
          emptyDescription="Share your first appreciation post to get scored!"
        />
      </div>
    </div>
  );
}

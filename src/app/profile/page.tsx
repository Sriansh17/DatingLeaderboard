'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Spinner } from '@/components/ui/Spinner';
import { usePosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/posts/PostCard';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useUser();
  const { data: posts } = usePosts();
  const [partnerCount, setPartnerCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('partners').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      .then(({ count }) => setPartnerCount(count || 0));
  }, [user]);

  if (authLoading || !profile) return <Spinner size="lg" className="mx-auto mt-20" />;

  const avgScore = posts && posts.length > 0
    ? Math.round(posts.filter((p) => p.ai_score).reduce((a, b) => a + (b.ai_score || 0), 0) / posts.filter((p) => p.ai_score).length)
    : 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <ProfileHeader
        profile={profile}
        postCount={posts?.length || 0}
        partnerCount={partnerCount}
        averageScore={avgScore}
      />

      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No posts yet</p>
        )}
      </div>
    </div>
  );
}

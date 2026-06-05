'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { usePosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Heart, PlusCircle, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useUser();
  const { data: posts, isLoading } = usePosts();
  const [partnerCount, setPartnerCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome + Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Hey, {profile?.username || 'there'}! ❤️
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Share what your partner did for you today
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center !p-4">
          <p className="text-2xl font-bold text-pink-500">{posts?.length || 0}</p>
          <p className="text-xs text-gray-500">Total Posts</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl font-bold text-pink-500">{partnerCount}</p>
          <p className="text-xs text-gray-500">Partners</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl font-bold text-pink-500">{avgScore}</p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </Card>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.slice(0, 10).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm mb-6">Share your first appreciation post to get scored!</p>
            <Link href="/posts/new">
              <Button>Share Your First Post</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

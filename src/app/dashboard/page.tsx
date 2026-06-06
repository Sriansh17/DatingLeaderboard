'use client';

import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/posts/PostCard';
import { Card } from '@/components/ui/Card';
import { Heart, Compass, PlusCircle } from 'lucide-react';
import { FlagButton } from '@/components/posts/FlagButton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { Post } from '@/types/database';

function ExploreSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="!p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

async function fetchExplorePosts(): Promise<Post[]> {
  const res = await fetch('/api/posts/explore');
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

export default function DashboardPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['explore-posts'],
    queryFn: fetchExplorePosts,
    staleTime: 0, // always refetch on mount
    refetchOnWindowFocus: true,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Explore</h1>
            <p className="text-sm text-gray-500">See what others are appreciating ❤️</p>
          </div>
        </div>
        <Link href="/posts/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <ExploreSkeleton />
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No public posts yet
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Be the first to share an appreciation post!
          </p>
          <Link href="/posts/new">
            <Button>Share Your First Post</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id}>
              {post.profile && (
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {post.profile.full_name || post.profile.username}
                  </span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-sm text-gray-500">
                    {post.partner?.emoji} {post.partner?.name}
                  </span>
                </div>
              )}
              <PostCard post={post} />
              <div className="flex justify-end px-1 mt-1">
                <FlagButton postId={post.id} postUserId={post.user_id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

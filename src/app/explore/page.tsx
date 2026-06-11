'use client';

import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/posts/PostCard';
import { Spinner } from '@/components/ui/Spinner';
import { Heart, Compass } from 'lucide-react';
import type { Post } from '@/types/database';

async function fetchExplorePosts(): Promise<Post[]> {
  const res = await fetch('/api/posts/explore');
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

export default function ExplorePage() {
  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['explore-posts'],
    queryFn: fetchExplorePosts,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore</h1>
          <p className="text-sm text-gray-500">See what others are appreciating ❤️</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/90 mb-2">
            No public posts yet
          </h3>
          <p className="text-gray-500 text-sm">
            Be the first to share an appreciation post!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id}>
              {post.profile && (
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs text-gray-400">
                    {post.profile.full_name || post.profile.username}
                  </span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">
                    {post.partner?.emoji} {post.partner?.name}
                  </span>
                </div>
              )}
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

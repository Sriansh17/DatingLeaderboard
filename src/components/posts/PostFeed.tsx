'use client';

import { PostCard } from '@/components/posts/PostCard';
import { Spinner } from '@/components/ui/Spinner';
import { Heart, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Post } from '@/types/database';

interface PostFeedProps {
  posts?: Post[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  showCreateButton?: boolean;
}

export function PostFeed({
  posts,
  isLoading,
  emptyTitle = 'No posts yet',
  emptyDescription = 'Share your first appreciation post to get scored!',
  showCreateButton = true,
}: PostFeedProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground/90 mb-2">
          {emptyTitle}
        </h3>
        <p className="text-gray-500 text-sm mb-6">{emptyDescription}</p>
        {showCreateButton && (
          <Link href="/posts/new">
            <Button>Share Your First Post</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div className="flex justify-center pt-4">
        <Link href="/posts/new">
          <Button variant="outline" size="sm">
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>
    </div>
  );
}

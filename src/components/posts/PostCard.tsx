'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime, getScoreBgColor } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { Heart, Sparkles } from 'lucide-react';
import type { Post } from '@/types/database';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card hover className="cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Score circle */}
          <div className="flex-shrink-0">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${
                post.ai_score ? getScoreBgColor(post.ai_score) : 'bg-gray-300'
              }`}
            >
              {post.ai_score || '?'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {post.partner && (
                <span className="inline-flex items-center gap-1.5">
                  {post.partner.avatar_url ? (
                    <Avatar src={post.partner.avatar_url} alt={post.partner.name} size="sm" />
                  ) : (
                    <span>{post.partner.emoji}</span>
                  )}
                  <Badge variant="info">{post.partner.name}</Badge>
                </span>
              )}
              <span className="text-xs text-gray-400">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>

            <p className="text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">
              {post.description}
            </p>

            {post.ai_feedback && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-pink-500">
                <Sparkles className="h-4 w-4" />
                <span className="italic">{post.ai_feedback}</span>
              </div>
            )}
          </div>

          <Heart className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  );
}

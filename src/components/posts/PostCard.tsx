'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import type { Post } from '@/types/database';
import { Share } from 'lucide-react';
import { useShare } from '@/components/providers/ShareProvider';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { openShare } = useShare();

  return (
    <Link href={`/posts/${post.id}`} className="block w-full max-w-2xl mx-auto mb-4 sm:mb-6 px-3 sm:px-0">
      <Card hover>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 overflow-hidden flex items-center justify-center text-base font-bold text-primary-foreground flex-shrink-0">
            {post.partner && post.partner.avatar_url ? (
              <img src={post.partner.avatar_url} alt={post.partner.name} className="w-full h-full object-cover" />
            ) : post.partner?.emoji ? (
              <span>{post.partner.emoji}</span>
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm sm:text-[15px] text-foreground truncate">
              {post.partner ? post.partner.name : 'Unknown Partner'}
            </div>
            <div className="text-muted-foreground text-[11px] sm:text-[13px] mt-0.5">
              {formatRelativeTime(post.created_at)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-5 text-sm sm:text-[16px] leading-[1.5] sm:leading-[1.6] text-foreground/90 font-light italic line-clamp-4">
          "{post.description}"
        </div>
        
        {post.ai_score ? (
          <div className="mt-5 sm:mt-6 text-center">
            <div className="inline-block px-3 py-1.5 rounded-full bg-muted text-[10px] sm:text-[12px] tracking-[1px] text-muted-foreground mb-3 sm:mb-4 font-medium">
              LOVE SCORE
            </div>
            <div className="font-serif text-5xl sm:text-[80px] lg:text-[100px] leading-[1] font-bold text-foreground">
              {post.ai_score}
            </div>
            {post.ai_feedback && (
              <div className="font-serif text-base sm:text-[20px] lg:text-[22px] text-foreground/80 mt-3 leading-relaxed max-w-lg mx-auto">
                {post.ai_feedback}
              </div>
            )}
          </div>
        ) : null}
        
        <div className="mt-5 sm:mt-6 pt-4 border-t border-border flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center text-[12px] sm:text-[14px] text-muted-foreground">
          <div className="flex items-center gap-2">
            ♡ {Math.floor(Math.random() * 50) + 10} &nbsp;&nbsp; ✨ {Math.floor(Math.random() * 20) + 5}
          </div>
          <button 
            className="bg-primary px-5 py-2 rounded-[18px] text-primary-foreground font-semibold border-none flex items-center gap-2 hover:opacity-90 transition-opacity text-xs sm:text-sm w-fit"
            onClick={(e) => {
              e.preventDefault();
              openShare('post', {
                username: post.profile?.username || 'Someone',
                partnerName: post.partner?.name || 'Partner',
                avatarUrl: post.partner?.avatar_url,
                headline: post.description,
                verdict: post.ai_feedback || undefined,
                score: post.ai_score || undefined,
                city: post.post_city || post.profile?.city || undefined,
                date: formatRelativeTime(post.created_at),
              });
            }}
          >
            <Share className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Share
          </button>
        </div>
      </Card>
    </Link>
  );
}

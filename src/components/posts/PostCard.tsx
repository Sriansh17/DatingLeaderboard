'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import type { Post } from '@/types/database';
import { Share } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`} className="block w-full max-w-2xl mx-auto mb-8">
      <Card hover>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gradientStart to-gradientEnd overflow-hidden flex items-center justify-center text-xl font-bold text-white">
            {post.partner && post.partner.avatar_url ? (
              <img src={post.partner.avatar_url} alt={post.partner.name} className="w-full h-full object-cover" />
            ) : post.partner?.emoji ? (
              <span>{post.partner.emoji}</span>
            ) : null}
          </div>
          <div>
            <div className="font-semibold text-[16px] text-[#111]">
              {post.partner ? post.partner.name : 'Unknown Partner'}
            </div>
            <div className="text-[#888] text-[13px] mt-1">
              {formatRelativeTime(post.created_at)}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-[18px] leading-[1.6] text-[#333] font-light italic">
          "{post.description}"
        </div>
        
        {post.ai_score ? (
          <div className="mt-8 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-white/65 text-[12px] tracking-[1px] text-[#7b7b7b] mb-6 font-medium">
              LOVE SCORE
            </div>
            <div className="font-serif text-[110px] leading-[1] font-bold text-[#191919]">
              {post.ai_score}
            </div>
            {post.ai_feedback && (
              <div className="font-serif text-[24px] text-[#444] mt-4 leading-relaxed">
                {post.ai_feedback}
              </div>
            )}
          </div>
        ) : null}
        
        <div className="mt-8 pt-5 border-t border-black/5 flex justify-between items-center text-[14px] text-[#8f8f8f]">
          <div className="flex items-center gap-2">
            {/* Fake likes for aesthetic demo */}
            ♡ {Math.floor(Math.random() * 50) + 10} &nbsp;&nbsp; ✨ {Math.floor(Math.random() * 20) + 5}
          </div>
          <button 
            className="bg-gradient-to-br from-gradientStart to-gradientEnd px-6 py-2.5 rounded-[18px] text-[#111] font-semibold border-none flex items-center gap-2 hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Share className="w-4 h-4" /> Share
          </button>
        </div>
      </Card>
    </Link>
  );
}

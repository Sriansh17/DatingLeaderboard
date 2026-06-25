"use client";

import { useState } from "react";
import { ScoreRing } from "./ScoreRing";
import { CommentModal } from "./CommentModal";
import type { Story } from "@/lib/mock-data";
import type { Post } from "@/types/database";
import Link from "next/link";
import { Heart, Share2, Pencil, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useShare } from "@/components/providers/ShareProvider";
import { useUser } from "@/components/providers/AuthProvider";
import { useLikePost } from "@/lib/hooks/usePosts";
import { motion, AnimatePresence } from "framer-motion";

export type StoryCardVariant = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

interface StoryCardProps {
  story: Story;
  variant?: StoryCardVariant;
  compact?: boolean;
  post?: Post; // Add optional post prop for real data
  onEdit?: () => void;
}

export function StoryCard({ story, variant = 'C', compact = false, post, onEdit }: StoryCardProps) {
  const { addToast } = useToast();
  const { openShare } = useShare();
  const { user } = useUser();
  const likePostMutation = useLikePost();
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(post?.has_liked ?? false);
  const [likesCount, setLikesCount] = useState(post?.likes_count ?? 0);
  const [showComments, setShowComments] = useState(false);

  const handleReact = async (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'Heart' && post && user) {
      // Optimistic update
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      try {
        await likePostMutation.mutateAsync(post.id);
      } catch (error) {
        // Revert on error
        setIsLiked(prev => !prev);
        setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        console.error('Failed to toggle like:', error);
      }
    } else if (type === 'Heart' && !user) {
      addToast('Sign in to like posts', 'error');
    } else {
      // For other reactions, use local state
      if (activeReaction === type) {
        setActiveReaction(null);
        addToast(`Removed reaction`, 'success');
      } else {
        setActiveReaction(type);
        addToast(`Reacted with ${type}!`, 'success');
      }
    }
  };

  // Single click handler — routes based on data-* attributes, no nested interactive elements
  const handleCardClick = (e: React.MouseEvent) => {
    if (showComments) return; // don't navigate when modal is open
    const el = e.target as HTMLElement;
    if (el.closest('[data-profile]')) {
      e.preventDefault();
      const userId = post?.user_id;
      if (userId) window.location.href = `/users/${userId}`;
      return;
    }
    if (el.closest('[data-action]')) return;
    if (post) {
      window.location.href = `/posts/${story.id}`;
    }
  };

  const renderHeader = (textColorClass = "text-foreground", mutedColorClass = "text-muted-foreground") => (
    <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-6">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {post ? (
            <span
              data-profile
              className={`font-bold tracking-tight text-base sm:text-lg truncate max-w-[45%] text-primary underline decoration-dotted decoration-primary/30 underline-offset-2`}
            >
              {story.username}
            </span>
          ) : (
            <span className={`${textColorClass} font-bold tracking-tight text-base sm:text-lg truncate max-w-[45%]`}>{story.username}</span>
          )}
          <span className={`${mutedColorClass} italic shrink-0`}>×</span>
          <span className={`${textColorClass} opacity-80 font-medium text-base sm:text-lg truncate max-w-[45%]`}>{story.partnerNickname}</span>
        </div>
        <div className={`text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold ${mutedColorClass} opacity-60`}>
          {story.city} • {story.postedAt}
        </div>
      </div>
      
      <div className="flex-shrink-0 transition-transform duration-700 group-hover:scale-105 ml-2">
        <ScoreRing score={story.score} size={64} />
      </div>
    </header>
  );

  const renderFooter = (mutedClass = "text-muted-foreground hover:text-foreground", borderClass = "border-border/50") => {
    // Use local state for optimistic updates, fall back to prop on initial render
    const heartActive = post ? isLiked : activeReaction === 'Heart';
    const heartCount = post ? likesCount : 0;
    
    console.log('[StoryCard renderFooter] isLiked:', isLiked, 'likesCount:', likesCount);
    
    return (
    <footer className={`mt-auto pt-5 sm:pt-6 flex items-center justify-between relative z-10 border-t ${borderClass}`}>
      <div className="flex items-center gap-4 sm:gap-5">
        <button
          data-action
          onClick={(e) => handleReact(e, 'Heart')}
          disabled={post && likePostMutation.isPending}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            heartActive ? 'text-red-500 hover:text-red-600' : mutedClass
          }`}
        >
          <Heart className={`h-4 w-4 transition-all ${heartActive ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{post && heartCount > 0 ? heartCount : 0}</span>
        </button>
        <button data-action
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (post) setShowComments(true);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post?.comments_count ?? 0}</span>
        </button>
      </div>

      <button data-action
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openShare('post', {
            username: story.username,
            partnerName: story.partnerNickname,
            headline: story.headline,
            verdict: story.verdict,
            score: story.score,
            city: story.city,
            date: story.postedAt,
          });
        }}
        className={`relative overflow-hidden group/share flex items-center gap-1.5 text-xs font-medium transition-colors ${mutedClass}`}
        title="Share"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-active/share:animate-glass-sweep mix-blend-overlay pointer-events-none" />
        <Share2 className="h-4 w-4 relative z-10" />
        <span className="hidden sm:inline relative z-10">Share</span>
      </button>
      {onEdit && (
        <button data-action
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${mutedClass}`}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      )}
    </footer>
  );
  };

  // Focus primarily on Variant C which is the main hybrid style used
  if (variant === 'C') {
    return (
      <div onClick={handleCardClick} className="block outline-none group relative h-full cursor-pointer">
        <motion.article
          layout
          initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`group/card relative rounded-[2rem] overflow-hidden transition-all duration-500 h-full ${compact ? 'p-4 sm:p-5 min-h-[220px]' : 'p-5 sm:p-8 md:p-10 min-h-[400px]'}`}
        >
          {/* Animated Border Trace on Hover */}
          <div className="absolute inset-[-2px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 overflow-hidden rounded-[2rem] z-0">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-50%] w-[200%] h-[200%] origin-center pointer-events-none will-change-transform"
              style={{ background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgb(var(--primary)) 360deg)`, transform: 'translateZ(0)' }}
            />
          </div>

          {/* Legendary ambient gold glow */}
          {story.score >= 90 && (
            <div
              className="absolute inset-0 pointer-events-none rounded-[2rem] z-0 opacity-[0.04] dark:opacity-[0.08]"
              style={{ background: `radial-gradient(ellipse at 50% 0%, rgb(var(--gold)) 0%, transparent 70%)` }}
            />
          )}
          
          {/* The solid background that covers the middle, leaving only a 1px border stroke visible */}
          <div className={`absolute inset-[1px] bg-card rounded-[2rem] z-0 border transition-colors duration-500 ${
            story.score >= 97
              ? 'border-gold/40'
              : story.score >= 90
              ? 'border-gold/20'
              : 'border-border'
          }`} />
          
          <header className="flex items-center justify-between gap-4 relative z-10 w-full mb-8 sm:mb-10 mt-2">
            {/* Dual avatar lockup + names */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Overlapping avatar pair — vertically centered in container */}
              <div className="relative flex-shrink-0 h-[36px] w-[48px]">
                {/* Partner avatar (back) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full ring-2 ring-card overflow-hidden bg-gradient-to-br from-rose-300 to-pink-500 flex items-center justify-center">
                  {story.partnerAvatarUrl ? (
                    <img src={story.partnerAvatarUrl} alt={story.partnerNickname} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-[11px] font-bold leading-none">
                      {story.partnerNickname.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* User avatar (front) */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full ring-2 ring-card overflow-hidden bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center z-10">
                  {story.userAvatarUrl ? (
                    <img src={story.userAvatarUrl} alt={story.username} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-[11px] font-bold leading-none">
                      {story.username.replace('@', '').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Names */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  {post ? (
                    <button
                      data-profile
                      className="text-foreground font-bold tracking-tight text-base sm:text-lg truncate max-w-[120px] underline decoration-dotted decoration-primary/30 underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {story.username}
                    </button>
                  ) : (
                    <span className="text-foreground font-bold tracking-tight text-base sm:text-lg truncate max-w-[120px]">{story.username}</span>
                  )}
                  <span className="text-muted-foreground/50 text-xs">×</span>
                  <span className="text-foreground/80 font-medium text-sm sm:text-base truncate max-w-[100px]">{story.partnerNickname}</span>
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
                  {story.city}{story.city ? ' · ' : ''}{story.postedAt}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 self-center">
              <ScoreRing score={story.score} size={compact ? 44 : 80} />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center py-2 sm:py-4 relative z-10">
            <h3 className={`font-display italic leading-[1.1] text-foreground line-clamp-4 transition-all ${compact ? 'text-xl sm:text-2xl md:text-[2rem]' : 'text-[2.75rem]'}`}>
              &quot;{story.headline}&quot;
            </h3>
            <div className={compact ? "mt-4 sm:mt-6" : "mt-10"}>
              <span className="font-bold uppercase tracking-[0.2em] text-[9px] text-primary block mb-2 sm:mb-3">AI Verdict</span>
              <p className={`text-foreground/80 leading-relaxed font-sans font-light ${compact ? 'text-xs sm:text-sm line-clamp-3' : 'text-base line-clamp-2'}`}>
                {story.verdict}
              </p>
            </div>
          </div>
          
          <footer className={`flex w-full items-center justify-between gap-2 relative z-10 border-t border-border ${compact ? 'mt-4 sm:mt-6 pt-3 sm:pt-4' : 'mt-10 pt-6'}`}>
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <button 
                onClick={(e) => handleReact(e, 'Heart')}
                disabled={post && likePostMutation.isPending}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  (post ? isLiked : activeReaction === 'Heart')
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-muted-foreground hover:text-red-400'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`h-4 w-4 ${(post ? isLiked : activeReaction === 'Heart') ? 'fill-red-500' : ''}`} />
                <span>{post ? likesCount : 0}</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (post) setShowComments(true);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post?.comments_count ?? 0}</span>
              </button>

            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <button data-action
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5 inline mr-1" />
                  Edit
                </button>
              )}
              <button data-action
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openShare('post', {
                    username: story.username,
                    partnerName: story.partnerNickname,
                    headline: story.headline,
                    verdict: story.verdict,
                    score: story.score,
                    city: story.city,
                    date: story.postedAt,
                  });
                }}
                className="relative overflow-hidden group/share flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </footer>
        </motion.article>

        {/* Comment modal */}
        {post && (
          <CommentModal
            postId={post.id}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            commentsCount={post.comments_count}
          />
        )}
      </div>
    );
  }

  // Fallback for Variant A (baseline) and others to keep code minimal here, though they can be expanded if needed.
  return (
    <div onClick={handleCardClick} className="block outline-none group relative h-full cursor-pointer">
      <motion.article
        layout
        initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        className="rounded-3xl border border-border bg-card p-5 sm:p-8 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(233,43,84,0.15)] hover:border-primary/30 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full min-h-[300px]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/[0.02] mix-blend-overlay pointer-events-none" />
        {renderHeader()}
        <div className="flex-1 flex flex-col justify-center py-6 sm:py-8 relative z-10">
          <h3 className="font-display italic text-2xl sm:text-3xl md:text-4xl leading-tight text-foreground line-clamp-4 group-hover:text-primary transition-colors duration-500">
            &quot;{story.headline}&quot;
          </h3>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 max-w-full sm:max-w-[85%] font-sans">
            <span className="font-bold uppercase tracking-widest text-[9px] text-primary/80 block mb-1">AI Verdict</span>
            {story.verdict}
          </p>
        </div>
        {renderFooter()}
      </motion.article>

      {post && (
        <CommentModal
          postId={post.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          commentsCount={post.comments_count}
        />
      )}
    </div>
  );
}

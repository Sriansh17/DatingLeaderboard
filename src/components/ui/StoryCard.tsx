"use client";

import { useState } from "react";
import { ScoreRing } from "./ScoreRing";
import type { Story } from "@/lib/mock-data";
import Link from "next/link";
import { Heart, Trophy, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useShare } from "@/components/providers/ShareProvider";
import { motion, AnimatePresence } from "framer-motion";

export type StoryCardVariant = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

interface StoryCardProps {
  story: Story;
  variant?: StoryCardVariant;
  compact?: boolean;
}

export function StoryCard({ story, variant = 'C', compact = false }: StoryCardProps) {
  const { addToast } = useToast();
  const { openShare } = useShare();
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const handleReact = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    if (activeReaction === type) {
      setActiveReaction(null);
      addToast(`Removed reaction`, 'success');
    } else {
      setActiveReaction(type);
      addToast(`Reacted with ${type}!`, 'success');
    }
  };

  const renderHeader = (textColorClass = "text-foreground", mutedColorClass = "text-muted-foreground") => (
    <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-6">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={`${textColorClass} font-bold tracking-tight text-base sm:text-lg truncate max-w-[45%]`}>{story.username}</span>
          <span className={`${mutedColorClass} italic shrink-0`}>&times;</span>
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

  const renderFooter = (mutedClass = "text-muted-foreground hover:text-foreground", borderClass = "border-border/50") => (
    <footer className={`mt-auto pt-5 sm:pt-6 flex items-center justify-between relative z-10 border-t ${borderClass}`}>
      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          onClick={(e) => handleReact(e, 'Heart')}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${activeReaction === 'Heart' ? 'text-primary' : mutedClass}`}
        >
          <Heart className={`h-4 w-4 ${activeReaction === 'Heart' ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button 
          onClick={(e) => handleReact(e, 'Trophy')}
          className={`relative group/trophy flex items-center gap-1.5 text-xs font-medium transition-colors ${activeReaction === 'Trophy' ? 'text-gold' : mutedClass}`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none -mx-2 px-2">
            <motion.div 
              initial={{ x: "-150%", skewX: -15 }}
              whileHover={{ x: "200%", transition: { duration: 1.5, ease: "easeOut" } }}
              className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay" 
            />
          </div>
          <Trophy className={`h-4 w-4 relative z-10 ${activeReaction === 'Trophy' ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline relative z-10">Applaud</span>
          
          <AnimatePresence>
            {activeReaction === 'Trophy' && (
              <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                {[...Array(6)].map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const distance = 25 + Math.random() * 15;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: 0, scale: 1.5, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute w-1 h-1 bg-gold rounded-full"
                    />
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <button 
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
    </footer>
  );

  // Focus primarily on Variant C which is the main hybrid style used
  if (variant === 'C') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
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
          
          {/* The solid background that covers the middle, leaving only a 1px border stroke visible */}
          <div className="absolute inset-[1px] bg-card rounded-[2rem] z-0 border border-border transition-colors duration-500" />
          
          <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-8 sm:mb-10 mt-2">
            <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full">
                <span className="text-foreground dark:text-white font-bold tracking-tight text-lg sm:text-xl break-words">{story.username}</span>
                <span className="text-muted-foreground dark:text-white/30 text-sm">×</span>
                <span className="text-foreground/80 dark:text-white/80 font-medium text-base sm:text-lg break-words">{story.partnerNickname}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground dark:text-white/40 mt-1">
                {story.city} • {story.postedAt}
              </div>
            </div>
            
            <div className="flex-shrink-0 relative">
              <ScoreRing score={story.score} size={compact ? 44 : 80} />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center py-2 sm:py-4 relative z-10">
            <h3 className={`font-display italic leading-[1.1] text-foreground dark:text-white line-clamp-4 transition-all ${compact ? 'text-xl sm:text-2xl md:text-[2rem]' : 'text-[2.75rem]'}`}>
              &quot;{story.headline}&quot;
            </h3>
            <div className={compact ? "mt-4 sm:mt-6" : "mt-10"}>
              <span className="font-bold uppercase tracking-[0.2em] text-[9px] text-primary dark:text-white/50 block mb-2 sm:mb-3">AI Verdict</span>
              <p className={`text-foreground/80 dark:text-white/80 leading-relaxed font-sans font-light ${compact ? 'text-xs sm:text-sm line-clamp-3' : 'text-base line-clamp-2'}`}>
                {story.verdict}
              </p>
            </div>
          </div>
          
          <footer className={`flex w-full items-center justify-between gap-2 relative z-10 border-t border-border dark:border-white/10 ${compact ? 'mt-4 sm:mt-6 pt-3 sm:pt-4' : 'mt-10 pt-6'}`}>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button 
                onClick={(e) => handleReact(e, 'Heart')}
                className={`relative group/heart flex h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem] items-center justify-center rounded-full border transition-colors ${activeReaction === 'Heart' ? 'bg-primary border-primary text-white' : 'border-black/10 dark:border-white/20 bg-black/5 dark:bg-black/40 text-foreground/70 dark:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
              >
                <Heart className={`relative z-10 h-5 w-5 sm:h-6 sm:w-6 ${activeReaction === 'Heart' ? 'fill-current text-white' : 'text-foreground/70 dark:text-white/90'}`} />
                
                <AnimatePresence>
                  {activeReaction === 'Heart' && (
                    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                      {[...Array(6)].map((_, i) => {
                        const angle = (i / 6) * Math.PI * 2;
                        const distance = 40 + Math.random() * 20;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                            animate={{ opacity: 0, scale: 1.5, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute w-1.5 h-1.5 bg-primary rounded-full"
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </button>
              
              {/* The Prestige Trophy Button */}
              <button 
                onClick={(e) => handleReact(e, 'Trophy')}
                className={`relative group/trophy flex h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem] items-center justify-center rounded-full border transition-colors ${activeReaction === 'Trophy' ? 'bg-gold border-gold text-white shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'border-black/10 dark:border-white/20 bg-black/5 dark:bg-black/40 text-foreground/70 dark:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
              >
                <Trophy className={`relative z-10 h-5 w-5 sm:h-6 sm:w-6 ${activeReaction === 'Trophy' ? 'fill-current text-white' : 'text-foreground/70 dark:text-white/90 group-hover/trophy:text-gold transition-colors duration-500'}`} />
                
                <AnimatePresence>
                  {activeReaction === 'Trophy' && (
                    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                      {[...Array(8)].map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2;
                        const distance = 40 + Math.random() * 20;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                            animate={{ opacity: 0, scale: 1.5, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute w-1.5 h-1.5 bg-gold rounded-full"
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <button 
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
              className="relative overflow-hidden group/share flex items-center justify-center px-6 sm:px-8 h-12 sm:h-[3.25rem] rounded-full border border-black/10 dark:border-white/20 bg-black/5 dark:bg-black/40 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover/share:animate-glass-sweep mix-blend-overlay pointer-events-none" />
              <span className="relative z-10 text-xs sm:text-[13px] font-bold tracking-wide text-foreground/90 dark:text-white/90 group-hover/share:text-foreground dark:group-hover/share:text-white transition-colors">SHARE</span>
            </button>
          </footer>
        </motion.article>
      </Link>
    );
  }

  // Fallback for Variant A (baseline) and others to keep code minimal here, though they can be expanded if needed.
  return (
    <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
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
    </Link>
  );
}

"use client";

import { useState } from "react";
import { ScoreRing } from "./ScoreRing";
import type { Story } from "@/lib/mock-data";
import Link from "next/link";
import { Heart, Trophy, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useShare } from "@/components/providers/ShareProvider";

export type StoryCardVariant = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

interface StoryCardProps {
  story: Story;
  variant?: StoryCardVariant;
}

export function StoryCard({ story, variant = 'A' }: StoryCardProps) {
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

  // Helper for rendering the header (name, partner, score) consistently across variants
  // Using flex wrapping so long names don't break the layout.
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
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${activeReaction === 'Trophy' ? 'text-gold' : mutedClass}`}
        >
          <Trophy className={`h-4 w-4 ${activeReaction === 'Trophy' ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Applaud</span>
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
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${mutedClass}`}
        title="Share"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>
    </footer>
  );

  // Variant A: Current Production Baseline
  if (variant === 'A') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="rounded-3xl border border-border bg-card p-5 sm:p-8 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(233,43,84,0.15)] hover:border-primary/30 relative overflow-hidden flex flex-col h-full min-h-[300px]">
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
        </article>
      </Link>
    );
  }

  // Variant B: Frosted Glass
  if (variant === 'B') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl p-6 sm:p-8 transition-all duration-500 hover:bg-white/10 hover:border-white/20 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[400px]">
          
          <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-8">
            <div className="flex-1 mt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2 shadow-inner backdrop-blur-md">
                <span className="text-white font-bold text-[15px]">{story.username}</span>
                <span className="text-white/40 text-[13px]">with</span>
                <span className="text-white font-bold text-[15px]">{story.partnerNickname}</span>
              </div>
            </div>
            
            <div className="flex-shrink-0 relative">
              <ScoreRing score={story.score} size={64} />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
            <h3 className="font-display italic text-3xl sm:text-4xl leading-[1.1] text-white/95 line-clamp-4">
              &quot;{story.headline}&quot;
            </h3>
            <div className="mt-8">
              <span className="font-bold uppercase tracking-[0.2em] text-[9px] text-white/50 block mb-2">AI Verdict</span>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-2 font-sans font-light">
                {story.verdict}
              </p>
            </div>
          </div>
          
          <footer className="mt-8 pt-6 flex items-center justify-between relative z-10 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => handleReact(e, 'Heart')}
                className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/20 transition-colors ${activeReaction === 'Heart' ? 'bg-primary border-primary text-white' : 'bg-black/20 text-white hover:bg-white/10'}`}
              >
                <Heart className={`h-6 w-6 ${activeReaction === 'Heart' ? 'fill-current text-white' : 'text-white/90'}`} />
              </button>
              <button 
                onClick={(e) => handleReact(e, 'Trophy')}
                className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/20 transition-colors ${activeReaction === 'Trophy' ? 'bg-gold border-gold text-white' : 'bg-black/20 text-white hover:bg-white/10'}`}
              >
                <Trophy className={`h-6 w-6 ${activeReaction === 'Trophy' ? 'fill-current text-white' : 'text-white/90'}`} />
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
              className="flex flex-col items-center justify-center px-8 h-[3.25rem] rounded-full border border-white/20 bg-black/20 hover:bg-white/10 transition-colors"
            >
              <span className="text-[13px] font-medium text-white/90 leading-tight">Share</span>
              <span className="text-[13px] font-medium text-white/90 leading-tight">Experience</span>
            </button>
          </footer>
        </article>
      </Link>
    );
  }

  // Variant C: Hybrid (Red Preview Tag, Golden Glow Ring, Pill Share)
  if (variant === 'C') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="rounded-[2rem] border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-3xl p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:border-white/20 hover:bg-[#0a0a0a]/80 relative flex flex-col h-full min-h-[400px]">
          
          <div className="absolute top-0 right-8 bg-[#E92B54] text-white text-[8px] font-bold tracking-widest uppercase px-3 py-1 rounded-b-lg shadow-lg">
            PREVIEW: HYBRID VARIANT
          </div>

          <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-10 mt-6">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold tracking-tight text-xl">{story.username}</span>
                <span className="text-white/30 text-sm">×</span>
                <span className="text-white/80 font-medium text-lg">{story.partnerNickname}</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mt-1">
                {story.city} • {story.postedAt}
              </div>
            </div>
            
            <div className="flex-shrink-0 relative">
              <ScoreRing score={story.score} size={80} />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
            <h3 className="font-display italic text-[2.75rem] leading-[1.1] text-white line-clamp-4">
              &quot;{story.headline}&quot;
            </h3>
            <div className="mt-10">
              <span className="font-bold uppercase tracking-[0.2em] text-[9px] text-white/50 block mb-3">AI Verdict</span>
              <p className="text-base text-white/80 leading-relaxed line-clamp-2 font-sans font-light">
                {story.verdict}
              </p>
            </div>
          </div>
          
          <footer className="mt-10 pt-6 flex items-center justify-between relative z-10 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => handleReact(e, 'Heart')}
                className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/20 transition-colors ${activeReaction === 'Heart' ? 'bg-primary border-primary text-white' : 'bg-black/40 text-white hover:bg-white/10'}`}
              >
                <Heart className={`h-6 w-6 ${activeReaction === 'Heart' ? 'fill-current text-white' : 'text-white/90'}`} />
              </button>
              <button 
                onClick={(e) => handleReact(e, 'Trophy')}
                className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/20 transition-colors ${activeReaction === 'Trophy' ? 'bg-gold border-gold text-white' : 'bg-black/40 text-white hover:bg-white/10'}`}
              >
                <Trophy className={`h-6 w-6 ${activeReaction === 'Trophy' ? 'fill-current text-white' : 'text-white/90'}`} />
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
              className="flex flex-col items-center justify-center px-8 h-[3.25rem] rounded-[2rem] border border-white/20 bg-black/40 hover:bg-white/10 transition-colors"
            >
              <span className="text-[13px] font-medium text-white/90 leading-tight">Share</span>
              <span className="text-[13px] font-medium text-white/90 leading-tight">Experience</span>
            </button>
          </footer>
        </article>
      </Link>
    );
  }

  // Variant D: Luxury Paper (Sharp corners, serif italics, lines)
  if (variant === 'D') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="rounded-[2rem] border border-white/20 bg-[#0a0a0a] p-8 sm:p-10 transition-all duration-500 hover:border-white/40 hover:bg-[#0f0f0f] relative overflow-hidden flex flex-col h-full min-h-[400px]">
          
          <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-12">
            <div className="flex flex-col gap-1 min-w-0 flex-1 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold tracking-tight text-xl">{story.username}</span>
                <span className="text-white/40 text-sm">×</span>
                <span className="text-white/90 font-medium text-lg">{story.partnerNickname}</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 mt-1">
                {story.city} • {story.postedAt}
              </div>
            </div>
            
            <div className="flex-shrink-0 relative">
              <ScoreRing score={story.score} size={72} />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
            <h3 className="font-display text-4xl sm:text-[2.75rem] leading-[1.1] text-white line-clamp-4">
              &quot;{story.headline}&quot;
            </h3>
            
            <div className="w-full h-px bg-white/20 mt-10 mb-8" />
            
            <div>
              <span className="font-bold uppercase tracking-[0.3em] text-[9px] text-white/70 block mb-4">Verdict</span>
              <p className="text-lg text-white/90 leading-relaxed line-clamp-2 font-display italic">
                {story.verdict}
              </p>
            </div>
            
            <div className="w-full h-px bg-white/20 mt-8 mb-6" />
          </div>
          
          <footer className="flex items-center justify-between relative z-10 pt-2">
            <div className="flex items-center gap-8 w-full justify-between">
              <div className="flex items-center gap-8">
                <button 
                  onClick={(e) => handleReact(e, 'Heart')}
                  className={`flex items-center gap-2 text-sm transition-colors ${activeReaction === 'Heart' ? 'text-primary' : 'text-white/70 hover:text-white'}`}
                >
                  <Heart className={`h-5 w-5 ${activeReaction === 'Heart' ? 'fill-current' : ''}`} />
                  <span>Like</span>
                </button>
                <button 
                  onClick={(e) => handleReact(e, 'Trophy')}
                  className={`flex items-center gap-2 text-sm transition-colors ${activeReaction === 'Trophy' ? 'text-gold' : 'text-white/70 hover:text-white'}`}
                >
                  <Trophy className={`h-5 w-5 ${activeReaction === 'Trophy' ? 'fill-current' : ''}`} />
                  <span>Applaud</span>
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
                className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </footer>
        </article>
      </Link>
    );
  }

  // Variant E: Elevated Surface (Linear style, layered shadows, slight depth)
  if (variant === 'E') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1A1A1A] p-5 sm:p-6 transition-all duration-300 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_4px_16px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1),0_12px_32px_-12px_rgba(0,0,0,0.04)] hover:-translate-y-1 relative flex flex-col h-full min-h-[300px]">
          {renderHeader()}
          <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 relative z-10">
            <h3 className="font-sans font-medium text-xl sm:text-2xl leading-tight text-foreground line-clamp-4">
              &quot;{story.headline}&quot;
            </h3>
            <div className="mt-4 sm:mt-6 rounded-lg bg-black/5 dark:bg-white/5 p-4">
              <span className="font-bold uppercase tracking-wider text-[9px] text-muted-foreground block mb-1.5">AI Verdict</span>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed line-clamp-2">
                {story.verdict}
              </p>
            </div>
          </div>
          {renderFooter()}
        </article>
      </Link>
    );
  }

  // Variant F: Quiet Luxury (Extreme spacing, minimal chrome)
  if (variant === 'F') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="p-4 sm:p-8 transition-all duration-500 opacity-90 hover:opacity-100 flex flex-col h-full min-h-[300px]">
          {renderHeader("text-foreground", "text-foreground/40")}
          <div className="flex-1 flex flex-col justify-center py-8 sm:py-12 relative z-10">
            <h3 className="font-display italic text-3xl sm:text-4xl md:text-5xl leading-tight text-foreground/90 line-clamp-4 font-light">
              &quot;{story.headline}&quot;
            </h3>
            <p className="mt-8 sm:mt-12 text-sm sm:text-base text-foreground/60 leading-relaxed line-clamp-2 font-sans font-light">
              <span className="font-medium text-foreground/40 mr-2">—</span>
              {story.verdict}
            </p>
          </div>
          {renderFooter("text-foreground/30 hover:text-foreground", "border-transparent")}
        </article>
      </Link>
    );
  }

  // Variant G: Classic (Dark theme, avatar, simple quotes)
  if (variant === 'G') {
    return (
      <Link href={`/posts/${story.id}`} className="block outline-none group relative h-full">
        <article className="rounded-[2rem] bg-[#0c0c10] border border-white/5 p-6 sm:p-8 transition-all duration-500 hover:bg-[#111116] hover:border-white/10 relative overflow-hidden flex flex-col h-full min-h-[400px]">
          
          <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-8">
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 font-display text-lg">
                {story.username.replace('@', '').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium tracking-tight text-base">{story.username}</span>
                  <span className="text-white/40 text-sm">with</span>
                  <span className="text-white/80 font-medium text-base">{story.partnerNickname}</span>
                </div>
                <div className="text-[12px] font-medium text-white/30 mt-0.5">
                  · {story.city} · {story.postedAt}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 relative">
              <ScoreRing score={story.score} size={64} />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
            <h3 className="font-display text-3xl sm:text-[2rem] leading-tight text-white/95 line-clamp-4">
              {story.headline}
            </h3>
            
            <div className="mt-8">
              <p className="text-xl text-white/80 leading-relaxed font-display italic">
                &quot;{story.verdict}&quot;
              </p>
            </div>
          </div>
          
          <footer className="mt-8 pt-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={(e) => handleReact(e, 'Heart')}
                className={`flex items-center gap-2 text-sm transition-colors ${activeReaction === 'Heart' ? 'text-primary' : 'text-white/40 hover:text-white'}`}
              >
                <Heart className={`h-5 w-5 ${activeReaction === 'Heart' ? 'fill-current' : ''}`} />
              </button>
            </div>
          </footer>
        </article>
      </Link>
    );
  }

  return null;
}

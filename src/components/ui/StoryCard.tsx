"use client";

import { useState } from "react";
import { ScoreRing } from "./ScoreRing";
import type { Story } from "@/lib/mock-data";
import Link from "next/link";
import { Heart, Flame, Trophy, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ShareExperienceModal } from "@/components/share/ShareExperienceModal";

export function StoryCard({ story }: { story: Story }) {
  const { addToast } = useToast();
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  return (
    <>
      <Link href={`/posts/${story.id}`} className="block outline-none group relative">
        <article className="rounded-3xl border border-border dark:border-white/5 bg-card dark:bg-gradient-to-br dark:from-card dark:to-transparent p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 dark:group-hover:border-white/10 group-hover:shadow-xl dark:group-hover:bg-white/[0.02] dark:backdrop-blur-md h-full relative overflow-hidden">
        
        <header className="flex items-start justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-elevated grid place-items-center font-display text-sm text-blush shadow-inner">
                  {story.username[1]?.toUpperCase() || 'U'}
                </div>
                <span className="text-foreground font-medium">{story.username}</span>
              </div>
              <span className="opacity-50">with</span>
              <span className="text-foreground/80 font-medium">{story.partnerNickname}</span>
              <span className="opacity-50">· {story.city}</span>
              <span className="opacity-50">· {story.postedAt}</span>
            </div>
            <h3 className="mt-3 font-display text-xl leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary">
              {story.headline}
            </h3>
          </div>
          <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110">
            <ScoreRing score={story.score} size={64} />
          </div>
        </header>

        <p className="mt-4 font-display italic text-muted-foreground/80 leading-relaxed line-clamp-3 relative z-10 pb-12">
          “{story.verdict}”
        </p>

        {story.suspectedFabrication && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-warning relative z-10">
            🕵️ Suspected Fabrication
          </div>
        )}

        {/* Floating Reactions Bar */}
        <div className="absolute right-5 bottom-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
          <button 
            onClick={(e) => handleReact(e, 'Heart')}
            className={`h-10 w-10 rounded-full grid place-items-center transition-all shadow-sm dark:shadow-lg dark:backdrop-blur-md hover:scale-110 ${activeReaction === 'Heart' ? 'bg-primary/10 dark:bg-black/80 text-primary dark:text-blush ring-2 ring-primary dark:ring-blush ring-offset-2 ring-offset-background' : 'bg-secondary dark:bg-black/60 border border-border dark:border-white/10 text-muted-foreground hover:text-primary dark:hover:text-blush'}`}
          >
            <Heart className={`h-5 w-5 ${activeReaction === 'Heart' ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => handleReact(e, 'Flame')}
            className={`h-10 w-10 rounded-full grid place-items-center transition-all shadow-sm dark:shadow-lg dark:backdrop-blur-md hover:scale-110 ${activeReaction === 'Flame' ? 'bg-orange-50 dark:bg-black/80 text-orange-500 ring-2 ring-orange-500 ring-offset-2 ring-offset-background' : 'bg-secondary dark:bg-black/60 border border-border dark:border-white/10 text-muted-foreground hover:text-orange-500'}`}
          >
            <Flame className={`h-5 w-5 ${activeReaction === 'Flame' ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => handleReact(e, 'Trophy')}
            className={`h-10 w-10 rounded-full grid place-items-center transition-all shadow-sm dark:shadow-lg dark:backdrop-blur-md hover:scale-110 ${activeReaction === 'Trophy' ? 'bg-amber-50 dark:bg-black/80 text-gold ring-2 ring-gold ring-offset-2 ring-offset-background' : 'bg-secondary dark:bg-black/60 border border-border dark:border-white/10 text-muted-foreground hover:text-gold'}`}
          >
            <Trophy className={`h-5 w-5 ${activeReaction === 'Trophy' ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            className="h-10 w-10 rounded-full grid place-items-center transition-all shadow-sm dark:shadow-lg dark:backdrop-blur-md hover:scale-110 bg-secondary dark:bg-black/60 border border-border dark:border-white/10 text-muted-foreground hover:text-white"
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </article>
      </Link>

      {isShareOpen && (
        <ShareExperienceModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          post={{
            id: story.id,
            description: story.headline,
            ai_score: story.score,
            ai_feedback: story.verdict,
            created_at: story.postedAt,
            user_id: 'anonymous',
            partner_id: 'anonymous',
            partner: { id: 'p1', name: story.partnerNickname, emoji: '👤', user_id: 'anonymous' }
          } as any}
          profileName={story.username.replace('@', '')}
          city={story.city}
        />
      )}
    </>
  );
}

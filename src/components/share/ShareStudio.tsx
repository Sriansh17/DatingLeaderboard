"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Download, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShare } from '../providers/ShareProvider';
import { ShareTemplates, ShareFormat, ShareTemplateTheme } from './ShareTemplates';
import * as htmlToImage from 'html-to-image';
import { useToast } from '../ui/Toast';

interface ThemeDef { id: ShareTemplateTheme; label: string; description: string; }

const POST_THEMES: ThemeDef[] = [
  { id: 'brutal-truth',  label: 'The Brutal Truth', description: 'Red menace. The AI verdict at maximum volume. Unfiltered.' },
  { id: 'wrapped',       label: 'Wrapped',          description: 'Data-driven duotone. Your year in romance, visualized.' },
  { id: 'daily-fond',    label: 'Daily Fond',        description: 'A newspaper front page. Your romance, above the fold.' },
  { id: 'constellation', label: 'Constellation',      description: 'Your romance, written in the stars. Celestial.' },
  { id: 'aura',          label: 'Aura',              description: 'Full-bleed dreamlike gradient. Pure atmosphere.' },
  { id: 'receipt',       label: 'The Receipt',       description: 'Boutique receipt. Your romance, itemized.' },
  { id: 'verdict-card',  label: 'Verdict Card',       description: 'The actual Fond VerdictCard. Score circle, tier, and quote.' },
];

const RANK_THEMES: ThemeDef[] = [
  { id: 'hall-of-fame',  label: 'Hall of Fame',      description: '"I ranked #32 in Mumbai." The number is the flex.' },
  { id: 'podium',        label: 'The Announcement',   description: 'Sports broadcast energy. Your rank, monumental.' },
  { id: 'fond-rating',   label: 'Fond Rating',        description: 'Institutional credit report. Official and serious.' },
  { id: 'leaderboard-card', label: 'Leaderboard Card', description: 'The actual Fond leaderboard row. Rank, avatar, score.' },
];

const PROFILE_THEMES: ThemeDef[] = [
  { id: 'profile-page',  label: 'Profile Page',       description: 'Your actual Fond profile. Avatar, details, stats, and bio.' },
  { id: 'fond-identity', label: 'Fond Identity',      description: 'Apple-inspired premium identity card. Your score, elevated.' },
  { id: 'membership',    label: 'Membership Card',   description: 'Like an Amex Centurion. Your Fond identity, in gold.' },
  { id: 'player-stats',  label: 'Player Stats',       description: 'ESPN meets romance. Your numbers, visualized.' },
  { id: 'profile-card',  label: 'Fond ID',            description: 'Clean identity card. Who you are on Fond.' },
];

export function ShareStudio() {
  const { isOpen, shareData, closeShare } = useShare();
  const { addToast } = useToast();
  const captureRef = useRef<HTMLDivElement>(null);


  const themes = shareData?.type === 'rank'
    ? RANK_THEMES
    : shareData?.type === 'profile'
      ? PROFILE_THEMES
      : POST_THEMES;
  const [themeIndex, setThemeIndex] = useState(0);
  const currentTheme = themes[Math.min(themeIndex, themes.length - 1)];

  const [format, setFormat] = useState<ShareFormat>('story');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Animate in
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setMounted(true), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setMounted(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen || !shareData) return null;

  const handleExport = async (action: 'share' | 'save') => {
    if (!captureRef.current) return;
    setIsExporting(true);

    try {
      // Generate High-Res PNG
      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 1,
      });

      if (action === 'save') {
        const link = document.createElement('a');
        link.download = `fond-${shareData.type}-${currentTheme.id}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        addToast('Saved to camera roll!', 'success');
      } else if (action === 'share') {
        // Try Native Share API if available (Mobile Web)
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'share.png', { type: blob.type });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Fond Share',
            text: 'Check this out on Fond!',
          });
        } else {
          // Fallback to save if share API not supported
          const link = document.createElement('a');
          link.download = `fond-${shareData.type}-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          addToast('Saved image for sharing!', 'success');
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      addToast('Failed to generate image', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://fond.app'); // TODO: deep linking
    setCopied(true);
    addToast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextTheme = () => {
    setThemeIndex((prev) => (prev + 1) % themes.length);
  };

  const handlePrevTheme = () => {
    setThemeIndex((prev) => (prev - 1 + themes.length) % themes.length);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 lg:p-12 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={closeShare}
    >
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[1100px] h-full max-h-[850px] bg-background rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row border border-border">

        {/* Close Button (Top Right) */}
        <button 
          onClick={(e) => { e.stopPropagation(); closeShare(); }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-[60] p-3 rounded-full border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-elevated active:text-foreground active:bg-elevated/80 backdrop-blur-md transition-colors touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: Live Preview Canvas */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-8 bg-black/5 dark:bg-black/20 overflow-hidden">
           <div className="w-full text-center lg:text-left mb-6 lg:mb-8 z-50 shrink-0">
             <h2 className="font-display italic text-[2rem] text-foreground">Share to Story</h2>
           </div>

           <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
             {/* Navigation Chevrons */}
             <button onClick={handlePrevTheme} className="absolute left-0 lg:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 active:bg-primary/15 transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </button>

             <button onClick={handleNextTheme} className="absolute right-0 lg:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl border border-border bg-muted text-foreground hover:bg-elevated active:bg-elevated/80 transition-colors">
               <ChevronRight className="w-5 h-5" />
             </button>

             <div 
               className="relative h-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-500 ease-out overflow-hidden rounded-[2rem]"
               style={{ aspectRatio: '9/16', maxHeight: '600px' }}
             >
               <ShareTemplates 
                 captureRef={captureRef}
                 theme={currentTheme.id} 
                 content={shareData.content} 
                 format={format} 
               />
             </div>
           </div>
        </div>

        {/* RIGHT PANEL: Controls */}
        <div className="w-full lg:w-[480px] flex flex-col justify-center p-8 lg:p-16 z-10 relative">
          <div className="max-w-md w-full space-y-8">
            
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold">
                {shareData?.type === 'rank' ? 'FLEX YOUR RANK' : shareData?.type === 'profile' ? 'FOND MEMBER' : 'FLEX YOUR SCORE'}
              </div>
              <h1 className="font-display italic text-[2.5rem] leading-none text-foreground">
                {currentTheme.label}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                {currentTheme.description}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={() => handleExport('share')}
                disabled={isExporting}
                className="w-full relative group overflow-hidden rounded-[2rem] bg-primary px-6 py-5 flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                <Share2 className="w-5 h-5 text-white relative z-10" />
                <span className="text-[11px] uppercase tracking-widest font-bold text-white relative z-10">
                  {isExporting ? 'Generating...' : 'Share to Story'}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300 ease-out" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleExport('save')}
                  disabled={isExporting}
                  className="w-full rounded-[2rem] border border-border bg-muted hover:bg-elevated active:bg-elevated/80 px-6 py-5 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:pointer-events-none text-foreground"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Save Image</span>
                </button>

                <button 
                  onClick={handleCopyLink}
                  className="w-full rounded-[2rem] border border-black/10 bg-black/5 hover:bg-black/10 active:bg-black/15 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:active:bg-white/15 px-6 py-5 flex items-center justify-center gap-3 transition-colors text-black dark:text-white"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 pt-8 flex-wrap max-w-[300px] mx-auto">
              {themes.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setThemeIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === themeIndex ? 'w-6 bg-primary' : 'w-2 bg-black/20 dark:bg-white/20'}`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

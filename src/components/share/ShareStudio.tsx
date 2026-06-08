"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Download, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShare } from '../providers/ShareProvider';
import { ShareTemplates, ShareFormat, ShareTemplateTheme } from './ShareTemplates';
import * as htmlToImage from 'html-to-image';
import { useToast } from '../ui/Toast';

const THEMES: { id: ShareTemplateTheme; label: string; description: string }[] = [
  { id: 'luxury', label: 'Hall of Fame', description: 'Show off your global rank and premium status.' },
  { id: 'frosted', label: 'The Brutal Truth', description: 'Share the raw, unfiltered AI verdict about your relationship.' },
  { id: 'romantic', label: 'The Romantic', description: 'A soft, pastel aesthetic with glowing hearts.' },
  { id: 'receipt', label: 'The Receipt', description: 'A quirky, viral itemized receipt of your romance stats.' },
  { id: 'warning', label: 'Warning Label', description: 'A bold hazard warning or green flag certification.' },
  { id: 'imessage', label: 'Text Leak', description: 'Looks just like an iMessage conversation.' },
  { id: 'wrapped', label: 'Wrapped', description: 'The famous end-of-year music aesthetic, but for your love life.' },
  { id: 'trading_card', label: 'Player Card', description: 'A holographic sports trading card to flex your profile stats.' },
  { id: 'aura', label: 'Aura', description: 'Immersive glowing mesh gradient to flex your immaculate vibe.' },
];

export function ShareStudio() {
  const { isOpen, shareData, closeShare } = useShare();
  const { addToast } = useToast();
  const captureRef = useRef<HTMLDivElement>(null);
  
  const [themeIndex, setThemeIndex] = useState(0);
  const currentTheme = THEMES[themeIndex];
  
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
        pixelRatio: 1, // It's already 1080p natively
      });

      if (action === 'save') {
        const link = document.createElement('a');
        link.download = `loveboard-${shareData.type}-${Date.now()}.png`;
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
            title: 'LoveBoard Share',
            text: 'Check this out on Fond!',
          });
        } else {
          // Fallback to save if share API not supported
          const link = document.createElement('a');
          link.download = `loveboard-${shareData.type}-${Date.now()}.png`;
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
    setThemeIndex((prev) => (prev + 1) % THEMES.length);
  };

  const handlePrevTheme = () => {
    setThemeIndex((prev) => (prev - 1 + THEMES.length) % THEMES.length);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 lg:p-12 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative w-full max-w-[1100px] h-full max-h-[850px] bg-white dark:bg-[#120E15] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row border border-black/5 dark:border-white/5">

        {/* Close Button (Top Right) */}
        <button 
          onClick={closeShare}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50 p-3 rounded-full bg-black/5 border border-black/10 text-black/70 hover:text-black hover:bg-black/10 dark:bg-white/5 dark:border-white/10 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: Live Preview Canvas */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-8 bg-black/5 dark:bg-black/20 overflow-hidden">
           <div className="w-full text-center lg:text-left mb-6 lg:mb-8 z-50 shrink-0">
             <h2 className="font-display italic text-[2rem] text-black dark:text-white">Share to Story</h2>
           </div>

           <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
             {/* Navigation Chevrons */}
             <button onClick={handlePrevTheme} className="absolute left-0 lg:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl border border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6] dark:text-white hover:bg-[#3b82f6]/20 transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </button>
             
             <button onClick={handleNextTheme} className="absolute right-0 lg:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl border border-black/10 bg-black/5 text-black hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-colors">
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
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#c2935b]">
                FLEX YOUR SCORE
              </div>
              <h1 className="font-display italic text-[2.5rem] leading-none text-black dark:text-white">
                {currentTheme.label}
              </h1>
              <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed max-w-[280px]">
                Swipe to choose a template. These are perfectly sized (9:16) for Instagram or TikTok stories.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={() => handleExport('share')}
                disabled={isExporting}
                className="w-full relative group overflow-hidden rounded-[2rem] bg-[#E8456B] px-6 py-5 flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                <Share2 className="w-5 h-5 text-white relative z-10" />
                <span className="text-[11px] uppercase tracking-widest font-bold text-white relative z-10">
                  {isExporting ? 'Generating...' : 'Share to Story'}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleExport('save')}
                  disabled={isExporting}
                  className="w-full rounded-[2rem] border border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 px-6 py-5 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:pointer-events-none text-black dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Save Image</span>
                </button>

                <button 
                  onClick={handleCopyLink}
                  className="w-full rounded-[2rem] border border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 px-6 py-5 flex items-center justify-center gap-3 transition-colors text-black dark:text-white"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 pt-8 flex-wrap max-w-[200px] mx-auto">
              {THEMES.map((t, i) => (
                <button 
                  key={t.id} 
                  onClick={() => setThemeIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === themeIndex ? 'w-6 bg-[#E8456B]' : 'w-2 bg-black/20 dark:bg-white/20'}`} 
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

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
  { id: 'receipt', label: 'The Receipt', description: 'A quirky, viral itemized receipt of your romance stats.' },
  { id: 'warning', label: 'Warning Label', description: 'A bold hazard warning or green flag certification.' },
  { id: 'imessage', label: 'Text Leak', description: 'Looks just like an iMessage conversation.' },
  { id: 'wrapped', label: 'Wrapped', description: 'The famous end-of-year music aesthetic, but for your love life.' },
  { id: 'trading_card', label: 'Player Card', description: 'A holographic sports trading card to flex your profile stats.' },
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
      <div className="relative w-full max-w-[1100px] h-full max-h-[850px] bg-[#120E15] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row border border-white/5">
        
        {/* Header (Top Left) */}
        <div className="absolute top-8 left-8 z-50">
          <h2 className="font-display italic text-[2rem] text-white">Share to Story</h2>
        </div>

        {/* Close Button (Top Right) */}
        <button 
          onClick={closeShare}
          className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: Live Preview Canvas */}
        <div className="flex-1 relative flex items-center justify-center p-8 pt-24 lg:pt-8 bg-black/20">
           {/* Navigation Chevrons */}
           <button onClick={handlePrevTheme} className="absolute left-4 lg:left-8 z-20 p-3 rounded-xl border border-[#3b82f6] bg-[#3b82f6]/10 text-white hover:bg-[#3b82f6]/20 transition-colors">
             <ChevronLeft className="w-5 h-5" />
           </button>
           
           <button onClick={handleNextTheme} className="absolute right-4 lg:right-8 z-20 p-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors">
             <ChevronRight className="w-5 h-5" />
           </button>

           <div 
             className="relative w-full max-w-[340px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-500 ease-out overflow-hidden rounded-[2.5rem]"
             style={{ aspectRatio: '9/16' }}
           >
             <ShareTemplates 
               captureRef={captureRef}
               theme={currentTheme.id} 
               content={shareData.content} 
               format={format} 
             />
           </div>
        </div>

        {/* RIGHT PANEL: Controls */}
        <div className="w-full lg:w-[480px] flex flex-col justify-center p-8 lg:p-16 z-10 relative">
          <div className="max-w-md w-full space-y-8">
            
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold">
                Flex Your {shareData.type === 'post' ? 'Story' : shareData.type === 'score' ? 'Score' : 'Rank'}
              </div>
              <h1 className="font-display italic text-[2.5rem] leading-none text-white">
                {currentTheme.label}
              </h1>
              <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
                {currentTheme.description}
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
                  className="w-full rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-5 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white">Save Image</span>
                </button>

                <button 
                  onClick={handleCopyLink}
                  className="w-full rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-5 flex items-center justify-center gap-3 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-white" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 pt-8">
              {THEMES.map((t, i) => (
                <div 
                  key={t.id} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === themeIndex ? 'w-6 bg-[#E8456B]' : 'w-1.5 bg-white/20'}`} 
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

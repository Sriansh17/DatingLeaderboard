"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Download, Copy, Loader2, Check } from 'lucide-react';
import { useShare } from '../providers/ShareProvider';
import { ShareTemplates, ShareFormat, ShareTemplateTheme } from './ShareTemplates';
import * as htmlToImage from 'html-to-image';
import { useToast } from '../ui/Toast';

const THEMES: { id: ShareTemplateTheme; label: string }[] = [
  { id: 'frosted', label: 'Frosted Glass' },
  { id: 'luxury', label: 'Hall of Fame' },
  { id: 'hybrid', label: 'Hybrid' },
];

export function ShareStudio() {
  const { isOpen, shareData, closeShare } = useShare();
  const { addToast } = useToast();
  const captureRef = useRef<HTMLDivElement>(null);
  
  const [format, setFormat] = useState<ShareFormat>('story');
  const [theme, setTheme] = useState<ShareTemplateTheme>('frosted');
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
    navigator.clipboard.writeText('https://loveleaderboard.com'); // TODO: deep linking
    setCopied(true);
    addToast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col lg:flex-row bg-background transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-gold/10 rounded-full blur-[80px]" />
      </div>

      <button 
        onClick={closeShare}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header (Mobile) */}
      <div className="lg:hidden absolute top-6 left-6 z-50">
        <h2 className="font-display italic text-2xl text-white">Share to Story</h2>
      </div>

      {/* LEFT PANEL: Live Preview Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-6 sm:p-12 lg:p-24 h-[60vh] lg:h-full">
         {/* 
            This container forces a specific aspect ratio space for the preview to scale inside of.
            It visually matches a phone screen (9:16) or square (1:1).
         */}
         <div 
           className="relative w-full h-full max-h-[800px] flex items-center justify-center transition-all duration-500 ease-out"
           style={{ aspectRatio: format === 'story' ? '9/16' : '1/1' }}
         >
           <ShareTemplates 
             captureRef={captureRef}
             theme={theme} 
             content={shareData.content} 
             format={format} 
           />
         </div>
      </div>

      {/* RIGHT PANEL: Controls */}
      <div className="w-full lg:w-[480px] flex flex-col justify-end lg:justify-center p-6 sm:p-12 z-10 border-t lg:border-t-0 lg:border-l border-border bg-popover/80 backdrop-blur-3xl h-[40vh] lg:h-full">
        <div className="max-w-md w-full mx-auto space-y-10">
          
          <div className="hidden lg:block space-y-2">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/80">
              Flex Your {shareData.type === 'post' ? 'Story' : shareData.type === 'score' ? 'Score' : 'Rank'}
            </div>
            <h1 className="font-display italic text-[3rem] leading-none text-white">Share</h1>
            <p className="text-sm text-white/50 pt-2 leading-relaxed">
              Swipe to choose a template. These are perfectly sized and rendered in 4K resolution.
            </p>
          </div>

          <div className="space-y-6">
            {/* Format Toggle */}
            <div className="bg-white/5 p-1 rounded-full flex relative overflow-hidden">
              <div 
                className="absolute inset-y-1 bg-white/10 rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ 
                  width: 'calc(50% - 4px)',
                  left: format === 'story' ? '4px' : 'calc(50%)'
                }}
              />
              <button 
                onClick={() => setFormat('story')}
                className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase relative z-10 transition-colors ${format === 'story' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Story (9:16)
              </button>
              <button 
                onClick={() => setFormat('square')}
                className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase relative z-10 transition-colors ${format === 'square' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Square (1:1)
              </button>
            </div>

            {/* Template Scroller */}
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`shrink-0 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                    theme === t.id 
                      ? 'bg-white/10 border-white/30 text-white shadow-xl scale-105' 
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  <span className="text-sm font-bold tracking-wide">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <button
              disabled={isExporting}
              onClick={() => handleExport('share')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-widest uppercase text-xs py-5 rounded-2xl transition-all shadow-[0_0_40px_rgba(232,69,107,0.3)] hover:shadow-[0_0_60px_rgba(232,69,107,0.5)] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              {isExporting ? 'Generating...' : 'Share Directly'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={isExporting}
                onClick={() => handleExport('save')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-[10px] py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-white/70" />
                Save Image
              </button>
              
              <button
                onClick={handleCopyLink}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-[10px] py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-white/70" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

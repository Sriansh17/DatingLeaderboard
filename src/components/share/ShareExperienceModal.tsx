'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loader2, Download, Share2, ChevronLeft, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import html2canvas from 'html2canvas';

import { BrutalTruthTemplate } from './templates/BrutalTruthTemplate';
import { TheRomanticTemplate } from './templates/TheRomanticTemplate';
import { HallOfFameTemplate } from './templates/HallOfFameTemplate';
import { Post } from '@/types/database';

interface ShareExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post;
  profileName: string;
  rank?: number;
  city?: string;
}

const TEMPLATES = [
  { id: 'brutal', name: 'The Brutal Truth', component: BrutalTruthTemplate },
  { id: 'romantic', name: 'The Romantic', component: TheRomanticTemplate },
  { id: 'fame', name: 'Hall of Fame', component: HallOfFameTemplate },
];

export function ShareExperienceModal({ isOpen, onClose, post, profileName, rank, city }: ShareExperienceModalProps) {
  const availableTemplates = post ? TEMPLATES : TEMPLATES.filter(t => t.id === 'fame');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const handleNext = () => setCurrentIndex((i) => (i + 1) % availableTemplates.length);
  const handlePrev = () => setCurrentIndex((i) => (i - 1 + availableTemplates.length) % availableTemplates.length);

  const CurrentTemplate = availableTemplates[currentIndex].component;



  const generateImage = useCallback(async () => {
    if (!templateRef.current) return null;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // High resolution for Instagram
        useCORS: true,
        backgroundColor: null,
      });
      return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    } catch (err) {
      console.error(err);
      addToast('Failed to generate image', 'error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [addToast]);

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fond-story-${availableTemplates[currentIndex].id}.png`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Story saved to your device! 📸', 'success');
  };

  const handleNativeShare = async () => {
    const blob = await generateImage();
    if (!blob) return;
    
    const file = new File([blob], `fond-story-${availableTemplates[currentIndex].id}.png`, { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Fond Story',
          text: 'Check out my latest rating on Fond ✨',
          files: [file]
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      handleDownload();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share to Story" className="max-w-4xl w-full">
      <div className="flex flex-col md:flex-row gap-12 py-6 items-center">
        
        {/* Preview Area */}
        <div className="relative group px-12 flex justify-center">
          {availableTemplates.length > 1 && (
            <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors z-10">
              <ChevronLeft size={32} />
            </button>
          )}
          
          <div className="w-[315px] h-[560px] rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black relative">
            {/* The actual component we capture. We scale it down with CSS to fit in the preview, but html2canvas captures its true physical dimensions (540x960) */}
            <div className="absolute top-0 left-0 w-[540px] h-[960px] origin-top-left scale-[0.5833]" ref={templateRef}>
              <CurrentTemplate post={post} profileName={profileName} rank={rank} city={city} />
            </div>
            
            {/* Loading Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-foreground text-sm font-bold uppercase tracking-widest">Rendering...</p>
              </div>
            )}
          </div>

          {availableTemplates.length > 1 && (
            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors z-10">
              <ChevronRight size={32} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col flex-1 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-2">Flex your score</p>
            <h3 className="text-foreground font-display text-4xl italic mb-2">{availableTemplates[currentIndex].name}</h3>
            <p className="text-muted-foreground text-sm">Swipe to choose a template. These are perfectly sized (9:16) for Instagram or TikTok stories.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleNativeShare} disabled={isGenerating} className="w-full py-6 rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform shadow-[var(--shadow-glow)] bg-primary text-primary-foreground border-none">
              <Share2 className="w-5 h-5 mr-3" />
              Share to Story
            </Button>
            
            <div className="flex gap-3">
              <Button onClick={handleDownload} disabled={isGenerating} variant="outline" className="flex-1 py-6 rounded-full border-border text-foreground hover:bg-muted font-bold uppercase tracking-widest text-[10px]">
                <Download className="w-4 h-4 mr-2" />
                Save Image
              </Button>

              <Button onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }} disabled={isGenerating} variant="outline" className="flex-1 py-6 rounded-full border-border text-foreground hover:bg-muted font-bold uppercase tracking-widest text-[10px]">
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
          
          {availableTemplates.length > 1 && (
            <div className="flex justify-center gap-2 mt-auto">
              {availableTemplates.map((t, i) => (
                <button 
                  key={t.id} 
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-primary w-6' : 'bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { ShareContent } from '../providers/ShareProvider';
import { ScoreRing } from '../ui/ScoreRing';
import { LoveCode } from './LoveCode';

export type ShareFormat = 'story' | 'square';
export type ShareTemplateTheme = 'frosted' | 'luxury' | 'hybrid' | 'midnight' | 'minimal';

interface TemplateProps {
  content: ShareContent;
  format: ShareFormat;
}

// ============================================================================
// 1. FROSTED GLASS TEMPLATE
// ============================================================================
function FrostedTemplate({ content, format }: TemplateProps) {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-card to-background`}>
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-gold/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Content Card */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 z-10 w-full h-full">
        <div className="rounded-[2.5rem] border border-border bg-foreground/5 backdrop-blur-3xl p-10 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[60%]">
          
          <header className="flex items-start justify-between gap-4 relative z-10 w-full">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-5 py-2 shadow-inner backdrop-blur-md">
                <span className="text-foreground font-bold text-lg">{content.username}</span>
                {content.partnerName && (
                  <>
                    <span className="text-muted-foreground text-sm">with</span>
                    <span className="text-foreground font-bold text-lg">{content.partnerName}</span>
                  </>
                )}
              </div>
            </div>
            {content.score !== undefined && (
              <div className="flex-shrink-0 relative scale-110 origin-top-right">
                <ScoreRing score={content.score} size={80} />
              </div>
            )}
          </header>

          <div className="flex flex-col justify-center py-12 relative z-10">
            {content.headline && (
              <h3 className="font-display italic text-[3rem] sm:text-[4rem] leading-[1.1] text-foreground/95">
                "{content.headline}"
              </h3>
            )}
            {content.verdict && (
              <div className="mt-12">
                <span className="font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground block mb-3">AI Verdict</span>
                <p className="text-xl text-foreground/80 leading-relaxed font-sans font-light">
                  {content.verdict}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Code */}
      <div className="p-8 sm:p-12 z-10 flex justify-center w-full">
        <LoveCode username={content.username} theme="glass" />
      </div>
    </div>
  );
}

// ============================================================================
// 2. LUXURY PAPER TEMPLATE
// ============================================================================
function LuxuryTemplate({ content, format }: TemplateProps) {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-background border-[16px] border-card`}>
      {content.score !== undefined && content.score >= 90 && (
        <div className="absolute top-12 right-12 text-gold font-display italic text-2xl opacity-60">Hall of Fame</div>
      )}

      <div className="flex-1 flex flex-col justify-center p-12 z-10">
        <header className="flex flex-col gap-2 relative z-10 w-full mb-16">
          <div className="text-[12px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
            Official Rating
          </div>
          <div className="flex items-center gap-3">
            <span className="text-foreground font-bold tracking-tight text-3xl">{content.username}</span>
            {content.partnerName && (
              <>
                <span className="text-muted-foreground text-2xl">×</span>
                <span className="text-foreground/80 font-medium text-3xl">{content.partnerName}</span>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center py-8 relative z-10">
          {content.score !== undefined ? (
             <div className="mb-12">
               <span className="font-score text-[8rem] leading-none text-gradient-gold block">{content.score}</span>
             </div>
          ) : content.headline ? (
            <h3 className="font-display text-[4rem] leading-[1.05] text-foreground mb-12">
              "{content.headline}"
            </h3>
          ) : null}
          
          <div className="w-full h-px bg-border my-8" />
          
          {content.verdict && (
            <div>
              <p className="text-2xl text-foreground/80 leading-relaxed font-display italic">
                {content.verdict}
              </p>
            </div>
          )}
          
          <div className="w-full h-px bg-border mt-12" />
        </div>
      </div>

      <div className="p-12 z-10 flex justify-between items-end w-full">
         <LoveCode username={content.username} theme="gold" />
      </div>
    </div>
  );
}

// ============================================================================
// 3. HYBRID TEMPLATE
// ============================================================================
function HybridTemplate({ content, format }: TemplateProps) {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-card`}>
      <div className="absolute top-0 right-12 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-b-xl shadow-lg z-20">
        FOND
      </div>

      <div className="flex-1 flex flex-col p-12 z-10 mt-12">
        <header className="flex items-start justify-between gap-4 relative z-10 w-full mb-16">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-bold tracking-tight text-2xl">{content.username}</span>
              {content.partnerName && (
                <>
                  <span className="text-muted-foreground text-xl">×</span>
                  <span className="text-foreground/80 font-medium text-2xl">{content.partnerName}</span>
                </>
              )}
            </div>
            {content.city && (
              <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-muted-foreground mt-2">
                {content.city}
              </div>
            )}
          </div>
          
          {content.score !== undefined && (
            <div className="flex-shrink-0 relative scale-[1.2] origin-top-right">
              <ScoreRing score={content.score} size={80} />
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          {content.headline && (
            <h3 className="font-display italic text-[3.5rem] leading-[1.1] text-foreground">
              "{content.headline}"
            </h3>
          )}
          {content.verdict && (
            <div className="mt-12">
              <span className="font-bold uppercase tracking-[0.2em] text-[10px] text-primary block mb-3">AI Verdict</span>
              <p className="text-xl text-foreground/80 leading-relaxed font-sans font-medium">
                {content.verdict}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-12 z-10 flex justify-center w-full bg-muted border-t border-border">
        <LoveCode username={content.username} theme="light" />
      </div>
    </div>
  );
}

// ============================================================================
// 4. MIDNIGHT TEMPLATE
// ============================================================================
function MidnightTemplate({ content, format }: TemplateProps) {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-background`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>
      
      <div className="flex-1 flex flex-col p-12 z-10 mt-12 justify-between">
        <header className="flex flex-col gap-2 relative z-10 w-full">
          <div className="flex items-center gap-3">
            <span className="text-foreground font-bold tracking-tight text-3xl">{content.username}</span>
            {content.partnerName && (
              <>
                <span className="text-muted-foreground text-2xl">and</span>
                <span className="text-foreground/80 font-medium text-3xl">{content.partnerName}</span>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center py-12 relative z-10 text-center items-center">
          {content.score !== undefined && (
             <div className="mb-12 relative">
               <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
               <span className="font-score text-[10rem] leading-none text-foreground block relative z-10">{content.score}</span>
             </div>
          )}
          {content.headline && (
            <h3 className="font-display italic text-[3rem] leading-[1.1] text-foreground/90">
              "{content.headline}"
            </h3>
          )}
        </div>
      </div>

      <div className="p-12 z-10 flex justify-center w-full border-t border-border bg-foreground/5 backdrop-blur-md">
        <LoveCode username={content.username} theme="glass" />
      </div>
    </div>
  );
}

// ============================================================================
// 5. MINIMAL TEMPLATE
// ============================================================================
function MinimalTemplate({ content, format }: TemplateProps) {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-card border border-border`}>
      <div className="flex-1 flex flex-col justify-center p-12 z-10">
        <div className="w-full flex justify-between items-start mb-16">
          <div className="text-sm uppercase tracking-[0.3em] font-bold text-muted-foreground">
            {content.city || 'Fond'}
          </div>
          {content.score !== undefined && (
             <div className="font-score text-4xl text-primary">{content.score}</div>
          )}
        </div>
        
        {content.headline && (
          <h3 className="font-sans font-medium text-[3rem] leading-[1.1] text-foreground mb-8">
            "{content.headline}"
          </h3>
        )}
        
        {content.verdict && (
          <p className="text-xl text-foreground/60 leading-relaxed font-sans font-light">
            {content.verdict}
          </p>
        )}
      </div>

      <div className="p-12 z-10 flex justify-between items-center w-full mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-bold text-xl">{content.username}</span>
          {content.partnerName && (
            <>
              <span className="text-muted-foreground px-2">×</span>
              <span className="text-foreground/80 font-medium text-xl">{content.partnerName}</span>
            </>
          )}
        </div>
        <LoveCode username={content.username} theme="light" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT CONTROLLER
// ============================================================================
interface ShareTemplatesProps {
  theme: ShareTemplateTheme;
  content: ShareContent;
  format: ShareFormat;
  // Allows us to attach a ref to the container for html-to-image to capture
  captureRef?: React.RefObject<HTMLDivElement>;
}

export function ShareTemplates({ theme, content, format, captureRef }: ShareTemplatesProps) {
  // Dimensions for export rendering. We enforce these so the output is perfect.
  const dimensions = format === 'story' 
    ? { width: 1080, height: 1920 } 
    : { width: 1080, height: 1080 };

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleX = width / dimensions.width;
      const scaleY = height / dimensions.height;
      setScale(Math.min(scaleX, scaleY));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [dimensions.width, dimensions.height]);

  // To preview cleanly in the UI, we scale down the exact dimensions using JS
  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full bg-black/20 overflow-hidden rounded-[2rem] border border-white/5"
    >
      <div 
        className="absolute left-1/2 top-1/2"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div 
          ref={captureRef}
          className="w-full h-full bg-background overflow-hidden shadow-2xl relative"
        >
          {theme === 'frosted' && <FrostedTemplate content={content} format={format} />}
          {theme === 'luxury' && <LuxuryTemplate content={content} format={format} />}
          {theme === 'hybrid' && <HybridTemplate content={content} format={format} />}
          {theme === 'midnight' && <MidnightTemplate content={content} format={format} />}
          {theme === 'minimal' && <MinimalTemplate content={content} format={format} />}
        </div>
      </div>
    </div>
  );
}

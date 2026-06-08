import React, { useEffect, useRef, useState } from 'react';
import { ShareContent } from '../providers/ShareProvider';
import { ScoreRing } from '../ui/ScoreRing';
import { LoveCode } from './LoveCode';
import { Trophy, User, Sparkles } from 'lucide-react';

export type ShareFormat = 'story' | 'square';
export type ShareTemplateTheme = 'frosted' | 'luxury' | 'receipt' | 'warning' | 'imessage' | 'wrapped' | 'trading_card' | 'aura' | 'romantic';

interface TemplateProps {
  content: ShareContent;
  format: ShareFormat;
}

// ============================================================================
// 1. HALL OF FAME TEMPLATE
// ============================================================================
function LuxuryTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0a0a08] p-10 sm:p-12">
      {/* Subtle Gold Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />
      <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Left Label */}
      <div className="flex items-center gap-3 relative z-10 mt-4 mb-16">
        <span className="text-[1.25rem]">🏆</span>
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-gold">Hall of Fame</span>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-start relative z-10 w-full">
        <h3 className="font-display italic text-[2.75rem] sm:text-[3.25rem] leading-[1.15] text-white/95 text-left w-full max-w-[90%]">
          {content.headline ? (
            content.headline.replace(/(#\d+)/, '\n$1').split('\n').map((line, i) => {
              const parts = line.split(/(#\d+)/g);
              return (
                <React.Fragment key={i}>
                  {parts.map((part, j) => 
                    part.match(/^#\d+$/) ? <span key={j} className="text-gold">{part}</span> : part
                  )}
                  <br/>
                </React.Fragment>
              );
            })
          ) : (
            <>Officially ranked<br/><span className="text-gold">#{content.rank || content.score || '?'}</span> in {content.city || 'the world'}</>
          )}
        </h3>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-center w-full relative z-10 mb-2 mt-auto">
        <LoveCode username={content.username} theme="dark" />
      </div>
    </div>
  );
}

// ============================================================================
// THE ROMANTIC TEMPLATE
// ============================================================================
function RomanticTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#fff0f5] p-10 sm:p-12">
      {/* Soft Pastel Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-pink-300/30 to-transparent pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-rose-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Left Label */}
      <div className="flex items-center gap-2 relative z-10 mt-2">
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-rose-500">The Romantic</span>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full text-center mt-8">
        <h3 className="font-display italic text-[3rem] sm:text-[3.5rem] leading-[1.1] text-rose-950">
          "{content.headline || content.verdict || 'True Romance'}"
        </h3>
        {content.partnerName && (
          <div className="mt-6 text-sm uppercase tracking-[0.2em] font-bold text-rose-800/60">
            WITH {content.partnerName}
          </div>
        )}
        <div className="mt-8 px-6 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white inline-flex items-baseline">
          <span className="font-score text-6xl text-rose-500 leading-none tracking-tighter">{content.score || '100'}</span>
          <span className="text-xl font-bold ml-1 text-rose-400/80">/100</span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-center w-full relative z-10 mb-2 mt-auto">
        <LoveCode username={content.username} theme="light" />
      </div>
    </div>
  );
}

// ============================================================================
// 2. THE BRUTAL TRUTH TEMPLATE
// ============================================================================
function FrostedTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0c0808] p-10 sm:p-12">
      {/* Deep Red Atmosphere - Top Left and Bottom Left */}
      <div className="absolute -top-[20%] -left-[10%] w-[100%] aspect-square rounded-full bg-[#E8456B] opacity-[0.18] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[100%] aspect-square rounded-full bg-[#E8456B] opacity-[0.15] blur-[120px] pointer-events-none" />

      {/* Top Left Label */}
      <div className="flex items-center gap-2 relative z-10 mt-4 mb-8">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#E8456B]">The Brutal Truth</span>
      </div>

      {/* Quote Content */}
      <div className="flex flex-col justify-start relative z-10 w-full flex-1">
        <h3 className="font-display italic text-[2.75rem] sm:text-[3.25rem] leading-[1.1] text-white/95 mb-6">
          "{content.verdict || content.headline || 'No verdict available'}"
        </h3>

        {content.partnerName && (
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-auto">
            REGARDING <span className="text-white flex items-center gap-1.5 ml-1"><User className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6]" /> {content.partnerName}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-6 mt-12 w-full">
          <div className="flex items-baseline text-[#E8456B] ml-6">
            <span className="font-score text-[7.5rem] sm:text-[9rem] font-bold leading-[0.8] tracking-tighter">{content.score || '0'}</span>
            <span className="text-2xl sm:text-3xl font-bold ml-1 opacity-60">/100</span>
          </div>
          <div className="px-5 py-2 rounded-full border border-[#E8456B]/50 text-[#E8456B] text-[9.5px] font-bold uppercase tracking-[0.25em]">
            FINAL VERDICT
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-center w-full relative z-10 mb-2 mt-12">
        <LoveCode username={content.username} theme="dark" />
      </div>
    </div>
  );
}

// ============================================================================
// 3. THE RECEIPT TEMPLATE
// ============================================================================
function ReceiptTemplate({ content, format }: TemplateProps) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-[#f4f4f0] p-8 text-black font-mono overflow-hidden">
      {/* Receipt Paper Jagged Edge Effect at top/bottom could be added with SVG or CSS, but simple is fine for now */}
      
      <div className="w-full flex-1 flex flex-col border border-black/10 p-6 bg-white shadow-sm relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-widest uppercase mb-2">FOND OFFICIAL</h2>
          <p className="text-xs text-black/60">*** CUSTOMER COPY ***</p>
          <p className="text-xs text-black/60 mt-1">{date} {time}</p>
          <p className="text-xs text-black/60 mt-1">SERVED BY: AI REFEREE</p>
        </div>

        <div className="w-full border-t-2 border-dashed border-black/30 my-4" />

        <div className="flex justify-between items-center text-sm font-bold mb-4">
          <span>ITEM</span>
          <span>AMOUNT</span>
        </div>

        {/* Dynamic Items */}
        <div className="space-y-4 text-sm flex-1">
          <div className="flex justify-between">
            <span>ROMANCE</span>
            <span>{content.score ? Math.min(100, content.score + 15) : '85'}.00</span>
          </div>
          <div className="flex justify-between">
            <span>EFFORT</span>
            <span>{content.score ? Math.max(0, content.score - 10) : '45'}.00</span>
          </div>
          <div className="flex justify-between text-black/60">
            <span>RED FLAGS (TAX)</span>
            <span>3</span>
          </div>
          
          <div className="mt-6">
            <p className="text-xs font-bold mb-1">NOTES:</p>
            <p className="text-xs leading-relaxed uppercase">"{content.verdict || content.headline}"</p>
          </div>
        </div>

        <div className="w-full border-t-2 border-dashed border-black/30 my-4" />

        {/* Total */}
        <div className="flex justify-between items-end mb-8">
          <span className="text-lg font-bold">TOTAL SCORE</span>
          <span className="text-4xl font-bold">{content.score || '0'}/100</span>
        </div>

        {/* Footer Barcode */}
        <div className="flex flex-col items-center justify-center opacity-80 mt-auto">
          {/* Simple CSS Barcode */}
          <div className="flex h-12 w-full gap-[2px] justify-center mb-2">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="bg-black" style={{ width: `${Math.random() * 4 + 1}px` }} />
            ))}
          </div>
          <p className="text-[10px] tracking-widest uppercase font-bold mt-2">@{content.username}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. HAZARD WARNING TEMPLATE
// ============================================================================
function WarningTemplate({ content, format }: TemplateProps) {
  const isGood = (content.score || 0) >= 70;
  const mainColor = isGood ? '#22c55e' : '#facc15';
  const bgColor = isGood ? '#052e16' : '#422006';
  
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden p-6" style={{ backgroundColor: bgColor }}>
      {/* Hazard Stripes Border */}
      <div className="absolute inset-0 border-[16px] pointer-events-none z-20" 
           style={{ 
             borderImage: `repeating-linear-gradient(45deg, ${mainColor}, ${mainColor} 20px, #000 20px, #000 40px) 16`
           }} 
      />
      
      <div className="flex-1 border-4 border-black bg-[#111] p-8 flex flex-col justify-center relative z-10">
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <div className="px-6 py-2 bg-black border-2" style={{ borderColor: mainColor }}>
            <span className="text-xl font-black tracking-widest uppercase" style={{ color: mainColor }}>
              {isGood ? 'CERTIFIED' : 'WARNING'}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center mt-12">
          <h3 className="font-black text-3xl sm:text-4xl leading-[1.1] uppercase text-white mb-6">
            "{content.headline}"
          </h3>
          <p className="text-lg font-bold text-white/70 uppercase">
            {content.verdict}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center border-t-2 border-dashed pt-6" style={{ borderColor: `${mainColor}40` }}>
          <span className="text-sm font-bold text-white/50 mb-2 uppercase tracking-widest">Severity Level</span>
          <span className="font-score text-7xl leading-none" style={{ color: mainColor }}>{content.score || '0'}</span>
        </div>
        
        <div className="mt-8 flex justify-center w-full">
          <LoveCode username={content.username} theme="dark" className="!bg-black/50" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. IMESSAGE LEAK TEMPLATE
// ============================================================================
function IMessageTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-black p-6">
      {/* Mock Header */}
      <div className="flex flex-col items-center pt-8 pb-4 border-b border-white/10 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
           <User className="w-6 h-6 text-white/50" />
        </div>
        <span className="text-white font-semibold text-sm">Bestie 💅</span>
        <span className="text-white/40 text-[10px]">iMessage</span>
      </div>

      <div className="flex-1 flex flex-col justify-end gap-6 pb-12 relative z-10 w-full px-2">
        {/* Incoming */}
        <div className="flex flex-col items-start max-w-[85%]">
          <div className="bg-[#262628] text-white px-5 py-3 rounded-2xl rounded-bl-sm text-lg shadow-sm">
            So... how did the date with {content.partnerName || 'them'} actually go? ☕️
          </div>
        </div>

        {/* Outgoing */}
        <div className="flex flex-col items-end self-end max-w-[85%] mt-4">
          <div className="bg-[#007AFF] text-white px-5 py-3 rounded-2xl rounded-br-sm text-lg shadow-sm">
            {content.verdict || content.headline}
          </div>
          <span className="text-[10px] text-white/40 mt-1 font-medium px-2">
            Read • Score: {content.score || '0'}/100
          </span>
        </div>
      </div>

      <div className="flex justify-center w-full relative z-10 mt-auto pb-4">
        <LoveCode username={content.username} theme="glass" />
      </div>
    </div>
  );
}

// ============================================================================
// 6. SPOTIFY WRAPPED TEMPLATE
// ============================================================================
function WrappedTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#8A2BE2] p-8">
      {/* Vibrant Gradient Mesh */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#FF69B4] rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-30%] w-[90%] h-[90%] bg-[#FF4500] rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <span className="text-white font-black text-2xl tracking-tighter mb-12">2026 Wrapped</span>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-white/80 font-bold text-lg mb-2 uppercase tracking-widest">Top Genre</p>
          <h2 className="text-white font-black text-[3.5rem] leading-[1] tracking-tighter mb-12">
            Mixed Signals
          </h2>

          <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center self-center shadow-2xl mb-12">
            <span className="text-white/60 font-bold text-sm uppercase tracking-widest mb-1">Vibe Match</span>
            <span className="font-score text-7xl text-white leading-none">{content.score || '0'}</span>
          </div>

          <p className="text-white font-bold text-2xl leading-snug text-center px-4">
            "{content.headline}"
          </p>
        </div>

        <div className="flex justify-center w-full mt-auto">
           <LoveCode username={content.username} theme="glass" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. TRADING CARD TEMPLATE (RANK/PROFILE)
// ============================================================================
function TradingCardTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#111] p-6 perspective-[1000px]">
      <div className="w-full h-full rounded-[2rem] border-[8px] border-[#c0c0c0] bg-gradient-to-br from-[#222] to-[#0a0a0a] relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
        
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_20%,rgba(255,255,255,0.4)_30%,transparent_40%,rgba(255,255,255,0.2)_50%,transparent_60%)] mix-blend-color-dodge opacity-60 pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-20" />

        <div className="bg-[#c0c0c0] text-black font-black text-center py-2 text-xl tracking-[0.3em] uppercase z-10 border-b-4 border-[#888]">
          FOND OFFICIAL
        </div>

        <div className="flex-1 flex flex-col p-6 z-10 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="text-[#c0c0c0] font-bold text-[10px] tracking-widest uppercase">Player Name</span>
              <span className="text-white font-black text-3xl tracking-tight uppercase">@{content.username}</span>
            </div>
            {/* Mock Rank Badge */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-yellow-600 border-2 border-white flex items-center justify-center shadow-lg">
              <span className="text-black font-score text-3xl leading-none">#{content.score || '23'}</span>
            </div>
          </div>

          <div className="w-full aspect-square bg-black/50 border border-white/20 rounded-xl mb-6 flex items-center justify-center overflow-hidden relative">
             <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
             <User className="w-32 h-32 text-white/20" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-auto">
            <div className="bg-black/40 border border-white/10 p-3 rounded-lg text-center">
              <div className="text-[#c0c0c0] text-[9px] font-bold uppercase tracking-widest mb-1">AVG SCORE</div>
              <div className="text-white font-score text-2xl">88.5</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-3 rounded-lg text-center">
              <div className="text-[#c0c0c0] text-[9px] font-bold uppercase tracking-widest mb-1">STREAK</div>
              <div className="text-white font-score text-2xl">14 🔥</div>
            </div>
          </div>

          <div className="text-center mt-6 border-t border-white/20 pt-4">
             <span className="text-white/50 text-[8px] font-bold tracking-widest uppercase">1st Edition • Mint Condition</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. AURA TEMPLATE
// ============================================================================
function AuraTemplate({ content, format }: TemplateProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#120E15] p-10 sm:p-12">
      {/* Immersive Glowing Background (Mesh Gradient) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        <div className="absolute -top-[10%] -left-[10%] w-[120%] aspect-square rounded-full bg-primary opacity-30 mix-blend-screen blur-[100px] animate-pulse-glow" />
        <div className="absolute top-[20%] -right-[20%] w-[100%] aspect-square rounded-full bg-gold opacity-20 mix-blend-screen blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[10%] w-[140%] aspect-square rounded-full bg-primary opacity-20 mix-blend-screen blur-[140px]" />
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full text-center">
        <Sparkles className="w-12 h-12 text-gold mb-8 animate-pulse-glow" />
        <h3 className="font-display italic text-[3.5rem] leading-[1.1] text-white">
          {content.headline?.split('\n').map((line, i) => (
            <React.Fragment key={i}>{line}<br/></React.Fragment>
          )) || (
            <>My dating vibe is<br/><span className="text-gold">immaculate</span></>
          )}
        </h3>
        {content.score && (
          <div className="mt-12 px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
            <span className="text-sm uppercase tracking-widest text-white/70 font-bold">Vibe Score: {content.score}/100</span>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-center w-full relative z-10 mb-2">
        <LoveCode username={content.username} theme="glass" />
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
          {(() => {
            switch (theme) {
              case 'luxury':
                return <LuxuryTemplate content={content} format={format} />;
              case 'frosted':
                return <FrostedTemplate content={content} format={format} />;
              case 'receipt':
                return <ReceiptTemplate content={content} format={format} />;
              case 'warning':
                return <WarningTemplate content={content} format={format} />;
              case 'imessage':
                return <IMessageTemplate content={content} format={format} />;
              case 'wrapped':
                return <WrappedTemplate content={content} format={format} />;
              case 'trading_card':
                return <TradingCardTemplate content={content} format={format} />;
              case 'aura':
                return <AuraTemplate content={content} format={format} />;
              case 'romantic':
                return <RomanticTemplate content={content} format={format} />;
              default:
                return <LuxuryTemplate content={content} format={format} />;
            }
          })()}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Heart } from 'lucide-react';

interface LoveCodeProps {
  username: string;
  theme?: 'dark' | 'light' | 'gold' | 'glass';
  className?: string;
}

export function LoveCode({ username, theme = 'dark', className = '' }: LoveCodeProps) {
  // Simulating a Spotify-style barcode pattern
  const bars = [
    40, 60, 30, 80, 50, 90, 40, 70, 30, 60, 40, 80, 50, 30, 70, 40, 60, 30, 80, 50, 40, 70
  ];

  const themeClasses = {
    dark: 'bg-black/80 text-white border-white/10',
    light: 'bg-white/90 text-black border-black/10',
    gold: 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-gold/30 text-gold shadow-[0_0_15px_rgba(217,119,6,0.2)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 text-white shadow-xl',
  };

  const getBarColor = () => {
    switch (theme) {
      case 'dark': return 'fill-white/90';
      case 'light': return 'fill-black/80';
      case 'gold': return 'fill-gold';
      case 'glass': return 'fill-white/90';
      default: return 'fill-white';
    }
  };

  return (
    <div className={`flex items-center gap-4 px-4 py-2.5 rounded-full border ${themeClasses[theme]} ${className}`}>
      {/* App Logo Indicator */}
      <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full ${theme === 'light' ? 'bg-[#E8456B]' : 'bg-[#E8456B]'}`}>
        <Heart className="w-4 h-4 text-white fill-white" />
      </div>

      {/* The "LoveCode" Barcode */}
      <div className="flex flex-col justify-center h-8">
        <svg width="120" height="24" viewBox="0 0 120 24" className="overflow-visible">
          {bars.map((height, i) => (
            <rect
              key={i}
              x={i * 5.5}
              y={12 - (height / 100) * 12}
              width="3"
              height={(height / 100) * 24}
              rx="1.5"
              className={`${getBarColor()} transition-all`}
            />
          ))}
        </svg>
      </div>

      {/* Username / Deep Link Indication */}
      <div className="flex flex-col justify-center min-w-[80px]">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-50 mb-0.5 leading-none">
          LoveBoard
        </span>
        <span className="text-[11px] font-bold tracking-wide truncate max-w-[100px] leading-none">
          {username}
        </span>
      </div>
    </div>
  );
}

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoveCodeProps {
  username: string;
  theme?: 'dark' | 'light' | 'gold';
  className?: string;
}

export function LoveCode({ username, theme = 'dark', className = '' }: LoveCodeProps) {
  const bg = theme === 'gold'
    ? 'bg-gold/10 border border-gold/20 text-gold'
    : theme === 'light'
      ? 'bg-white/60 border border-black/5 text-foreground'
      : 'bg-black/30 border border-white/10 text-white';

  const dotColor = theme === 'gold' ? 'bg-gold' : 'bg-primary';

  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${bg} backdrop-blur-xl shadow-lg ${className}`}>
      {/* Fond icon + brand */}
      <Sparkles className={`h-3.5 w-3.5 shrink-0 ${theme === 'gold' ? 'text-gold' : theme === 'light' ? 'text-primary' : 'text-gold'}`} />
      <span className="text-[11px] font-bold tracking-[0.15em] uppercase shrink-0">FOND</span>

      {/* Divider dot */}
      <span className={`w-1 h-1 rounded-full shrink-0 ${theme === 'light' ? 'bg-foreground/20' : 'bg-white/20'}`} />

      {/* Username */}
      <span className={`text-[11px] font-medium tracking-wide truncate ${theme === 'light' ? 'text-muted-foreground' : 'text-white/50'}`}>
        @{username.replace('@', '')}
      </span>
    </div>
  );
}

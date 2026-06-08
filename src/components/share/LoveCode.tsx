import React from 'react';
import { QrCode } from 'lucide-react';

interface LoveCodeProps {
  username: string;
  theme?: 'dark' | 'light' | 'gold' | 'glass';
  className?: string;
}

export function LoveCode({ username, theme = 'dark', className = '' }: LoveCodeProps) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-[20px] bg-black/90 border border-white/10 backdrop-blur-xl shadow-2xl ${className}`}>
      {/* Pink QR Code Circle */}
      <div className="w-8 h-8 rounded-full bg-[#E8456B] flex items-center justify-center p-1.5 shrink-0">
         <QrCode className="w-full h-full text-white" strokeWidth={2.5} />
      </div>

      {/* Audio Bars */}
      <div className="flex items-end gap-[2.5px] h-4 shrink-0">
        {[60, 80, 40, 100, 50, 70].map((h, i) => (
          <div key={i} className="w-[2.5px] bg-[#E8456B] rounded-full" style={{ height: `${h}%` }} />
        ))}
      </div>

      {/* Text */}
      <div className="flex items-center gap-1.5 pl-1 pr-3 shrink-0">
         <span className="text-[11px] font-bold text-white tracking-widest uppercase">FOND ✨</span>
         <span className="text-[11px] font-bold text-white/40 tracking-wider uppercase">@{username}</span>
      </div>
    </div>
  );
}

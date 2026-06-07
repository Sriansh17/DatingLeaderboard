import { QRCodeSVG } from 'qrcode.react';

interface FondTagProps {
  url: string;
  username: string;
}

export function FondTag({ url, username }: FondTagProps) {
  return (
    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full py-3 px-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      {/* Left Side: The Actual Scannable QR Code */}
      <div className="bg-white p-1.5 rounded-full flex-shrink-0 relative">
        <QRCodeSVG 
          value={url} 
          size={48} 
          bgColor="transparent"
          fgColor="#E92B54" 
          level="L"
          includeMargin={false}
        />
        {/* Tiny white cutout in the center for the logo */}
        <div className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <span className="text-[10px]">✨</span>
        </div>
      </div>

      {/* Right Side: The Aesthetic EKG Wave & Username */}
      <div className="flex flex-col pr-4">
        <div className="flex items-center gap-1.5 opacity-80 h-4">
          {/* Faux EKG/Soundwave bars */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-[#E92B54] rounded-full"
              style={{
                height: `${Math.max(4, Math.sin(i * 0.8) * 16 + 8)}px`,
                opacity: 0.5 + (Math.sin(i * 0.5) * 0.5)
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white font-bold text-xs uppercase tracking-widest">FOND ✨</span>
          <span className="text-white/40 text-[10px] uppercase tracking-widest">@{username}</span>
        </div>
      </div>
    </div>
  );
}

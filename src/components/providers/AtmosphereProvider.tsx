'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export type Atmosphere = 'soft-blush' | 'mesh-rose' | 'vignette-rose' | 'prismatic-rose' | 'aura' | 'minimal';

interface AtmosphereContextType {
  atmosphere: Atmosphere;
  setAtmosphere: (atm: Atmosphere) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (val: boolean) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType>({
  atmosphere: 'soft-blush',
  setAtmosphere: () => {},
  particlesEnabled: true,
  setParticlesEnabled: () => {},
});

export function useAtmosphere() {
  return useContext(AtmosphereContext);
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('soft-blush');
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const getBackgroundStyles = () => {
    const isDark = resolvedTheme === 'dark';
    const currentAtmosphere = pathname === '/contact' ? 'aura' : atmosphere;

    switch (currentAtmosphere) {
      case 'soft-blush':
        return (
          <>
            <div className={`absolute top-0 bottom-0 w-[40vw] pointer-events-none blur-[100px] ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`} />
            <div className={`absolute bottom-0 right-1/4 w-[60vw] h-[60vh] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-primary/10' : 'bg-primary/20'}`} />
          </>
        );
      case 'mesh-rose':
        return (
          <>
            <div className={`absolute top-0 left-0 w-[60vw] h-[60vh] rounded-full blur-[140px] pointer-events-none ${isDark ? 'bg-primary/15' : 'bg-primary/20'}`} />
            <div className={`absolute bottom-0 right-0 w-[70vw] h-[70vh] rounded-full blur-[140px] pointer-events-none ${isDark ? 'bg-gold/15' : 'bg-gold/20'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-primary/20' : 'bg-rose-300/30'}`} />
          </>
        );
      case 'vignette-rose':
        return (
          <>
            <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full blur-[140px] pointer-events-none ${isDark ? 'bg-primary/25' : 'bg-primary/30'}`} />
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[100px] pointer-events-none" />
          </>
        );
      case 'prismatic-rose':
        return (
          <>
            <div
              className="absolute inset-0 pointer-events-none opacity-100 blur-[100px]"
              style={{
                backgroundImage: `conic-gradient(from 180deg at 50% 50%,
                  ${isDark ? 'rgba(230,76,117,0.2)' : 'rgba(209,47,88,0.3)'} 0deg,
                  ${isDark ? 'rgba(199,169,107,0.15)' : 'rgba(199,169,107,0.2)'} 120deg,
                  ${isDark ? 'rgba(180,50,90,0.2)' : 'rgba(255,180,200,0.4)'} 240deg,
                  ${isDark ? 'rgba(230,76,117,0.2)' : 'rgba(209,47,88,0.3)'} 360deg)`
              }}
            />
          </>
        );
      case 'aura':
        return (
          <>
            <motion.div
              animate={{ x: [0, 40, -20, 0], y: [0, -40, 30, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-primary/20 mix-blend-screen' : 'bg-primary/30 mix-blend-multiply'}`}
            />
            <motion.div
              animate={{ x: [0, -30, 40, 0], y: [0, 30, -40, 0] }}
              transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-gold/10 mix-blend-screen' : 'bg-gold/20 mix-blend-multiply'}`}
            />
            <motion.div
              animate={{ x: [0, 20, -40, 0], y: [0, 40, -20, 0] }}
              transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full blur-[140px] pointer-events-none ${isDark ? 'bg-primary/10 mix-blend-screen' : 'bg-primary/20 mix-blend-multiply'}`}
            />
          </>
        );
      case 'minimal':
        return null;
    }
  };

  return (
    <AtmosphereContext.Provider value={{ atmosphere, setAtmosphere, particlesEnabled, setParticlesEnabled }}>
      {/* Background orbs — fixed to viewport, always in view */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {getBackgroundStyles()}
        {particlesEnabled && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(45)].map((_, i) => {
              // Sharp vs blurred mix: ~40% sharp, ~35% soft blur, ~25% dreamy blur
              const blurRoll = Math.random();
              const blurAmount = blurRoll < 0.4 ? 0 : blurRoll < 0.75 ? 0.5 + Math.random() * 1.0 : 2.0 + Math.random() * 3.0;

              // Sharp particles are slightly larger and brighter
              const isSharp = blurAmount === 0;
              const size = isSharp ? Math.random() * 3.5 + 2 : Math.random() * 3 + 1.5;
              const left = Math.random() * 100;
              const duration = Math.random() * 10 + 15;
              const delay = Math.random() * -20;
              const drift = (Math.random() - 0.5) * 60;

              return (
                <motion.div
                  key={`bubble-${i}`}
                  initial={{ y: "110vh", opacity: 0, x: "-50%" }}
                  animate={{
                    y: "-10vh",
                    opacity: [0, isSharp ? 1 : 0.85, isSharp ? 0.9 : 0.7, 0],
                    x: ["-50%", `${drift}px`, `${drift * -0.7}px`, "-50%"]
                  }}
                  transition={{ duration, repeat: Infinity, ease: "linear", delay }}
                  className={`absolute rounded-full ${
                    resolvedTheme === 'dark'
                      ? isSharp
                        ? 'bg-[#FFD700]/50 shadow-[0_0_12px_rgba(255,215,0,0.6)]'
                        : 'bg-[#FFD700]/30 shadow-[0_0_8px_rgba(255,215,0,0.4)]'
                      : isSharp
                        ? 'bg-[#B8860B]/80 shadow-[0_0_10px_rgba(184,134,11,0.7)]'
                        : 'bg-[#B8860B]/50 shadow-[0_0_6px_rgba(184,134,11,0.5)]'
                  }`}
                  style={{
                    left: `${left}vw`,
                    width: size,
                    height: size,
                    filter: blurAmount > 0 ? `blur(${blurAmount.toFixed(1)}px)` : undefined,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* The actual app content */}
      {children}
    </AtmosphereContext.Provider>
  );
}

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export type Atmosphere = 'soft-blush' | 'mesh-rose' | 'vignette-rose' | 'prismatic-rose' | 'minimal';

interface AtmosphereContextType {
  atmosphere: Atmosphere;
  setAtmosphere: (atm: Atmosphere) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType>({
  atmosphere: 'soft-blush',
  setAtmosphere: () => {},
});

export function useAtmosphere() {
  return useContext(AtmosphereContext);
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('soft-blush');
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const getBackgroundStyles = () => {
    const isDark = resolvedTheme === 'dark';

    switch (atmosphere) {
      case 'soft-blush':
        return (
          <>
            <div className={`absolute top-0 left-1/4 w-[80vw] h-[80vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-primary/10' : 'bg-primary/20'}`} />
            <div className={`absolute bottom-0 right-1/4 w-[60vw] h-[60vh] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-primary/10' : 'bg-primary/20'}`} />
          </>
        );
      case 'mesh-rose':
        return (
          <>
            <div className={`absolute top-0 left-0 w-[60vw] h-[60vh] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-primary/15' : 'bg-primary/20'}`} />
            <div className={`absolute bottom-0 right-0 w-[70vw] h-[70vh] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-gold/15' : 'bg-gold/20'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-primary/20' : 'bg-rose-300/30'}`} />
          </>
        );
      case 'vignette-rose':
        return (
          <>
            <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-primary/25' : 'bg-primary/30'}`} />
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[100px] pointer-events-none" />
          </>
        );
      case 'prismatic-rose':
        return (
          <>
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-100 blur-[100px]"
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
      case 'minimal':
        return null;
    }
  };

  return (
    <AtmosphereContext.Provider value={{ atmosphere, setAtmosphere }}>
      {/* The background layer container */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background transition-colors duration-700">
        {getBackgroundStyles()}
      </div>
      
      {/* The actual app content */}
      {children}
    </AtmosphereContext.Provider>
  );
}

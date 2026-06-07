'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export type Atmosphere = 'blush' | 'champagne' | 'crimson' | 'sunset' | 'amethyst';

interface AtmosphereContextType {
  atmosphere: Atmosphere;
  setAtmosphere: (atm: Atmosphere) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType>({
  atmosphere: 'blush',
  setAtmosphere: () => {},
});

export function useAtmosphere() {
  return useContext(AtmosphereContext);
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('blush');
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const getBackgroundStyles = () => {
    const isDark = resolvedTheme === 'dark';

    switch (atmosphere) {
      case 'blush':
        return (
          <>
            <div className={`absolute top-0 left-1/4 w-[80vw] h-[80vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-pink-500/10' : 'bg-pink-200/40'}`} />
            <div className={`absolute bottom-0 right-1/4 w-[60vw] h-[60vh] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-rose-500/5' : 'bg-rose-200/30'}`} />
          </>
        );
      case 'champagne':
        return (
          <>
            <div className={`absolute top-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-rose-500/15' : 'bg-rose-200/50'}`} />
            <div className={`absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-orange-400/10' : 'bg-orange-100/40'}`} />
            <div className={`absolute top-1/2 left-1/4 w-[40vw] h-[40vh] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-pink-400/5' : 'bg-pink-100/30'}`} />
          </>
        );
      case 'crimson':
        return (
          <>
            <div className={`absolute top-0 left-1/4 w-[60vw] h-[60vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-red-700/15' : 'bg-red-400/30'}`} />
            <div className={`absolute bottom-0 right-1/4 w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-rose-900/20' : 'bg-rose-400/20'}`} />
            <div className={`absolute top-1/3 right-0 w-[40vw] h-[40vh] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-orange-600/10' : 'bg-orange-300/20'}`} />
          </>
        );
      case 'sunset':
        return (
          <>
            <div className={`absolute top-0 right-0 w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-orange-500/15' : 'bg-orange-400/30'}`} />
            <div className={`absolute bottom-0 left-0 w-[60vw] h-[60vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-pink-600/15' : 'bg-pink-400/30'}`} />
            <div className={`absolute top-1/2 left-1/4 w-[70vw] h-[40vh] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-rose-500/15' : 'bg-rose-400/30'}`} />
          </>
        );
      case 'amethyst':
        return (
          <>
            <div className={`absolute top-0 left-0 w-[50vw] h-[70vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-purple-600/15' : 'bg-purple-400/30'}`} />
            <div className={`absolute bottom-0 right-0 w-[60vw] h-[50vh] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-fuchsia-500/15' : 'bg-fuchsia-300/30'}`} />
            <div className={`absolute top-1/4 right-1/4 w-[40vw] h-[40vh] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-300/30'}`} />
          </>
        );
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

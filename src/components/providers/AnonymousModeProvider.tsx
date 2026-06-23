'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AnonymousModeContextValue {
  isAnonymousMode: boolean;
  toggleAnonymousMode: () => void;
  setAnonymousMode: (value: boolean) => void;
}

const AnonymousModeContext = createContext<AnonymousModeContextValue>({
  isAnonymousMode: false,
  toggleAnonymousMode: () => {},
  setAnonymousMode: () => {},
});

export function useAnonymousMode() {
  return useContext(AnonymousModeContext);
}

export function AnonymousModeProvider({ children }: { children: ReactNode }) {
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('anonymous-mode');
      if (stored === 'true') {
        setIsAnonymousMode(true);
      }
    } catch {
      // localStorage not available
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('anonymous-mode', String(isAnonymousMode));
    } catch {
      // localStorage not available
    }
  }, [isAnonymousMode, isHydrated]);

  const toggleAnonymousMode = useCallback(() => {
    setIsAnonymousMode(prev => !prev);
  }, []);

  const setAnonymousMode = useCallback((value: boolean) => {
    setIsAnonymousMode(value);
  }, []);

  return (
    <AnonymousModeContext.Provider value={{ isAnonymousMode, toggleAnonymousMode, setAnonymousMode }}>
      {children}
    </AnonymousModeContext.Provider>
  );
}

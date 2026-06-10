'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

// Store the event globally so it's captured even before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if already installed
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);
    if (installed) return;

    // Pick up globally captured event
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Also listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt || globalDeferredPrompt;
    
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    } else {
      // Detect platform and give specific instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('Tap the Share button (↑) at the bottom of Safari, then tap "Add to Home Screen".');
      } else if (isAndroid) {
        alert('Tap the ⋮ menu at the top right of Chrome, then tap "Add to Home Screen" or "Install App".');
      } else {
        alert('Click the install icon (⊕) in your browser\'s address bar, or use the browser menu → "Install Fond".');
      }
    }
  };

  if (!mounted) return null;
  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
      title="Install app"
    >
      <Download className="h-3 w-3" />
      Install
    </button>
  );
}

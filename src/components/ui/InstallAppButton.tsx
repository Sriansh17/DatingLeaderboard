'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
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

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Detect platform and give specific instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('Tap the Share button (↑) at the bottom of Safari, then tap "Add to Home Screen".');
      } else if (isAndroid) {
        alert('Tap the ⋮ menu at the top right of Chrome, then tap "Add to Home Screen" or "Install App".');
      } else {
        alert('Click the install icon (⊕) in your browser\'s address bar, or use the browser menu → "Install LoveBoard".');
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

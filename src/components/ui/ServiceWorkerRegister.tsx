'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Skip SW registration in development — it caches stale chunks
    if (process.env.NODE_ENV === 'development') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        function (registration) {
          console.log('SW registered: ', registration.scope);
          // Check for updates periodically
          registration.update();
        },
        function (err) {
          console.log('SW registration failed: ', err);
        }
      );
    }
  }, []);

  return null;
}

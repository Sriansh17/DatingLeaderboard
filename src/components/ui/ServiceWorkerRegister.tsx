'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Skip SW registration in development — it caches stale chunks
    if (process.env.NODE_ENV === 'development') return;

    if ('serviceWorker' in navigator) {
      // Unregister any previous service workers first to clear stale caches
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });

      navigator.serviceWorker.register('/sw.js').then(
        function (registration) {
          console.log('SW registered: ', registration.scope);
        },
        function (err) {
          console.log('SW registration failed: ', err);
        }
      );
    }
  }, []);

  return null;
}

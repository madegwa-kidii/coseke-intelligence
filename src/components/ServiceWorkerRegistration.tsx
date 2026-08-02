'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[ServiceWorker] Service Workers not supported');
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[ServiceWorker] Registration successful:', registration);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Registration failed:', error);
      });
  }, []);

  return null;
}

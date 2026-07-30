'use client';

import { useEffect } from 'react';

/** Registra o service worker uma vez, silenciosamente - nao ha UI para isso. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return null;
}

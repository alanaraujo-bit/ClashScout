import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // O pacote compartilhado e compilado para dist/ antes do build (script prebuild).
  transpilePackages: ['@clashscout/shared'],

  async headers() {
    return [
      {
        // O Service Worker (Fase 4) precisa de escopo raiz e nao pode ser cacheado.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;

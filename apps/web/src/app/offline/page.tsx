import { WifiOff } from 'lucide-react';
import { APP_NAME } from '@clashscout/shared';

import { RetryButton } from './retry-button';

/**
 * Cacheada pelo service worker na instalacao e servida quando uma navegacao
 * falha por falta de rede (ver public/sw.js). Precisa ser estatica - nada de
 * sessao ou fetch aqui, ou o precache quebra.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-surface-elevated)]">
        <WifiOff className="size-7 text-[var(--color-ink-muted)]" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Voce esta offline</h1>
        <p className="max-w-xs text-[var(--color-ink-muted)]">
          Nao foi possivel conectar ao {APP_NAME}. Verifique sua internet e tente novamente.
        </p>
      </div>
      <RetryButton />
    </main>
  );
}

import { APP_DESCRIPTION, APP_NAME } from '@clashscout/shared';

import { ApiStatusBadge } from '@/components/system/api-status-badge';

/**
 * Placeholder da Fase 1. Serve para validar a cadeia de build e a conexao
 * web -> api. A interface real e construida na Fase 4.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium tracking-wide text-[var(--color-ink-muted)] uppercase">
          Fase 1 - Infraestrutura
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-balance">{APP_NAME}</h1>
        <p className="text-lg leading-relaxed text-pretty text-[var(--color-ink-muted)]">
          {APP_DESCRIPTION}
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-separator)] bg-[var(--color-surface-elevated)] p-6">
        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Status do ambiente</h2>
        <ApiStatusBadge />
      </div>
    </main>
  );
}

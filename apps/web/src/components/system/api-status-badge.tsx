'use client';

import { useEffect, useState } from 'react';
import type { HealthCheckResponse } from '@clashscout/shared';

import { apiFetch } from '@/lib/api-client';

type State =
  | { kind: 'loading' }
  | { kind: 'online'; health: HealthCheckResponse }
  | { kind: 'offline'; reason: string };

/**
 * Smoke test visual da integracao web <-> api. Confirma que o CORS, o prefixo
 * de rota e o contrato compartilhado estao alinhados entre os dois deploys.
 */
export function ApiStatusBadge() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let active = true;

    apiFetch<HealthCheckResponse>('/health')
      .then((health) => active && setState({ kind: 'online', health }))
      .catch((error: Error) => active && setState({ kind: 'offline', reason: error.message }));

    return () => {
      active = false;
    };
  }, []);

  const dot =
    state.kind === 'online'
      ? 'bg-green-500'
      : state.kind === 'offline'
        ? 'bg-red-500'
        : 'bg-yellow-500';

  return (
    <div className="flex items-center gap-3">
      <span
        className={`size-2.5 shrink-0 rounded-full ${dot} transition-colors duration-300`}
        aria-hidden
      />
      <p className="text-sm text-[var(--color-ink-muted)]">
        {state.kind === 'loading' && 'Verificando API...'}
        {state.kind === 'online' &&
          `API online - v${state.health.version} (${state.health.environment})`}
        {state.kind === 'offline' && `API indisponivel - ${state.reason}`}
      </p>
    </div>
  );
}

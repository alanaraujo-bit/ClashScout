'use client';

import { useState, useSyncExternalStore, useTransition } from 'react';
import { Bell, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { subscribeToPush, type PushSubscriptionOutcome } from '@/lib/push-client';

export interface NotificationOptInProps {
  message: string;
  /** Quando definido, um "X" grava a recusa no localStorage e o card some para sempre. */
  dismissKey?: string;
}

const noopSubscribe = () => () => {};

/**
 * Le o localStorage de fora do ciclo de render do React - via
 * `useSyncExternalStore`, nao `useEffect` + `setState`, porque nao ha nenhum
 * evento de mudanca a assinar (e o dado so importa uma vez, no primeiro
 * render do cliente). O snapshot do servidor e sempre `false`: SSR nunca sabe
 * o que esta gravado no navegador de quem esta pedindo a pagina.
 */
function useDismissed(dismissKey: string | undefined): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => dismissKey !== undefined && window.localStorage.getItem(dismissKey) === '1',
    () => false,
  );
}

/**
 * Convite para ativar Web Push, sempre atras de um clique real do usuario -
 * nunca dispara `Notification.requestPermission()` sozinho no carregamento da
 * pagina, so quando o proprio jogador clica em "Ativar".
 */
export function NotificationOptIn({ message, dismissKey }: NotificationOptInProps) {
  const [status, setStatus] = useState<PushSubscriptionOutcome | 'idle'>('idle');
  const [dismissedNow, setDismissedNow] = useState(false);
  const [pending, startTransition] = useTransition();
  const dismissedInStorage = useDismissed(dismissKey);

  if (
    dismissedNow ||
    dismissedInStorage ||
    status === 'subscribed' ||
    status === 'denied' ||
    status === 'unsupported'
  ) {
    return null;
  }

  function dismiss() {
    if (dismissKey !== undefined) {
      window.localStorage.setItem(dismissKey, '1');
    }
    setDismissedNow(true);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-separator)] bg-[var(--color-surface-elevated)] p-3 text-sm">
      <Bell className="size-4 shrink-0 text-[var(--color-ink-muted)]" />
      <span className="flex-1 text-[var(--color-ink-muted)]">{message}</span>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => startTransition(async () => setStatus(await subscribeToPush()))}
      >
        Ativar
      </Button>
      {dismissKey !== undefined && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar"
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

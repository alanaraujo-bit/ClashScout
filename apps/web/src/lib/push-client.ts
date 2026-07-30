import { env } from './env';

export type PushSubscriptionOutcome = 'subscribed' | 'denied' | 'unsupported' | 'error';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);

  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

/**
 * Pede permissao de notificacao e registra a inscricao de Web Push.
 *
 * So deve ser chamada a partir de um clique real do usuario (contextual: apos
 * o login ou ao aplicar para uma vaga, nunca no carregamento da pagina) -
 * `Notification.requestPermission()` exige gesto do usuario em varios navegadores.
 */
export async function subscribeToPush(): Promise<PushSubscriptionOutcome> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return 'unsupported';
  }

  if (env.vapidPublicKey === '') {
    return 'unsupported';
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return 'denied';
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey) as BufferSource,
      }));

    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });

    return response.ok ? 'subscribed' : 'error';
  } catch {
    return 'error';
  }
}

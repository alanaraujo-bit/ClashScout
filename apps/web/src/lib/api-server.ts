import { API_PREFIX, API_VERSION, type ApiErrorResponse } from '@clashscout/shared';

import { env } from './env';
import { getSessionToken } from './session-token';
import { ApiClientError } from './api-client';

/**
 * Cliente HTTP para chamadas autenticadas feitas do lado do servidor (Server
 * Components, Server Actions, Route Handlers).
 *
 * Encaminha o token de sessao do Auth.js como `Authorization: Bearer`, o
 * mesmo mecanismo que `SessionGuard` aceita na API. Isso evita depender de
 * cookies cross-origin entre o dominio da Vercel e o do Railway, que exigiriam
 * `SameSite=None` e trariam problemas de terceiros em navegadores restritivos.
 *
 * `cache: 'no-store'` porque todo dado servido por aqui e privado do usuario
 * logado - nunca queremos que o Next sirva a resposta de outra pessoa do cache.
 */
export async function apiServerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken();

  if (token === null) {
    throw new ApiClientError(401, 'UNAUTHENTICATED', 'Sessao ausente.');
  }

  const url = `${env.apiUrl}/${API_PREFIX}/${API_VERSION}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiClientError(
      response.status,
      body?.code ?? 'UNKNOWN_ERROR',
      body?.message ?? `Falha na requisicao para ${path}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

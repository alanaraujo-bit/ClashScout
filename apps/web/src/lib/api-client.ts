import { API_PREFIX, API_VERSION, type ApiErrorResponse } from '@clashscout/shared';

import { env } from './env';

/** Erro de transporte/HTTP normalizado, para a UI reagir a `code` e nao a texto. */
export class ApiClientError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Cliente HTTP unico da aplicacao. Toda chamada a API passa por aqui,
 * o que centraliza base URL, headers e tratamento de erro.
 * Autenticacao (token) e plugada neste ponto na Fase 3.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${env.apiUrl}/${API_PREFIX}/${API_VERSION}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
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

  return (await response.json()) as T;
}

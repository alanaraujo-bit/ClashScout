import type { PlayerProfileResponse } from '@clashscout/shared';

import { ApiClientError } from './api-client';
import { apiServerFetch } from './api-server';

/** Perfil do jogador logado, ou `null` se ele ainda nao vinculou uma conta. */
export async function getCurrentPlayerProfile(): Promise<PlayerProfileResponse | null> {
  try {
    return await apiServerFetch<PlayerProfileResponse>('/players/me');
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'NOT_FOUND') {
      return null;
    }

    throw error;
  }
}

'use server';

import { redirect } from 'next/navigation';

import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

export interface LinkAccountState {
  error: string | null;
}

/** Vincula a conta do jogo ao usuario logado. Redireciona ao dashboard se der certo. */
export async function linkPlayerAccountAction(
  _prevState: LinkAccountState,
  formData: FormData,
): Promise<LinkAccountState> {
  const playerTag = String(formData.get('playerTag') ?? '').trim();
  const apiToken = String(formData.get('apiToken') ?? '').trim();

  try {
    await apiServerFetch('/players/link', {
      method: 'POST',
      body: JSON.stringify({ playerTag, apiToken }),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { error: error.message };
    }

    throw error;
  }

  redirect('/dashboard');
}

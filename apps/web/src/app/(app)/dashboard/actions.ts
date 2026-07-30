'use server';

import { revalidatePath } from 'next/cache';
import { PlayStyle } from '@clashscout/shared';

import { apiServerFetch } from '@/lib/api-server';

/** Reatualiza o perfil a partir da Supercell e recarrega o dashboard. */
export async function syncProfileAction(): Promise<void> {
  await apiServerFetch('/players/me/sync', { method: 'POST' });
  revalidatePath('/dashboard');
}

/** Salva os estilos de jogo declarados pelo jogador - usados no matching de vagas. */
export async function updatePlayStylesAction(formData: FormData): Promise<void> {
  const playStyles = formData.getAll('playStyles') as PlayStyle[];

  await apiServerFetch('/players/me/play-styles', {
    method: 'PATCH',
    body: JSON.stringify({ playStyles }),
  });

  revalidatePath('/dashboard');
}

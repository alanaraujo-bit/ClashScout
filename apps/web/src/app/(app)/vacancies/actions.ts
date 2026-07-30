'use server';

import { revalidatePath } from 'next/cache';

import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

export interface ApplyState {
  error: string | null;
  success: boolean;
}

/**
 * Candidata o jogador logado a uma vaga.
 *
 * `vacancyId` vem pre-preso via `.bind(null, vacancy.id)` no componente que
 * monta o form - o restante da assinatura (`prevState`, `formData`) e o que
 * `useActionState` exige, para o card poder mostrar o erro de negocio (ex.:
 * "perfil nao verificado") sem sair da pagina.
 */
export async function applyToVacancyAction(
  vacancyId: string,
  _prevState: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const message = String(formData.get('message') ?? '').trim();

  try {
    await apiServerFetch(`/vacancies/${vacancyId}/applications`, {
      method: 'POST',
      body: JSON.stringify(message === '' ? {} : { message }),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { error: error.message, success: false };
    }

    throw error;
  }

  revalidatePath('/vacancies');
  revalidatePath(`/vacancies/${vacancyId}`);
  revalidatePath('/applications');

  return { error: null, success: true };
}

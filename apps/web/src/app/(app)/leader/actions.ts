'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PlayStyle, VacancyStatus, type CreateVacancyRequest } from '@clashscout/shared';

import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

export interface VacancyFormState {
  error: string | null;
}

function readVacancyForm(formData: FormData): CreateVacancyRequest {
  const numeric = (key: string): number | undefined => {
    const raw = formData.get(key);
    return raw === null || raw === '' ? undefined : Number(raw);
  };

  const language = String(formData.get('language') ?? '').trim();
  const expiresAt = String(formData.get('expiresAt') ?? '').trim();

  return {
    clanTag: String(formData.get('clanTag') ?? '').trim(),
    clanName: String(formData.get('clanName') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    minTownHallLevel: numeric('minTownHallLevel'),
    minTrophies: numeric('minTrophies'),
    minWarStars: numeric('minWarStars'),
    minBarbarianKingLevel: numeric('minBarbarianKingLevel'),
    minArcherQueenLevel: numeric('minArcherQueenLevel'),
    minMinionPrinceLevel: numeric('minMinionPrinceLevel'),
    minGrandWardenLevel: numeric('minGrandWardenLevel'),
    minRoyalChampionLevel: numeric('minRoyalChampionLevel'),
    playStyles: formData.getAll('playStyles') as PlayStyle[],
    language: language === '' ? undefined : language,
    expiresAt: expiresAt === '' ? undefined : new Date(expiresAt).toISOString(),
  };
}

export async function createVacancyAction(
  _prevState: VacancyFormState,
  formData: FormData,
): Promise<VacancyFormState> {
  let id: string;

  try {
    const vacancy = await apiServerFetch<{ id: string }>('/vacancies', {
      method: 'POST',
      body: JSON.stringify(readVacancyForm(formData)),
    });
    id = vacancy.id;
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath('/leader');
  redirect(`/leader/vacancies/${id}`);
}

export async function updateVacancyAction(
  vacancyId: string,
  _prevState: VacancyFormState,
  formData: FormData,
): Promise<VacancyFormState> {
  try {
    await apiServerFetch(`/vacancies/${vacancyId}`, {
      method: 'PATCH',
      body: JSON.stringify(readVacancyForm(formData)),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath('/leader');
  revalidatePath(`/leader/vacancies/${vacancyId}`);

  return { error: null };
}

export async function changeVacancyStatusAction(
  vacancyId: string,
  status: VacancyStatus,
): Promise<void> {
  await apiServerFetch(`/vacancies/${vacancyId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  revalidatePath('/leader');
  revalidatePath(`/leader/vacancies/${vacancyId}`);
}

export async function decideApplicationAction(
  vacancyId: string,
  applicationId: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<void> {
  await apiServerFetch(`/applications/${applicationId}/decision`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  revalidatePath(`/leader/vacancies/${vacancyId}/applications`);
}

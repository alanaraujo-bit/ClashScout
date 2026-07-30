import { notFound } from 'next/navigation';
import type { VacancyResponse } from '@clashscout/shared';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VacancyRequirements } from '@/components/features/vacancy-requirements';
import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';
import { getCurrentPlayerProfile } from '@/lib/current-profile';

import { ApplyForm } from './apply-form';

interface VacancyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VacancyDetailPage({ params }: VacancyDetailPageProps) {
  const { id } = await params;

  const [vacancy, profile] = await Promise.all([fetchVacancy(id), getCurrentPlayerProfile()]);

  if (vacancy === null) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{vacancy.title}</CardTitle>
          <p className="text-sm text-[var(--color-ink-muted)]">{vacancy.clanName}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="whitespace-pre-wrap text-[var(--color-ink)]">{vacancy.description}</p>
          <VacancyRequirements vacancy={vacancy} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidatar-se</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplyForm vacancyId={vacancy.id} canApply={profile?.verifiedAt !== null} />
        </CardContent>
      </Card>
    </div>
  );
}

async function fetchVacancy(id: string): Promise<VacancyResponse | null> {
  try {
    return await apiServerFetch<VacancyResponse>(`/vacancies/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'NOT_FOUND') {
      return null;
    }

    throw error;
  }
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { VacancyResponse } from '@clashscout/shared';

import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VacancyStatusPill } from '@/components/ui/status-pill';
import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

import { updateVacancyAction } from '../../actions';
import { VacancyForm } from '../../vacancy-form';
import { StatusActions } from './status-actions';

interface EditVacancyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVacancyPage({ params }: EditVacancyPageProps) {
  const { id } = await params;
  const [vacancy, session] = await Promise.all([fetchVacancy(id), auth()]);

  if (vacancy === null || vacancy.ownerId !== session?.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{vacancy.title}</h1>
            <VacancyStatusPill status={vacancy.status} />
          </div>
          <Link
            href={`/leader/vacancies/${vacancy.id}/applications`}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Ver candidaturas ({vacancy.applicationsCount ?? 0})
          </Link>
        </div>
        <StatusActions vacancyId={vacancy.id} status={vacancy.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editar detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <VacancyForm
            action={updateVacancyAction.bind(null, vacancy.id)}
            initial={vacancy}
            submitLabel="Salvar alteracoes"
          />
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

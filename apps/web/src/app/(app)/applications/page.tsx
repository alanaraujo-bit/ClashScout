import Link from 'next/link';
import { ListChecks } from 'lucide-react';
import type { ApplicationResponse } from '@clashscout/shared';

import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ApplicationStatusPill } from '@/components/ui/status-pill';
import { apiServerFetch } from '@/lib/api-server';

export default async function ApplicationsPage() {
  const applications = await apiServerFetch<ApplicationResponse[]>('/applications/me');

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Minhas candidaturas</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Acompanhe o status de cada vaga que voce se candidatou.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-8" />}
          title="Voce ainda nao se candidatou a nenhuma vaga"
          description="Explore o feed de vagas e encontre um cla que combine com seu perfil."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <Card key={application.id} className="p-5">
              <CardContent className="flex items-start justify-between gap-4 p-0">
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/vacancies/${application.vacancy.id}`}
                    className="font-medium hover:underline"
                  >
                    {application.vacancy.title}
                  </Link>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {application.vacancy.clanName}
                  </p>
                  {application.message && (
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)] italic">
                      &ldquo;{application.message}&rdquo;
                    </p>
                  )}
                </div>
                <ApplicationStatusPill status={application.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

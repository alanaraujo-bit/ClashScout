import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ApplicationStatus,
  type VacancyApplicationResponse,
  type VacancyResponse,
} from '@clashscout/shared';

import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ApplicationStatusPill } from '@/components/ui/status-pill';
import { PLAY_STYLE_LABEL } from '@/lib/labels';
import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

import { DecideButtons } from './decide-buttons';

const DECIDABLE = new Set<ApplicationStatus>([
  ApplicationStatus.PENDING,
  ApplicationStatus.REVIEWING,
]);

interface ApplicationsInboxPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsInboxPage({ params }: ApplicationsInboxPageProps) {
  const { id } = await params;
  const session = await auth();

  const vacancy = await fetchVacancy(id);
  if (vacancy === null || vacancy.ownerId !== session?.user.id) {
    notFound();
  }

  const applications = await apiServerFetch<VacancyApplicationResponse[]>(
    `/vacancies/${id}/applications`,
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <div>
        <Link
          href={`/leader/vacancies/${id}`}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          &larr; {vacancy.title}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Candidaturas</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          {applications.length}{' '}
          {applications.length === 1 ? 'candidatura recebida' : 'candidaturas recebidas'}
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="Nenhuma candidatura ainda"
          description="Assim que alguem se candidatar, aparece aqui."
        />
      ) : (
        <>
          {/* Mobile: cards empilhados */}
          <div className="flex flex-col gap-3 md:hidden">
            {applications.map((application) => (
              <Card key={application.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{application.candidate.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      {application.candidate.playerTag}
                    </p>
                  </div>
                  <ApplicationStatusPill status={application.status} />
                </div>
                <CandidateStats candidate={application.candidate} />
                {application.message && (
                  <p className="text-sm text-[var(--color-ink-muted)] italic">
                    &ldquo;{application.message}&rdquo;
                  </p>
                )}
                {DECIDABLE.has(application.status) && (
                  <DecideButtons vacancyId={id} applicationId={application.id} />
                )}
              </Card>
            ))}
          </div>

          {/* Desktop: tabela de alta densidade para comparar candidatos lado a lado */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-separator)] md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-separator)] bg-[var(--color-surface-elevated)] text-left text-xs tracking-wide text-[var(--color-ink-muted)] uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Jogador</th>
                  <th className="px-4 py-3 font-medium">CV</th>
                  <th className="px-4 py-3 font-medium">Trofeus</th>
                  <th className="px-4 py-3 font-medium">Estrelas de guerra</th>
                  <th className="px-4 py-3 font-medium">Estilo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-separator)]">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{application.candidate.name}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {application.candidate.playerTag}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {application.candidate.stats.townHallLevel}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {application.candidate.stats.trophies.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {application.candidate.stats.warStars.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {application.candidate.playStyles.map((style) => (
                          <Badge key={style}>{PLAY_STYLE_LABEL[style]}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusPill status={application.status} />
                    </td>
                    <td className="px-4 py-3">
                      {DECIDABLE.has(application.status) && (
                        <DecideButtons vacancyId={id} applicationId={application.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function CandidateStats({ candidate }: { candidate: VacancyApplicationResponse['candidate'] }) {
  return (
    <div className="flex flex-wrap gap-1.5 text-xs">
      <Badge>CV {candidate.stats.townHallLevel}</Badge>
      <Badge>{candidate.stats.trophies.toLocaleString('pt-BR')} trofeus</Badge>
      <Badge>{candidate.stats.warStars.toLocaleString('pt-BR')} estrelas</Badge>
      {candidate.playStyles.map((style) => (
        <Badge key={style} tone="accent">
          {PLAY_STYLE_LABEL[style]}
        </Badge>
      ))}
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

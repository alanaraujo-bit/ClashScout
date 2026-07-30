import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import type { VacancyListResponse } from '@clashscout/shared';

import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { apiServerFetch } from '@/lib/api-server';
import { getCurrentPlayerProfile } from '@/lib/current-profile';

import { VacancyCard } from './vacancy-card';
import { VacancyFilters } from './vacancy-filters';

interface VacanciesPageProps {
  searchParams: Promise<{
    townHallLevel?: string;
    playStyles?: string | string[];
    language?: string;
    page?: string;
  }>;
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = await searchParams;
  const playStyles =
    params.playStyles === undefined
      ? []
      : Array.isArray(params.playStyles)
        ? params.playStyles
        : [params.playStyles];
  const page = Number(params.page ?? '1') || 1;

  const profile = await getCurrentPlayerProfile();

  const query = new URLSearchParams();
  if (params.townHallLevel) query.set('townHallLevel', params.townHallLevel);
  if (params.language) query.set('language', params.language);
  if (playStyles.length > 0) query.set('playStyles', playStyles.join(','));
  query.set('page', String(page));

  const feed = await apiServerFetch<VacancyListResponse>(`/vacancies?${query.toString()}`);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vagas abertas</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          {feed.total} {feed.total === 1 ? 'vaga encontrada' : 'vagas encontradas'}
        </p>
      </div>

      <VacancyFilters
        townHallLevel={params.townHallLevel}
        playStyles={playStyles}
        language={params.language}
      />

      {feed.items.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-8" />}
          title="Nenhuma vaga encontrada"
          description="Ajuste os filtros ou volte mais tarde - novos clas publicam vagas o tempo todo."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feed.items.map((vacancy) => (
            <VacancyCard
              key={vacancy.id}
              vacancy={vacancy}
              canApply={profile?.verifiedAt !== null}
            />
          ))}
        </div>
      )}

      {(page > 1 || feed.hasNext) && (
        <div className="flex justify-between">
          <PageLink query={query} page={page - 1} disabled={page <= 1}>
            Anterior
          </PageLink>
          <PageLink query={query} page={page + 1} disabled={!feed.hasNext}>
            Proxima
          </PageLink>
        </div>
      )}
    </div>
  );
}

function PageLink({
  query,
  page,
  disabled,
  children,
}: {
  query: URLSearchParams;
  page: number;
  disabled: boolean;
  children: string;
}) {
  if (disabled) {
    return (
      <Button variant="secondary" size="sm" disabled>
        {children}
      </Button>
    );
  }

  const next = new URLSearchParams(query);
  next.set('page', String(page));

  return (
    <Link
      href={`/vacancies?${next.toString()}`}
      className={buttonVariants({ variant: 'secondary', size: 'sm' })}
    >
      {children}
    </Link>
  );
}

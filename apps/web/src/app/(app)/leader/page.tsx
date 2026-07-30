import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import type { VacancyResponse } from '@clashscout/shared';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { VacancyStatusPill } from '@/components/ui/status-pill';
import { apiServerFetch } from '@/lib/api-server';

export default async function LeaderPage() {
  const vacancies = await apiServerFetch<VacancyResponse[]>('/vacancies/mine');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel de recrutamento</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Gerencie as vagas que voce publicou.
          </p>
        </div>
        <Link href="/leader/vacancies/new" className={buttonVariants({ size: 'sm' })}>
          <Plus className="size-4" /> Nova vaga
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <EmptyState
          icon={<Users className="size-8" />}
          title="Nenhuma vaga criada ainda"
          description="Publique uma vaga para comecar a receber candidaturas de jogadores."
          action={
            <Link href="/leader/vacancies/new" className={buttonVariants({ size: 'sm' })}>
              Criar primeira vaga
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {vacancies.map((vacancy) => (
            <Link key={vacancy.id} href={`/leader/vacancies/${vacancy.id}`}>
              <Card className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-[var(--color-surface)]">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{vacancy.title}</p>
                  <p className="text-sm text-[var(--color-ink-muted)]">{vacancy.clanName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-ink-muted)]">
                    {vacancy.applicationsCount ?? 0}{' '}
                    {vacancy.applicationsCount === 1 ? 'candidatura' : 'candidaturas'}
                  </span>
                  <VacancyStatusPill status={vacancy.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

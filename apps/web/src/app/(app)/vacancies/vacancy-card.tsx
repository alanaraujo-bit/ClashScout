import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import type { VacancyResponse } from '@clashscout/shared';

import { Card, CardTitle } from '@/components/ui/card';
import { VacancyRequirements } from '@/components/features/vacancy-requirements';

import { ApplyButton } from './apply-button';

export function VacancyCard({
  vacancy,
  canApply,
}: {
  vacancy: VacancyResponse;
  canApply: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Link href={`/vacancies/${vacancy.id}`} className="hover:underline">
            <CardTitle className="text-base">{vacancy.title}</CardTitle>
          </Link>
          <p className="text-sm text-[var(--color-ink-muted)]">{vacancy.clanName}</p>
        </div>
        {vacancy.matchesRequirements === true && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-3.5" /> Voce se qualifica
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-[var(--color-ink-muted)]">{vacancy.description}</p>

      <VacancyRequirements vacancy={vacancy} />

      <div className="mt-auto flex items-center justify-end pt-2">
        <ApplyButton vacancyId={vacancy.id} disabled={!canApply} />
      </div>
    </Card>
  );
}

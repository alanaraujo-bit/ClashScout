'use client';

import { useFormStatus } from 'react-dom';
import { VacancyStatus } from '@clashscout/shared';

import { Button, type ButtonProps } from '@/components/ui/button';

import { changeVacancyStatusAction } from '../../actions';

const TRANSITIONS: Partial<
  Record<VacancyStatus, { label: string; target: VacancyStatus; variant: ButtonProps['variant'] }[]>
> = {
  [VacancyStatus.DRAFT]: [
    { label: 'Publicar vaga', target: VacancyStatus.OPEN, variant: 'primary' },
  ],
  [VacancyStatus.OPEN]: [
    { label: 'Pausar', target: VacancyStatus.PAUSED, variant: 'secondary' },
    { label: 'Encerrar', target: VacancyStatus.CLOSED, variant: 'destructive' },
  ],
  [VacancyStatus.PAUSED]: [
    { label: 'Reabrir', target: VacancyStatus.OPEN, variant: 'primary' },
    { label: 'Encerrar', target: VacancyStatus.CLOSED, variant: 'destructive' },
  ],
  [VacancyStatus.CLOSED]: [{ label: 'Reabrir', target: VacancyStatus.OPEN, variant: 'primary' }],
};

export function StatusActions({ vacancyId, status }: { vacancyId: string; status: VacancyStatus }) {
  const transitions = TRANSITIONS[status] ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((transition) => (
        <form
          key={transition.target}
          action={changeVacancyStatusAction.bind(null, vacancyId, transition.target)}
        >
          <StatusButton variant={transition.variant}>{transition.label}</StatusButton>
        </form>
      ))}
    </div>
  );
}

function StatusButton({
  variant,
  children,
}: {
  variant: ButtonProps['variant'];
  children: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {children}
    </Button>
  );
}

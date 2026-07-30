'use client';

import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';

import { decideApplicationAction } from '../../../actions';

export function DecideButtons({
  vacancyId,
  applicationId,
}: {
  vacancyId: string;
  applicationId: string;
}) {
  return (
    <div className="flex gap-2">
      <form action={decideApplicationAction.bind(null, vacancyId, applicationId, 'REJECTED')}>
        <DecideButton variant="secondary">Rejeitar</DecideButton>
      </form>
      <form action={decideApplicationAction.bind(null, vacancyId, applicationId, 'APPROVED')}>
        <DecideButton variant="primary">Aprovar</DecideButton>
      </form>
    </div>
  );
}

function DecideButton({
  variant,
  children,
}: {
  variant: 'primary' | 'secondary';
  children: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {children}
    </Button>
  );
}

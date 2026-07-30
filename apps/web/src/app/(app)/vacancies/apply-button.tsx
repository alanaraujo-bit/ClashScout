'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';

import { applyToVacancyAction, type ApplyState } from './actions';

const INITIAL_STATE: ApplyState = { error: null, success: false };

export function ApplyButton({ vacancyId, disabled }: { vacancyId: string; disabled?: boolean }) {
  const [state, formAction] = useActionState(
    applyToVacancyAction.bind(null, vacancyId),
    INITIAL_STATE,
  );

  if (state.success) {
    return (
      <Button size="sm" variant="secondary" disabled>
        Candidatura enviada
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <SubmitButton disabled={disabled} />
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
    </form>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? 'Enviando...' : 'Aplicar para a vaga'}
    </Button>
  );
}

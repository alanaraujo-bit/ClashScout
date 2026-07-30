'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { FieldError, FieldHint } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import { applyToVacancyAction, type ApplyState } from '../actions';

const INITIAL_STATE: ApplyState = { error: null, success: false };

export function ApplyForm({ vacancyId, canApply }: { vacancyId: string; canApply: boolean }) {
  const [state, formAction] = useActionState(
    applyToVacancyAction.bind(null, vacancyId),
    INITIAL_STATE,
  );

  if (state.success) {
    return (
      <p className="text-sm text-green-600 dark:text-green-400">Candidatura enviada com sucesso.</p>
    );
  }

  if (!canApply) {
    return (
      <FieldHint>
        Verifique a posse da sua conta do jogo no seu perfil antes de se candidatar a vagas.
      </FieldHint>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Textarea
        name="message"
        placeholder="Conte um pouco sobre voce para o lider (opcional)"
        rows={4}
      />
      {state.error && <FieldError>{state.error}</FieldError>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? 'Enviando...' : 'Enviar candidatura'}
    </Button>
  );
}

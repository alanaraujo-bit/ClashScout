'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, Label } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { registerAction, type AuthFormState } from './actions';

const INITIAL_STATE: AuthFormState = { error: null };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <Field>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>

      <Field>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        <FieldHint>Minimo de 8 caracteres.</FieldHint>
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      {state.error && <FieldError>{state.error}</FieldError>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? 'Criando conta...' : 'Criar conta'}
    </Button>
  );
}

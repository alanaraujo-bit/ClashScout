'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, Label } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { linkPlayerAccountAction, type LinkAccountState } from './actions';

const INITIAL_STATE: LinkAccountState = { error: null };

export function LinkAccountForm() {
  const [state, formAction] = useActionState(linkPlayerAccountAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <Label htmlFor="playerTag">Player Tag</Label>
        <Input
          id="playerTag"
          name="playerTag"
          placeholder="#2PP0JCCL"
          required
          autoComplete="off"
        />
        <FieldHint>A tag do seu perfil no jogo, com ou sem o #.</FieldHint>
      </Field>

      <Field>
        <Label htmlFor="apiToken">API Token</Label>
        <Input
          id="apiToken"
          name="apiToken"
          placeholder="Cole o token gerado no jogo"
          required
          autoComplete="off"
        />
        <FieldHint>
          No jogo: Configuracoes &gt; Mais Configuracoes &gt; API Token. O token expira em poucos
          minutos, entao gere um novo se a verificacao demorar.
        </FieldHint>
      </Field>

      {state.error && <FieldError>{state.error}</FieldError>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? 'Verificando...' : 'Vincular conta'}
    </Button>
  );
}

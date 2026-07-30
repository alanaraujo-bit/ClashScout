'use server';

import { redirect } from 'next/navigation';

import { createSessionCookie } from '@/lib/app-session';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export interface AuthFormState {
  error: string | null;
}

const GENERIC_INVALID_CREDENTIALS = 'E-mail ou senha invalidos.';

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '/dashboard');

  if (email === '' || password === '') {
    return { error: 'Preencha e-mail e senha.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Mesma mensagem para "nao existe" e "senha errada" - nao da pista sobre
  // quais e-mails tem conta cadastrada.
  if (user === null || user.passwordHash === null) {
    return { error: GENERIC_INVALID_CREDENTIALS };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: GENERIC_INVALID_CREDENTIALS };
  }

  await createSessionCookie(user.id);
  redirect(callbackUrl);
}

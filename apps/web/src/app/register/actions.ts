'use server';

import { redirect } from 'next/navigation';

import { createSessionCookie } from '@/lib/app-session';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export interface AuthFormState {
  error: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (name === '' || email === '' || password === '') {
    return { error: 'Preencha todos os campos.' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: 'Informe um e-mail valido.' };
  }
  if (password.length < 8) {
    return { error: 'A senha precisa ter pelo menos 8 caracteres.' };
  }
  if (password !== confirmPassword) {
    return { error: 'As senhas nao conferem.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing !== null) {
    return { error: 'Ja existe uma conta com este e-mail.' };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  await createSessionCookie(user.id);
  redirect('/onboarding');
}

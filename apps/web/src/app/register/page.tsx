import Link from 'next/link';
import { redirect } from 'next/navigation';
import { APP_NAME } from '@clashscout/shared';

import { auth } from '@/auth';

import { RegisterForm } from './register-form';

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">{APP_NAME}</h1>
        <p className="max-w-xs text-[var(--color-ink-muted)]">Crie sua conta para comecar.</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <RegisterForm />

        <p className="text-center text-sm text-[var(--color-ink-muted)]">
          Ja tem conta?{' '}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

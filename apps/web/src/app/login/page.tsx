import Link from 'next/link';
import { redirect } from 'next/navigation';
import { APP_NAME } from '@clashscout/shared';

import { auth, signIn } from '@/auth';
import { Button } from '@/components/ui/button';

import { LoginForm } from './login-form';

/**
 * Login com Google fica pronto no backend (auth.ts) mas escondido da UI ate a
 * integracao OAuth ser validada de verdade em producao. Vire `true` para
 * reexibir o botao - nao precisa mexer em mais nada.
 */
const GOOGLE_SIGN_IN_ENABLED = false;

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const destination = callbackUrl ?? '/dashboard';

  if (session?.user) {
    redirect(destination);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">{APP_NAME}</h1>
        <p className="max-w-xs text-[var(--color-ink-muted)]">
          Entre para montar seu curriculo de jogador e encontrar o cla certo.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <LoginForm callbackUrl={destination} />

        {GOOGLE_SIGN_IN_ENABLED && (
          <>
            <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
              <span className="h-px flex-1 bg-[var(--color-separator)]" />
              ou
              <span className="h-px flex-1 bg-[var(--color-separator)]" />
            </div>
            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: destination });
              }}
            >
              <Button type="submit" variant="secondary" size="lg" className="w-full">
                <GoogleIcon />
                Continuar com Google
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-[var(--color-ink-muted)]">
          Ainda nao tem conta?{' '}
          <Link href="/register" className="text-[var(--color-accent)] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="currentColor"
        d="M12 10.8v3.6h5.04c-.2 1.2-1.5 3.6-5.04 3.6-3.03 0-5.5-2.5-5.5-5.5s2.47-5.5 5.5-5.5c1.72 0 2.87.73 3.53 1.36l2.4-2.32C16.34 4.7 14.36 3.8 12 3.8 7.36 3.8 3.6 7.56 3.6 12.2s3.76 8.4 8.4 8.4c4.85 0 8.06-3.4 8.06-8.2 0-.55-.06-.97-.14-1.4H12z"
      />
    </svg>
  );
}

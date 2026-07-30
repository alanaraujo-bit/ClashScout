import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentPlayerProfile } from '@/lib/current-profile';

import { LinkAccountForm } from './link-account-form';

export default async function OnboardingPage() {
  const profile = await getCurrentPlayerProfile();

  if (profile !== null) {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Vincule sua conta do jogo</CardTitle>
          <CardDescription>
            Precisamos confirmar que essa conta do Clash of Clans e realmente sua antes de montar
            seu curriculo e liberar candidaturas a vagas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkAccountForm />
        </CardContent>
      </Card>
    </main>
  );
}

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AppShell } from '@/components/layout/app-shell';
import { getCurrentPlayerProfile } from '@/lib/current-profile';

/**
 * Layout do grupo autenticado. `middleware.ts` ja bloqueia quem nao tem
 * sessao; aqui garantimos tambem que o jogador ja vinculou uma conta do jogo -
 * sem isso nao ha perfil para navegar vagas ou aparecer para lideres.
 */
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const profile = await getCurrentPlayerProfile();

  if (profile === null) {
    redirect('/onboarding');
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}

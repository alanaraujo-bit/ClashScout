import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { getCurrentPlayerProfile } from '@/lib/current-profile';

/** Porta de entrada: so decide para onde mandar o visitante. */
export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const profile = await getCurrentPlayerProfile();

  redirect(profile === null ? '/onboarding' : '/dashboard');
}

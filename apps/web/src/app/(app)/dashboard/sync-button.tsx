'use client';

import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { syncProfileAction } from './actions';

export function SyncButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => syncProfileAction())}
    >
      <RefreshCw className={pending ? 'size-4 animate-spin' : 'size-4'} />
      {pending ? 'Sincronizando...' : 'Sincronizar com o jogo'}
    </Button>
  );
}

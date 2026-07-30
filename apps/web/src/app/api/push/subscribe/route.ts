import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

/**
 * Proxy same-origin para POST /push/subscriptions na API.
 *
 * O registro da inscricao so pode acontecer no navegador (e o unico lugar
 * com acesso ao objeto `PushSubscription`), mas o browser so tem o cookie de
 * sessao - nao o Bearer token que `SessionGuard` exige. Este route handler
 * roda no servidor do Next, le a sessao pelo cookie e repassa autenticado.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.text();

  try {
    await apiServerFetch('/push/subscriptions', { method: 'POST', body });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode },
      );
    }

    throw error;
  }
}

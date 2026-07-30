import { NextResponse } from 'next/server';

import { ApiClientError } from '@/lib/api-client';
import { apiServerFetch } from '@/lib/api-server';

/** Proxy same-origin para POST /push/subscriptions/unsubscribe na API - ver subscribe/route.ts. */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.text();

  try {
    await apiServerFetch('/push/subscriptions/unsubscribe', { method: 'POST', body });

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

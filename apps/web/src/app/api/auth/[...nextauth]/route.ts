import { handlers } from '@/auth';

/**
 * Endpoints do Auth.js: /api/auth/signin, /callback/google, /session, /signout.
 * A configuracao vive em src/auth.ts - aqui so expomos os handlers.
 */
export const { GET, POST } = handlers;

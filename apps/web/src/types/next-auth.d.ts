import type { UserRole } from '@clashscout/shared';
import type { DefaultSession } from 'next-auth';

/**
 * Amplia os tipos do Auth.js com os campos que adicionamos na sessao pelo
 * callback `session`. Sem isso, `session.user.id` e `role` nao existem para o
 * TypeScript e cada uso viraria um cast.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}

import type { UserRole } from '@clashscout/shared';

/** Identidade do usuario por tras de uma requisicao autenticada. */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
}

/**
 * Resolve o token de sessao emitido pelo Auth.js (no app web) para um usuario.
 *
 * A sessao e persistida em banco pelo adapter do Auth.js, e a API le a mesma
 * tabela. Isso evita duplicar criptografia de JWT entre dois runtimes e mantem
 * a revogacao de sessao trivial: apagar a linha encerra o acesso na hora.
 */
export abstract class SessionRepository {
  /** Retorna `null` se o token nao existe ou se a sessao expirou. */
  abstract findValidUserBySessionToken(sessionToken: string): Promise<AuthenticatedUser | null>;
}

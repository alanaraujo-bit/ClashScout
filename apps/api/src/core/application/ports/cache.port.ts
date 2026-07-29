/**
 * Cache chave-valor com expiracao.
 *
 * Declarado como porta para que a troca de cache em memoria por Redis seja uma
 * mudanca de uma linha no modulo, sem tocar em caso de uso nem em gateway.
 */
export abstract class CachePort {
  abstract get<T>(key: string): Promise<T | null>;

  /** @param ttlSeconds tempo de vida da entrada. */
  abstract set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;

  abstract delete(key: string): Promise<void>;

  abstract clear(): Promise<void>;
}

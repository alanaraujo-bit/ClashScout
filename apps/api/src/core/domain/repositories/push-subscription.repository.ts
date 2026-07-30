import type {
  PushSubscriptionInput,
  StoredPushSubscription,
} from '../entities/push-subscription.entity';

/**
 * Contrato de persistencia das inscricoes de Web Push.
 *
 * `upsert` e por `endpoint`: o mesmo navegador reinscrevendo (ex.: apos o
 * usuario limpar dados) atualiza a linha em vez de duplicar.
 */
export abstract class PushSubscriptionRepository {
  abstract upsert(input: PushSubscriptionInput): Promise<void>;

  /** Idempotente: nao lanca se o endpoint ja nao existir mais. */
  abstract remove(endpoint: string): Promise<void>;

  abstract listByUserId(userId: string): Promise<StoredPushSubscription[]>;
}

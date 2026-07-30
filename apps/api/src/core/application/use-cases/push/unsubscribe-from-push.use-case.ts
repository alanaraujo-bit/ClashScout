import type { PushSubscriptionRepository } from '../../../domain/repositories/push-subscription.repository';

/** Remove a inscricao de Web Push de um endpoint - chamado ao desativar notificacoes. */
export class UnsubscribeFromPushUseCase {
  constructor(private readonly subscriptions: PushSubscriptionRepository) {}

  async execute(endpoint: string): Promise<void> {
    await this.subscriptions.remove(endpoint);
  }
}

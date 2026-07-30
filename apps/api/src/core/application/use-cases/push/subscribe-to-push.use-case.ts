import type { PushSubscriptionInput } from '../../../domain/entities/push-subscription.entity';
import type { PushSubscriptionRepository } from '../../../domain/repositories/push-subscription.repository';

/** Registra (ou atualiza) a inscricao de Web Push do dispositivo atual. */
export class SubscribeToPushUseCase {
  constructor(private readonly subscriptions: PushSubscriptionRepository) {}

  async execute(input: PushSubscriptionInput): Promise<void> {
    await this.subscriptions.upsert(input);
  }
}

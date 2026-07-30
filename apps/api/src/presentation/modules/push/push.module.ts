import { Module } from '@nestjs/common';

import { SubscribeToPushUseCase } from '../../../core/application/use-cases/push/subscribe-to-push.use-case';
import { UnsubscribeFromPushUseCase } from '../../../core/application/use-cases/push/unsubscribe-from-push.use-case';
import { PushSubscriptionRepository } from '../../../core/domain/repositories/push-subscription.repository';
import { PushController } from './push.controller';

@Module({
  controllers: [PushController],
  providers: [
    {
      provide: SubscribeToPushUseCase,
      useFactory: (subscriptions: PushSubscriptionRepository) =>
        new SubscribeToPushUseCase(subscriptions),
      inject: [PushSubscriptionRepository],
    },
    {
      provide: UnsubscribeFromPushUseCase,
      useFactory: (subscriptions: PushSubscriptionRepository) =>
        new UnsubscribeFromPushUseCase(subscriptions),
      inject: [PushSubscriptionRepository],
    },
  ],
})
export class PushSubscriptionsModule {}

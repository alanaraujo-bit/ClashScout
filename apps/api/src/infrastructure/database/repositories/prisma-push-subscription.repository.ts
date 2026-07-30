import { Injectable } from '@nestjs/common';
import type { PushSubscription } from '@clashscout/database';

import type {
  PushSubscriptionInput,
  StoredPushSubscription,
} from '../../../core/domain/entities/push-subscription.entity';
import { PushSubscriptionRepository } from '../../../core/domain/repositories/push-subscription.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPushSubscriptionRepository extends PushSubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async upsert(input: PushSubscriptionInput): Promise<void> {
    await this.prisma.client.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      create: {
        userId: input.userId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent,
      },
      update: {
        userId: input.userId,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent,
      },
    });
  }

  async remove(endpoint: string): Promise<void> {
    await this.prisma.client.pushSubscription.deleteMany({ where: { endpoint } });
  }

  async listByUserId(userId: string): Promise<StoredPushSubscription[]> {
    const rows = await this.prisma.client.pushSubscription.findMany({ where: { userId } });

    return rows.map(toStoredSubscription);
  }
}

function toStoredSubscription(row: PushSubscription): StoredPushSubscription {
  return {
    id: row.id,
    userId: row.userId,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
  };
}

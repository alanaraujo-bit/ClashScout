import { Type } from 'class-transformer';
import { IsString, IsUrl, ValidateNested } from 'class-validator';

class PushSubscriptionKeysDto {
  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;
}

/**
 * Entrada de POST /api/v1/push/subscriptions.
 *
 * Formato identico ao de `PushSubscription.toJSON()` no navegador - o
 * frontend manda o objeto puro, sem remapear campos.
 */
export class SubscribeToPushDto {
  @IsUrl({ require_tld: false })
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}

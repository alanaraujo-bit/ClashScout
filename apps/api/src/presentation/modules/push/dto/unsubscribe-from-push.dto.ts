import { IsUrl } from 'class-validator';

/** Entrada de POST /api/v1/push/subscriptions/unsubscribe. */
export class UnsubscribeFromPushDto {
  @IsUrl({ require_tld: false })
  endpoint!: string;
}

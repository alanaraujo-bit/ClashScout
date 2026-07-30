import { Global, Module } from '@nestjs/common';

import { WebPushPort } from '../../core/application/ports/web-push.port';
import { WebPushAdapter } from './web-push.adapter';

/**
 * Liga a porta de push ao adapter concreto, no mesmo padrao de `SupercellModule`.
 */
@Global()
@Module({
  providers: [{ provide: WebPushPort, useClass: WebPushAdapter }],
  exports: [WebPushPort],
})
export class PushModule {}

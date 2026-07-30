import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { SubscribeToPushUseCase } from '../../../core/application/use-cases/push/subscribe-to-push.use-case';
import { UnsubscribeFromPushUseCase } from '../../../core/application/use-cases/push/unsubscribe-from-push.use-case';
import type { AuthenticatedUser } from '../../../core/domain/repositories/session.repository';
import { CurrentUser } from '../../http/decorators/current-user.decorator';
import { SessionGuard } from '../../http/guards/session.guard';
import { SubscribeToPushDto } from './dto/subscribe-to-push.dto';
import { UnsubscribeFromPushDto } from './dto/unsubscribe-from-push.dto';

@Controller({ path: 'push/subscriptions', version: '1' })
@UseGuards(SessionGuard)
export class PushController {
  constructor(
    private readonly subscribeToPush: SubscribeToPushUseCase,
    private readonly unsubscribeFromPush: UnsubscribeFromPushUseCase,
  ) {}

  /** Registra a inscricao de Web Push do dispositivo atual para o usuario logado. */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SubscribeToPushDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.subscribeToPush.execute({
      userId: user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: request.headers['user-agent'] ?? null,
    });
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribe(@Body() body: UnsubscribeFromPushDto): Promise<void> {
    await this.unsubscribeFromPush.execute(body.endpoint);
  }
}

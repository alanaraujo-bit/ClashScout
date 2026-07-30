import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import webpush from 'web-push';

import {
  WebPushPort,
  type PushNotificationPayload,
} from '../../core/application/ports/web-push.port';
import { PushSubscriptionRepository } from '../../core/domain/repositories/push-subscription.repository';
import { AppConfigService } from '../config/app-config.service';

/**
 * Implementacao HTTP do envio de Web Push, via `web-push`.
 *
 * Sem VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY configuradas, vira um no-op logado
 * em vez de lancar - mesma filosofia do SupercellNotConfiguredError, so que
 * aqui nem chega a virar erro: notificacao e efeito colateral, o caso de uso
 * que a disparou ja terminou com sucesso.
 */
@Injectable()
export class WebPushAdapter extends WebPushPort implements OnModuleInit {
  private readonly logger = new Logger(WebPushAdapter.name);
  private configured = false;

  constructor(
    private readonly config: AppConfigService,
    private readonly subscriptions: PushSubscriptionRepository,
  ) {
    super();
  }

  onModuleInit(): void {
    const {
      vapidPublicKey: publicKey,
      vapidPrivateKey: privateKey,
      vapidSubject: subject,
    } = this.config;

    if (publicKey === undefined || privateKey === undefined) {
      this.logger.warn('VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY ausentes - envio de push desativado.');
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.configured = true;
  }

  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<void> {
    if (!this.configured) {
      return;
    }

    const subscriptions = await this.subscriptions.listByUserId(userId);
    const body = JSON.stringify(payload);

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            body,
          );
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;

          // 404/410 = o navegador cancelou a inscricao (desinstalou, limpou dados
          // do site). Limpamos para nao tentar de novo pra sempre.
          if (statusCode === 404 || statusCode === 410) {
            await this.subscriptions.remove(subscription.endpoint);
            return;
          }

          this.logger.warn(`Falha ao enviar push para ${subscription.endpoint}: ${String(error)}`);
        }
      }),
    );
  }
}

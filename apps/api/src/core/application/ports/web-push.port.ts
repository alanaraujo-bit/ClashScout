export interface PushNotificationPayload {
  title: string;
  body?: string;
  /** Caminho relativo para onde a notificacao deve levar ao ser clicada. */
  url?: string;
  /** Notificacoes com a mesma tag se substituem em vez de empilhar. */
  tag?: string;
}

/**
 * Porta de saida para notificacoes Web Push.
 *
 * Envio de push e efeito colateral, nunca o resultado principal de um caso de
 * uso: falhas aqui (dispositivo desinstalou o app, chave expirou) nao podem
 * derrubar a candidatura/decisao que disparou a notificacao. Por isso o
 * metodo nunca rejeita - a implementacao trata e loga os proprios erros.
 */
export abstract class WebPushPort {
  abstract sendToUser(userId: string, payload: PushNotificationPayload): Promise<void>;
}

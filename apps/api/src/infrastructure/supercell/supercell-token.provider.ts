import { Injectable } from '@nestjs/common';

import { SupercellTokenPort } from '../../core/application/ports/supercell-token.port';
import { SupercellNotConfiguredError } from '../../core/domain/errors/integration.errors';
import { AppConfigService } from '../config/app-config.service';

/**
 * Token fixo, lido da configuracao.
 *
 * Funciona quando o IP de saida da API esta na allowlist da chave no developer
 * portal da Supercell. Como o IP de saida do Railway nao e estatico, isso exige
 * um proxy de IP fixo na frente. A alternativa - renovar a chave no boot para o
 * IP corrente - entra como um segundo adapter desta mesma porta, sem tocar no
 * gateway. Ver docs/SUPERCELL.md.
 */
@Injectable()
export class StaticSupercellTokenProvider extends SupercellTokenPort {
  constructor(private readonly config: AppConfigService) {
    super();
  }

  getToken(): Promise<string> {
    const token = this.config.supercellToken;

    if (token === undefined || token.trim() === '') {
      throw new SupercellNotConfiguredError();
    }

    return Promise.resolve(token.trim());
  }
}

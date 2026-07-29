import { Global, Module } from '@nestjs/common';

import { CachePort } from '../../core/application/ports/cache.port';
import { SupercellGatewayPort } from '../../core/application/ports/supercell-gateway.port';
import { SupercellTokenPort } from '../../core/application/ports/supercell-token.port';
import { InMemoryCacheService } from '../cache/in-memory-cache.service';
import { SupercellHttpGateway } from './supercell-http.gateway';
import { StaticSupercellTokenProvider } from './supercell-token.provider';

/**
 * Liga as portas de integracao aos adapters concretos.
 *
 * Trocar cache em memoria por Redis, ou o token estatico por renovacao
 * automatica, e mudar `useClass` aqui - nada acima desta linha muda.
 */
@Global()
@Module({
  providers: [
    { provide: CachePort, useClass: InMemoryCacheService },
    { provide: SupercellTokenPort, useClass: StaticSupercellTokenProvider },
    { provide: SupercellGatewayPort, useClass: SupercellHttpGateway },
  ],
  exports: [CachePort, SupercellTokenPort, SupercellGatewayPort],
})
export class SupercellModule {}

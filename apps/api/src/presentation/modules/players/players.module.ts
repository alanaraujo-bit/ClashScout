import { Module } from '@nestjs/common';

import { SupercellGatewayPort } from '../../../core/application/ports/supercell-gateway.port';
import { GetMyPlayerProfileUseCase } from '../../../core/application/use-cases/players/get-my-player-profile.use-case';
import { GetPlayerStatsHistoryUseCase } from '../../../core/application/use-cases/players/get-player-stats-history.use-case';
import { LinkPlayerAccountUseCase } from '../../../core/application/use-cases/players/link-player-account.use-case';
import { SyncPlayerProfileUseCase } from '../../../core/application/use-cases/players/sync-player-profile.use-case';
import { UpdatePlayStylesUseCase } from '../../../core/application/use-cases/players/update-play-styles.use-case';
import { PlayerProfileRepository } from '../../../core/domain/repositories/player-profile.repository';
import { PlayersController } from './players.controller';

/**
 * Amarracao do modulo de jogadores.
 *
 * Os casos de uso sao montados por factory para permanecerem classes puras, sem
 * decorators do Nest - a regra de arquitetura da Fase 1. Quem conhece o
 * framework e o modulo, nao o caso de uso.
 */
@Module({
  controllers: [PlayersController],
  providers: [
    {
      provide: LinkPlayerAccountUseCase,
      useFactory: (profiles: PlayerProfileRepository, supercell: SupercellGatewayPort) =>
        new LinkPlayerAccountUseCase(profiles, supercell),
      inject: [PlayerProfileRepository, SupercellGatewayPort],
    },
    {
      provide: SyncPlayerProfileUseCase,
      useFactory: (profiles: PlayerProfileRepository, supercell: SupercellGatewayPort) =>
        new SyncPlayerProfileUseCase(profiles, supercell),
      inject: [PlayerProfileRepository, SupercellGatewayPort],
    },
    {
      provide: GetMyPlayerProfileUseCase,
      useFactory: (profiles: PlayerProfileRepository) => new GetMyPlayerProfileUseCase(profiles),
      inject: [PlayerProfileRepository],
    },
    {
      provide: GetPlayerStatsHistoryUseCase,
      useFactory: (profiles: PlayerProfileRepository) => new GetPlayerStatsHistoryUseCase(profiles),
      inject: [PlayerProfileRepository],
    },
    {
      provide: UpdatePlayStylesUseCase,
      useFactory: (profiles: PlayerProfileRepository) => new UpdatePlayStylesUseCase(profiles),
      inject: [PlayerProfileRepository],
    },
  ],
})
export class PlayersModule {}

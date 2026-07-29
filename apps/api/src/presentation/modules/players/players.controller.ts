import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { PlayerProfileResponse, PlayerStatsHistoryResponse } from '@clashscout/shared';

import { GetMyPlayerProfileUseCase } from '../../../core/application/use-cases/players/get-my-player-profile.use-case';
import { GetPlayerStatsHistoryUseCase } from '../../../core/application/use-cases/players/get-player-stats-history.use-case';
import { LinkPlayerAccountUseCase } from '../../../core/application/use-cases/players/link-player-account.use-case';
import { SyncPlayerProfileUseCase } from '../../../core/application/use-cases/players/sync-player-profile.use-case';
import type { AuthenticatedUser } from '../../../core/domain/repositories/session.repository';
import { CurrentUser } from '../../http/decorators/current-user.decorator';
import { SessionGuard } from '../../http/guards/session.guard';
import { LinkPlayerAccountDto } from './dto/link-player-account.dto';
import { StatsHistoryQueryDto } from './dto/stats-history-query.dto';
import { toPlayerProfileResponse, toStatsHistoryResponse } from './player.presenter';

/**
 * Rotas do jogador logado. Todas exigem sessao - nao existe leitura de perfil
 * anonima nesta fase.
 */
@Controller({ path: 'players', version: '1' })
@UseGuards(SessionGuard)
export class PlayersController {
  constructor(
    private readonly linkAccount: LinkPlayerAccountUseCase,
    private readonly getMyProfile: GetMyPlayerProfileUseCase,
    private readonly syncProfile: SyncPlayerProfileUseCase,
    private readonly getHistory: GetPlayerStatsHistoryUseCase,
  ) {}

  /** Vincula a conta do jogo ao usuario, comprovando posse pelo API Token. */
  @Post('link')
  @HttpCode(HttpStatus.CREATED)
  async link(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: LinkPlayerAccountDto,
  ): Promise<PlayerProfileResponse> {
    const profile = await this.linkAccount.execute({
      userId: user.id,
      playerTag: body.playerTag,
      apiToken: body.apiToken,
    });

    return toPlayerProfileResponse(profile, false);
  }

  /** Perfil ja armazenado. Nao chama a Supercell. */
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<PlayerProfileResponse> {
    const profile = await this.getMyProfile.execute(user.id);

    return toPlayerProfileResponse(profile, false);
  }

  /**
   * Reatualiza a partir da Supercell. Respeita o cache: chamadas seguidas
   * devolvem `fromCache: true` sem consumir o rate limit.
   */
  @Post('me/sync')
  @HttpCode(HttpStatus.OK)
  async sync(@CurrentUser() user: AuthenticatedUser): Promise<PlayerProfileResponse> {
    const { profile, fromCache } = await this.syncProfile.execute({ userId: user.id });

    return toPlayerProfileResponse(profile, fromCache);
  }

  /** Serie temporal de evolucao, do snapshot mais recente para o mais antigo. */
  @Get('me/history')
  async history(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: StatsHistoryQueryDto,
  ): Promise<PlayerStatsHistoryResponse> {
    const { profile, snapshots } = await this.getHistory.execute(user.id, query.limit);

    return toStatsHistoryResponse(profile.playerTag, snapshots);
  }
}

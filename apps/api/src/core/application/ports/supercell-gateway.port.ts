import type { SupercellPlayer } from '../../domain/entities/player-profile.entity';
import type { PlayerTag } from '../../domain/value-objects/player-tag.vo';

export interface PlayerFetchResult {
  player: SupercellPlayer;
  /** `true` quando a resposta veio do cache e nenhuma requisicao foi feita. */
  fromCache: boolean;
}

/**
 * Porta de saida para a API oficial da Supercell.
 *
 * A camada de aplicacao nao sabe que existe HTTP, cache ou rate limit atras
 * disto - so que da para ler um jogador e verificar a posse de uma conta.
 */
export abstract class SupercellGatewayPort {
  /**
   * Le o perfil do jogador. Pode servir do cache para respeitar o rate limit.
   * @param forceRefresh ignora o cache e vai na origem.
   */
  abstract fetchPlayer(tag: PlayerTag, forceRefresh?: boolean): Promise<PlayerFetchResult>;

  /**
   * Confirma que quem enviou o `apiToken` e dono da conta `tag`.
   * Nunca usa cache: o token e de uso unico e expira em minutos.
   */
  abstract verifyPlayerToken(tag: PlayerTag, apiToken: string): Promise<boolean>;
}

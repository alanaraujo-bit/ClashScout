import type { PlayerStats, VacancyResponse } from '@clashscout/shared';
import { meetsVacancyRequirements } from '@clashscout/shared';

import type { StoredClanVacancy } from '../../../core/domain/entities/clan-vacancy.entity';
import type { StoredPlayerProfile } from '../../../core/domain/entities/player-profile.entity';

/**
 * Converte a vaga de dominio no contrato HTTP publico.
 *
 * `viewerProfile` alimenta `matchesRequirements`: `null` quando o jogador
 * logado ainda nao tem perfil vinculado, senao o resultado do matching contra
 * as proprias estatisticas.
 */
export function toVacancyResponse(
  vacancy: StoredClanVacancy,
  viewerProfile: StoredPlayerProfile | null,
): VacancyResponse {
  return {
    id: vacancy.id,
    ownerId: vacancy.ownerId,
    clanTag: vacancy.clanTag,
    clanName: vacancy.clanName,
    title: vacancy.title,
    description: vacancy.description,
    status: vacancy.status,
    minTownHallLevel: vacancy.minTownHallLevel,
    minTrophies: vacancy.minTrophies,
    minWarStars: vacancy.minWarStars,
    minBarbarianKingLevel: vacancy.minBarbarianKingLevel,
    minArcherQueenLevel: vacancy.minArcherQueenLevel,
    minMinionPrinceLevel: vacancy.minMinionPrinceLevel,
    minGrandWardenLevel: vacancy.minGrandWardenLevel,
    minRoyalChampionLevel: vacancy.minRoyalChampionLevel,
    playStyles: vacancy.playStyles,
    language: vacancy.language,
    bannerUrl: vacancy.bannerUrl,
    expiresAt: vacancy.expiresAt?.toISOString() ?? null,
    createdAt: vacancy.createdAt.toISOString(),
    updatedAt: vacancy.updatedAt.toISOString(),
    matchesRequirements:
      viewerProfile === null
        ? null
        : meetsVacancyRequirements(
            vacancy,
            vacancy.playStyles,
            viewerProfile.stats as PlayerStats,
            viewerProfile.playStyles,
          ),
    applicationsCount: vacancy.applicationsCount,
  };
}

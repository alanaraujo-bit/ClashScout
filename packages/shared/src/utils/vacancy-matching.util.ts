import type { PlayStyle } from '../enums/clash.enums';
import type { HeroLevels, PlayerStats } from '../contracts/player.contract';
import type { VacancyRequirements } from '../contracts/vacancy.contract';

/**
 * Compara os requisitos minimos de uma vaga com as estatisticas de um jogador.
 *
 * Vive em `shared` porque tanto a API (fonte da verdade, calcula o campo
 * `matchesRequirements`) quanto o frontend (poderia pre-filtrar sem round-trip)
 * precisam da mesma regra. Requisito `null` nunca reprova o jogador.
 */
export function meetsVacancyRequirements(
  requirements: VacancyRequirements,
  vacancyPlayStyles: PlayStyle[],
  stats: PlayerStats,
  playerPlayStyles: PlayStyle[],
): boolean {
  const heroMinimums: Array<[number | null, keyof HeroLevels]> = [
    [requirements.minBarbarianKingLevel, 'barbarianKing'],
    [requirements.minArcherQueenLevel, 'archerQueen'],
    [requirements.minMinionPrinceLevel, 'minionPrince'],
    [requirements.minGrandWardenLevel, 'grandWarden'],
    [requirements.minRoyalChampionLevel, 'royalChampion'],
  ];

  const heroesOk = heroMinimums.every(
    ([min, hero]) => min === null || (stats.heroes[hero] ?? 0) >= min,
  );

  const statsOk =
    (requirements.minTownHallLevel === null ||
      stats.townHallLevel >= requirements.minTownHallLevel) &&
    (requirements.minTrophies === null || stats.trophies >= requirements.minTrophies) &&
    (requirements.minWarStars === null || stats.warStars >= requirements.minWarStars);

  const playStylesOk =
    vacancyPlayStyles.length === 0 ||
    vacancyPlayStyles.some((style) => playerPlayStyles.includes(style));

  return statsOk && heroesOk && playStylesOk;
}

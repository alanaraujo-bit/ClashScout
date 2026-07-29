import type { HeroLevels } from '@clashscout/shared';

import type { SupercellPlayer } from '../../core/domain/entities/player-profile.entity';

/**
 * Forma parcial do payload de GET /players/{tag}. Declaramos apenas o que
 * consumimos - a Supercell adiciona campos sem aviso, e o payload inteiro fica
 * guardado em `rawData` de qualquer forma.
 */
interface SupercellPlayerPayload {
  tag: string;
  name: string;
  townHallLevel: number;
  townHallWeaponLevel?: number;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  donations: number;
  donationsReceived: number;
  clanCapitalContributions?: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  role?: string;
  clan?: { tag: string; name: string };
  heroes?: { name: string; level: number; village?: string }[];
}

/**
 * Nomes exatos como a Supercell os retorna (em ingles, independente do idioma
 * do jogador). Mapeados para as nossas colunas.
 */
const HERO_NAMES = {
  barbarianKing: 'Barbarian King',
  archerQueen: 'Archer Queen',
  minionPrince: 'Minion Prince',
  grandWarden: 'Grand Warden',
  royalChampion: 'Royal Champion',
} as const satisfies Record<keyof HeroLevels, string>;

function extractHeroLevels(payload: SupercellPlayerPayload): HeroLevels {
  const homeVillageHeroes = new Map(
    (payload.heroes ?? [])
      .filter((hero) => hero.village === undefined || hero.village === 'home')
      .map((hero) => [hero.name, hero.level] as const),
  );

  return {
    barbarianKing: homeVillageHeroes.get(HERO_NAMES.barbarianKing) ?? null,
    archerQueen: homeVillageHeroes.get(HERO_NAMES.archerQueen) ?? null,
    minionPrince: homeVillageHeroes.get(HERO_NAMES.minionPrince) ?? null,
    grandWarden: homeVillageHeroes.get(HERO_NAMES.grandWarden) ?? null,
    royalChampion: homeVillageHeroes.get(HERO_NAMES.royalChampion) ?? null,
  };
}

/** Traduz o payload da Supercell para o vocabulario do nosso dominio. */
export function toSupercellPlayer(raw: unknown): SupercellPlayer {
  const payload = raw as SupercellPlayerPayload;

  return {
    tag: payload.tag,
    name: payload.name,
    townHallWeaponLevel: payload.townHallWeaponLevel ?? null,
    stats: {
      townHallLevel: payload.townHallLevel,
      expLevel: payload.expLevel,
      trophies: payload.trophies,
      bestTrophies: payload.bestTrophies,
      warStars: payload.warStars,
      attackWins: payload.attackWins,
      defenseWins: payload.defenseWins,
      donations: payload.donations,
      donationsReceived: payload.donationsReceived,
      clanCapitalContributions: payload.clanCapitalContributions ?? 0,
      heroes: extractHeroLevels(payload),
      builderHallLevel: payload.builderHallLevel ?? null,
      builderBaseTrophies: payload.builderBaseTrophies ?? null,
    },
    clan:
      payload.clan === undefined
        ? null
        : {
            tag: payload.clan.tag,
            name: payload.clan.name,
            // No payload do jogador, `role` e o cargo dele dentro do cla.
            role: payload.role ?? null,
          },
    raw,
  };
}

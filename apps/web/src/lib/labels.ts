import { PlayStyle } from '@clashscout/shared';

export const PLAY_STYLE_LABEL: Record<PlayStyle, string> = {
  [PlayStyle.WAR]: 'Guerra',
  [PlayStyle.FARMING]: 'Farm',
  [PlayStyle.CWL]: 'Liga de Guerra',
  [PlayStyle.CLAN_GAMES]: 'Jogos do Cla',
  [PlayStyle.CASUAL]: 'Casual',
};

export const HERO_LABEL = {
  barbarianKing: 'Rei Barbaro',
  archerQueen: 'Arqueira Rainha',
  minionPrince: 'Principe Duende',
  grandWarden: 'Grande Guardiao',
  royalChampion: 'Campea Real',
} as const;

import type { VacancyResponse } from '@clashscout/shared';

import { Badge } from '@/components/ui/badge';
import { HERO_LABEL, PLAY_STYLE_LABEL } from '@/lib/labels';

const HERO_REQUIREMENT_KEYS = [
  ['minBarbarianKingLevel', 'barbarianKing'],
  ['minArcherQueenLevel', 'archerQueen'],
  ['minMinionPrinceLevel', 'minionPrince'],
  ['minGrandWardenLevel', 'grandWarden'],
  ['minRoyalChampionLevel', 'royalChampion'],
] as const;

/** Badges com os requisitos minimos de uma vaga - so mostra o que foi exigido. */
export function VacancyRequirements({ vacancy }: { vacancy: VacancyResponse }) {
  const badges: string[] = [];

  if (vacancy.minTownHallLevel !== null) badges.push(`CV ${vacancy.minTownHallLevel}+`);
  if (vacancy.minTrophies !== null) badges.push(`${vacancy.minTrophies}+ trofeus`);
  if (vacancy.minWarStars !== null) badges.push(`${vacancy.minWarStars}+ estrelas de guerra`);

  for (const [minKey, heroKey] of HERO_REQUIREMENT_KEYS) {
    const min = vacancy[minKey];
    if (min !== null) badges.push(`${HERO_LABEL[heroKey]} ${min}+`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <Badge key={badge}>{badge}</Badge>
      ))}
      {vacancy.playStyles.map((style) => (
        <Badge key={style} tone="accent">
          {PLAY_STYLE_LABEL[style]}
        </Badge>
      ))}
      {vacancy.language && <Badge>{vacancy.language}</Badge>}
    </div>
  );
}

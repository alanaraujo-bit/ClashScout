import { PlayStyle } from '@clashscout/shared';

import { Button } from '@/components/ui/button';
import { CheckboxChip } from '@/components/ui/checkbox-chip';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PLAY_STYLE_LABEL } from '@/lib/labels';

export interface VacancyFiltersProps {
  townHallLevel?: string;
  playStyles: string[];
  language?: string;
}

/**
 * Form GET puro (sem JS) - o navegador navega para `/vacancies?...` e o Server
 * Component recalcula o feed. Evita qualquer estado de cliente so para filtrar.
 */
export function VacancyFilters({ townHallLevel, playStyles, language }: VacancyFiltersProps) {
  return (
    <form
      method="GET"
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-separator)] p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select name="townHallLevel" defaultValue={townHallLevel ?? ''} className="sm:max-w-48">
          <option value="">Qualquer nivel de CV</option>
          {Array.from({ length: 17 }, (_, index) => index + 1).map((level) => (
            <option key={level} value={level}>
              Ate CV {level}
            </option>
          ))}
        </Select>
        <Input
          name="language"
          placeholder="Idioma (ex: pt-BR)"
          defaultValue={language}
          className="sm:max-w-56"
        />
        <Button type="submit" variant="secondary" className="sm:ml-auto">
          Filtrar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.values(PlayStyle).map((style) => (
          <CheckboxChip
            key={style}
            name="playStyles"
            value={style}
            label={PLAY_STYLE_LABEL[style]}
            defaultChecked={playStyles.includes(style)}
          />
        ))}
      </div>
    </form>
  );
}

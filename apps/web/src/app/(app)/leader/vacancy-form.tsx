'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { PlayStyle, type VacancyResponse } from '@clashscout/shared';

import { Button } from '@/components/ui/button';
import { ChipToggle } from '@/components/ui/chip-toggle';
import { Field, FieldError, Label } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PLAY_STYLE_LABEL } from '@/lib/labels';

import type { VacancyFormState } from './actions';

const INITIAL_STATE: VacancyFormState = { error: null };

export interface VacancyFormProps {
  action: (state: VacancyFormState, formData: FormData) => Promise<VacancyFormState>;
  initial?: VacancyResponse;
  submitLabel: string;
}

export function VacancyForm({ action, initial, submitLabel }: VacancyFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);
  const [playStyles, setPlayStyles] = useState<PlayStyle[]>(initial?.playStyles ?? []);

  function toggleStyle(style: PlayStyle) {
    setPlayStyles((current) =>
      current.includes(style) ? current.filter((entry) => entry !== style) : [...current, style],
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="clanTag">Tag do cla</Label>
          <Input
            id="clanTag"
            name="clanTag"
            placeholder="#CLAN123"
            defaultValue={initial?.clanTag}
            required
          />
        </Field>
        <Field>
          <Label htmlFor="clanName">Nome do cla</Label>
          <Input id="clanName" name="clanName" defaultValue={initial?.clanName} required />
        </Field>
      </div>

      <Field>
        <Label htmlFor="title">Titulo da vaga</Label>
        <Input
          id="title"
          name="title"
          placeholder="Buscamos atacantes para guerra"
          defaultValue={initial?.title}
          required
        />
      </Field>

      <Field>
        <Label htmlFor="description">Descricao</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Conte sobre o cla, expectativas e o que voces oferecem"
          defaultValue={initial?.description}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field>
          <Label htmlFor="minTownHallLevel">CV minimo</Label>
          <Select
            id="minTownHallLevel"
            name="minTownHallLevel"
            defaultValue={initial?.minTownHallLevel ?? ''}
          >
            <option value="">Sem exigencia</option>
            {Array.from({ length: 17 }, (_, index) => index + 1).map((level) => (
              <option key={level} value={level}>
                CV {level}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="minTrophies">Trofeus minimos</Label>
          <Input
            id="minTrophies"
            name="minTrophies"
            type="number"
            min={0}
            defaultValue={initial?.minTrophies ?? ''}
          />
        </Field>
        <Field>
          <Label htmlFor="minWarStars">Estrelas de guerra minimas</Label>
          <Input
            id="minWarStars"
            name="minWarStars"
            type="number"
            min={0}
            defaultValue={initial?.minWarStars ?? ''}
          />
        </Field>
      </div>

      <details className="rounded-xl border border-[var(--color-separator)] p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Requisitos de herois (opcional)
        </summary>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field>
            <Label htmlFor="minBarbarianKingLevel">Rei Barbaro</Label>
            <Input
              id="minBarbarianKingLevel"
              name="minBarbarianKingLevel"
              type="number"
              min={0}
              defaultValue={initial?.minBarbarianKingLevel ?? ''}
            />
          </Field>
          <Field>
            <Label htmlFor="minArcherQueenLevel">Arqueira Rainha</Label>
            <Input
              id="minArcherQueenLevel"
              name="minArcherQueenLevel"
              type="number"
              min={0}
              defaultValue={initial?.minArcherQueenLevel ?? ''}
            />
          </Field>
          <Field>
            <Label htmlFor="minMinionPrinceLevel">Principe Duende</Label>
            <Input
              id="minMinionPrinceLevel"
              name="minMinionPrinceLevel"
              type="number"
              min={0}
              defaultValue={initial?.minMinionPrinceLevel ?? ''}
            />
          </Field>
          <Field>
            <Label htmlFor="minGrandWardenLevel">Grande Guardiao</Label>
            <Input
              id="minGrandWardenLevel"
              name="minGrandWardenLevel"
              type="number"
              min={0}
              defaultValue={initial?.minGrandWardenLevel ?? ''}
            />
          </Field>
          <Field>
            <Label htmlFor="minRoyalChampionLevel">Campea Real</Label>
            <Input
              id="minRoyalChampionLevel"
              name="minRoyalChampionLevel"
              type="number"
              min={0}
              defaultValue={initial?.minRoyalChampionLevel ?? ''}
            />
          </Field>
        </div>
      </details>

      <Field>
        <Label>Foco do cla</Label>
        <div className="flex flex-wrap gap-2">
          {Object.values(PlayStyle).map((style) => (
            <ChipToggle
              key={style}
              type="button"
              active={playStyles.includes(style)}
              onClick={() => toggleStyle(style)}
            >
              {PLAY_STYLE_LABEL[style]}
            </ChipToggle>
          ))}
        </div>
        {playStyles.map((style) => (
          <input key={style} type="hidden" name="playStyles" value={style} />
        ))}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="language">Idioma do cla</Label>
          <Input
            id="language"
            name="language"
            placeholder="pt-BR"
            defaultValue={initial?.language ?? ''}
          />
        </Field>
        <Field>
          <Label htmlFor="expiresAt">Vaga expira em</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="date"
            defaultValue={initial?.expiresAt ? initial.expiresAt.slice(0, 10) : ''}
          />
        </Field>
      </div>

      {state.error && <FieldError>{state.error}</FieldError>}

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="self-start">
      {pending ? 'Salvando...' : label}
    </Button>
  );
}

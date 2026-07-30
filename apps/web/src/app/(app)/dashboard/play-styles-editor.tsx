'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { PlayStyle } from '@clashscout/shared';

import { Button } from '@/components/ui/button';
import { ChipToggle } from '@/components/ui/chip-toggle';
import { PLAY_STYLE_LABEL } from '@/lib/labels';

import { updatePlayStylesAction } from './actions';

export function PlayStylesEditor({ initial }: { initial: PlayStyle[] }) {
  const [selected, setSelected] = useState<PlayStyle[]>(initial);

  function toggle(style: PlayStyle) {
    setSelected((current) =>
      current.includes(style) ? current.filter((entry) => entry !== style) : [...current, style],
    );
  }

  return (
    <form action={updatePlayStylesAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {Object.values(PlayStyle).map((style) => (
          <label key={style}>
            <input
              type="checkbox"
              name="playStyles"
              value={style}
              checked={selected.includes(style)}
              onChange={() => toggle(style)}
              className="sr-only"
            />
            <ChipToggle
              active={selected.includes(style)}
              onClick={() => toggle(style)}
              type="button"
            >
              {PLAY_STYLE_LABEL[style]}
            </ChipToggle>
          </label>
        ))}
      </div>
      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending} className="self-start">
      {pending ? 'Salvando...' : 'Salvar estilo de jogo'}
    </Button>
  );
}

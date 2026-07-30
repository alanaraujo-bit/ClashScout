'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface ChipToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

/** Chip de selecao para filtros de multipla escolha (ex.: foco do cla). */
export function ChipToggle({ active, className, ...props }: ChipToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-200',
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : 'border-[var(--color-separator)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-elevated)]',
        className,
      )}
      {...props}
    />
  );
}

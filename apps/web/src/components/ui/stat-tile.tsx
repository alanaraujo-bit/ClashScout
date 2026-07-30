import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function StatTile({ label, value, icon, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-2xl border border-[var(--color-separator)] bg-[var(--color-surface)] p-4',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
        {icon}
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
    </div>
  );
}

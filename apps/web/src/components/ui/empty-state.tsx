import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-separator)] px-6 py-16 text-center">
      {icon && <div className="text-[var(--color-ink-muted)]">{icon}</div>}
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">{description}</p>
      )}
      {action}
    </div>
  );
}

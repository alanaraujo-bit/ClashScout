import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]',
        accent: 'bg-[var(--color-accent)]/12 text-[var(--color-accent)]',
        success: 'bg-green-500/12 text-green-600 dark:text-green-400',
        warning: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
        danger: 'bg-red-500/12 text-red-600 dark:text-red-400',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

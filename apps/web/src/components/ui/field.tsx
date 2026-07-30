import type { HTMLAttributes, LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium text-[var(--color-ink-muted)]', className)}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-red-500', className)} {...props} />;
}

export function FieldHint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-[var(--color-ink-muted)]', className)} {...props} />;
}

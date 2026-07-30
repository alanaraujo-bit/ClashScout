import { type InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-[var(--color-separator)] bg-[var(--color-surface)] px-4 text-[0.95rem]',
        'text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]',
        'transition-colors duration-200 focus:border-[var(--color-accent)] focus:outline-none',
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

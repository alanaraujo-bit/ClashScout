import { type TextareaHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/cn';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-xl border border-[var(--color-separator)] bg-[var(--color-surface)] px-4 py-3 text-[0.95rem]',
      'text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]',
      'transition-colors duration-200 focus:border-[var(--color-accent)] focus:outline-none',
      'disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

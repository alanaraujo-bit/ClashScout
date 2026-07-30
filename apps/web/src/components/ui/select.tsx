import { type SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-[var(--color-separator)] bg-[var(--color-surface)]',
          'px-4 pr-10 text-[0.95rem] text-[var(--color-ink)]',
          'transition-colors duration-200 focus:border-[var(--color-accent)] focus:outline-none',
          'disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[var(--color-ink-muted)]"
        aria-hidden
      />
    </div>
  ),
);
Select.displayName = 'Select';

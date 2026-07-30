import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
    'transition-[background-color,color,transform,opacity] duration-200 ease-[var(--ease-standard)] ' +
    'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-accent)] text-white hover:brightness-110',
        secondary:
          'bg-[var(--color-surface-elevated)] text-[var(--color-ink)] hover:brightness-95 ' +
          'border border-[var(--color-separator)]',
        ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-elevated)]',
        destructive: 'bg-red-500 text-white hover:brightness-110',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-[0.95rem]',
        lg: 'h-13 px-6 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface NavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  /** Layout compacto (icone + texto minusculo empilhados) para a barra mobile. */
  compact?: boolean;
}

export function NavLink({ href, icon, label, compact }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-200',
          active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]',
        )}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
        active
          ? 'bg-[var(--color-accent)]/12 text-[var(--color-accent)]'
          : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-elevated)]',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

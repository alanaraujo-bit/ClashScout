import { Briefcase, LayoutDashboard, ListChecks, LogOut, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Session } from 'next-auth';

import { signOut } from '@/auth';
import { APP_NAME } from '@clashscout/shared';

import { NavLink } from './nav-link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Perfil', icon: <LayoutDashboard className="size-5" /> },
  { href: '/vacancies', label: 'Vagas', icon: <Briefcase className="size-5" /> },
  { href: '/applications', label: 'Candidaturas', icon: <ListChecks className="size-5" /> },
  { href: '/leader', label: 'Recrutar', icon: <Users className="size-5" /> },
];

export interface AppShellProps {
  user: NonNullable<Session['user']>;
  children: ReactNode;
}

/**
 * Casca responsiva do app: sidebar fixa no desktop, barra de abas no rodape
 * no mobile. O conteudo (Server Components das paginas) e o `children`.
 */
export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-separator)] p-4 md:flex">
        <div className="px-2 py-4 text-lg font-semibold tracking-tight">{APP_NAME}</div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-[var(--color-separator)] px-2 pt-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-[var(--color-ink-muted)]">{user.email}</span>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type="submit"
              aria-label="Sair"
              className="rounded-lg p-2 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-elevated)]"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-[var(--color-separator)] bg-[var(--color-surface)]/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} compact />
        ))}
      </nav>
    </div>
  );
}

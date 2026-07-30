import { Castle, Hammer, Shield, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { HERO_LABEL } from '@/lib/labels';
import { getCurrentPlayerProfile } from '@/lib/current-profile';

import { PlayStylesEditor } from './play-styles-editor';
import { SyncButton } from './sync-button';

export default async function DashboardPage() {
  const profile = await getCurrentPlayerProfile();

  // O layout do grupo (app) ja garante que existe perfil antes de renderizar a pagina.
  if (profile === null) {
    return null;
  }

  const heroes = Object.entries(profile.stats.heroes).filter(
    (entry): entry is [keyof typeof HERO_LABEL, number] => entry[1] !== null,
  );

  const lastSynced = profile.lastSyncedAt
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(profile.lastSyncedAt),
      )
    : 'nunca';

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CardTitle>{profile.name}</CardTitle>
              {profile.verifiedAt ? (
                <Badge tone="success">
                  <ShieldCheck className="size-3.5" /> Verificado
                </Badge>
              ) : (
                <Badge tone="warning">Nao verificado</Badge>
              )}
            </div>
            <p className="text-sm text-[var(--color-ink-muted)]">{profile.playerTag}</p>
            {profile.clan && (
              <p className="text-sm text-[var(--color-ink-muted)]">
                Cla atual: <span className="text-[var(--color-ink)]">{profile.clan.name}</span>
                {profile.clan.role && ` (${profile.clan.role})`}
              </p>
            )}
          </div>
          <SyncButton />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile
              label="Nivel do CV"
              value={profile.stats.townHallLevel}
              icon={<Castle className="size-4" />}
            />
            <StatTile
              label="Trofeus"
              value={profile.stats.trophies.toLocaleString('pt-BR')}
              icon={<Trophy className="size-4" />}
            />
            <StatTile
              label="Estrelas de guerra"
              value={profile.stats.warStars.toLocaleString('pt-BR')}
              icon={<Swords className="size-4" />}
            />
            <StatTile
              label="Melhor troféu"
              value={profile.stats.bestTrophies.toLocaleString('pt-BR')}
              icon={<Trophy className="size-4" />}
            />
            <StatTile
              label="Doacoes"
              value={profile.stats.donations.toLocaleString('pt-BR')}
              icon={<Sparkles className="size-4" />}
            />
            {profile.stats.builderHallLevel !== null && (
              <StatTile
                label="Vila do construtor"
                value={profile.stats.builderHallLevel}
                icon={<Hammer className="size-4" />}
              />
            )}
          </div>
          <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
            Ultima sincronizacao: {lastSynced}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" /> Herois
          </CardTitle>
        </CardHeader>
        <CardContent>
          {heroes.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Nenhum heroi desbloqueado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {heroes.map(([hero, level]) => (
                <StatTile key={hero} label={HERO_LABEL[hero]} value={level} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estilo de jogo</CardTitle>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Usamos isso para mostrar o quanto voce combina com cada vaga.
          </p>
        </CardHeader>
        <CardContent>
          <PlayStylesEditor initial={profile.playStyles} />
        </CardContent>
      </Card>
    </div>
  );
}

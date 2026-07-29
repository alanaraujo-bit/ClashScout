import type { PlayerStats } from '@clashscout/shared';

import type {
  StoredPlayerProfile,
  StoredPlayerStatsSnapshot,
  SupercellPlayer,
} from '../../../domain/entities/player-profile.entity';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import {
  PlayerProfileRepository,
  type UpsertPlayerProfileInput,
} from '../../../domain/repositories/player-profile.repository';
import { SupercellGatewayPort, type PlayerFetchResult } from '../../ports/supercell-gateway.port';
import { SyncPlayerProfileUseCase } from './sync-player-profile.use-case';

const stats: PlayerStats = {
  townHallLevel: 16,
  expLevel: 220,
  trophies: 4100,
  bestTrophies: 4300,
  warStars: 1700,
  attackWins: 55,
  defenseWins: 8,
  donations: 1200,
  donationsReceived: 900,
  clanCapitalContributions: 30000,
  heroes: {
    barbarianKing: 95,
    archerQueen: 95,
    minionPrince: 10,
    grandWarden: 70,
    royalChampion: 45,
  },
  builderHallLevel: 10,
  builderBaseTrophies: 4500,
};

const existingProfile: StoredPlayerProfile = {
  id: 'profile-1',
  userId: 'user-1',
  playerTag: '#2PP0JCCL',
  name: 'Alan',
  verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
  townHallWeaponLevel: 5,
  stats,
  clan: null,
  playStyles: [],
  lastSyncedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const player: SupercellPlayer = {
  tag: '#2PP0JCCL',
  name: 'Alan',
  townHallWeaponLevel: 5,
  stats,
  clan: { tag: '#CLAN123', name: 'Vanguard', role: 'member' },
  raw: {},
};

class ProfileRepositoryFake extends PlayerProfileRepository {
  profile: StoredPlayerProfile | null = existingProfile;
  snapshots: StoredPlayerStatsSnapshot[] = [];
  lastUpsert: UpsertPlayerProfileInput | null = null;

  findByUserId(): Promise<StoredPlayerProfile | null> {
    return Promise.resolve(this.profile);
  }

  findByPlayerTag(): Promise<StoredPlayerProfile | null> {
    return Promise.resolve(this.profile);
  }

  upsertForUser(input: UpsertPlayerProfileInput): Promise<StoredPlayerProfile> {
    this.lastUpsert = input;

    return Promise.resolve({
      ...existingProfile,
      stats: input.player.stats,
      clan: input.player.clan,
      lastSyncedAt: input.syncedAt,
    });
  }

  appendSnapshot(_profileId: string, snapshot: StoredPlayerStatsSnapshot): Promise<void> {
    this.snapshots.push(snapshot);
    return Promise.resolve();
  }

  listHistory(): Promise<StoredPlayerStatsSnapshot[]> {
    return Promise.resolve([]);
  }
}

class SupercellGatewayFake extends SupercellGatewayPort {
  fromCache = false;

  fetchPlayer(): Promise<PlayerFetchResult> {
    return Promise.resolve({ player, fromCache: this.fromCache });
  }

  verifyPlayerToken(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe('SyncPlayerProfileUseCase', () => {
  let profiles: ProfileRepositoryFake;
  let supercell: SupercellGatewayFake;
  let useCase: SyncPlayerProfileUseCase;

  beforeEach(() => {
    profiles = new ProfileRepositoryFake();
    supercell = new SupercellGatewayFake();
    useCase = new SyncPlayerProfileUseCase(profiles, supercell);
  });

  it('grava snapshot quando os dados vieram da Supercell', async () => {
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.fromCache).toBe(false);
    expect(profiles.snapshots).toHaveLength(1);
  });

  it('NAO grava snapshot quando a leitura veio do cache', async () => {
    supercell.fromCache = true;

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.fromCache).toBe(true);
    // Um ponto repetido com os mesmos numeros sujaria a serie temporal.
    expect(profiles.snapshots).toHaveLength(0);
  });

  it('nunca altera verifiedAt em um sync', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(profiles.lastUpsert?.verifiedAt).toBeUndefined();
  });

  it('falha quando o usuario nao tem conta vinculada', async () => {
    profiles.profile = null;

    await expect(useCase.execute({ userId: 'user-sem-perfil' })).rejects.toBeInstanceOf(
      PlayerProfileNotFoundError,
    );
  });
});

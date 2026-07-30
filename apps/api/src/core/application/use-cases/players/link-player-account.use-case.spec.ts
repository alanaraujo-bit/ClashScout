import type { PlayerStats } from '@clashscout/shared';

import type {
  StoredPlayerProfile,
  StoredPlayerStatsSnapshot,
  SupercellPlayer,
} from '../../../domain/entities/player-profile.entity';
import {
  PlayerTagAlreadyLinkedError,
  PlayerTagInvalidError,
  PlayerTokenVerificationFailedError,
} from '../../../domain/errors/player.errors';
import {
  PlayerProfileRepository,
  type UpsertPlayerProfileInput,
} from '../../../domain/repositories/player-profile.repository';
import type { PlayerTag } from '../../../domain/value-objects/player-tag.vo';
import { SupercellGatewayPort, type PlayerFetchResult } from '../../ports/supercell-gateway.port';
import { LinkPlayerAccountUseCase } from './link-player-account.use-case';

const stats: PlayerStats = {
  townHallLevel: 15,
  expLevel: 200,
  trophies: 3000,
  bestTrophies: 3200,
  warStars: 1500,
  attackWins: 40,
  defenseWins: 5,
  donations: 800,
  donationsReceived: 700,
  clanCapitalContributions: 12000,
  heroes: {
    barbarianKing: 90,
    archerQueen: 90,
    minionPrince: null,
    grandWarden: 65,
    royalChampion: 40,
  },
  builderHallLevel: 10,
  builderBaseTrophies: 4000,
};

const player: SupercellPlayer = {
  tag: '#2PP0JCCL',
  name: 'Alan',
  townHallWeaponLevel: 5,
  stats,
  clan: { tag: '#CLAN123', name: 'Vanguard', role: 'coLeader' },
  raw: { tag: '#2PP0JCCL' },
};

class ProfileRepositoryFake extends PlayerProfileRepository {
  byTag: StoredPlayerProfile | null = null;
  upserted: UpsertPlayerProfileInput | null = null;
  snapshots: StoredPlayerStatsSnapshot[] = [];

  findByUserId(): Promise<StoredPlayerProfile | null> {
    return Promise.resolve(null);
  }

  findByPlayerTag(): Promise<StoredPlayerProfile | null> {
    return Promise.resolve(this.byTag);
  }

  upsertForUser(input: UpsertPlayerProfileInput): Promise<StoredPlayerProfile> {
    this.upserted = input;

    return Promise.resolve({
      id: 'profile-1',
      userId: input.userId,
      playerTag: input.player.tag,
      name: input.player.name,
      verifiedAt: input.verifiedAt ?? null,
      townHallWeaponLevel: input.player.townHallWeaponLevel,
      stats: input.player.stats,
      clan: input.player.clan,
      playStyles: [],
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

  updatePlayStyles(): Promise<StoredPlayerProfile> {
    return Promise.reject(new Error('nao usado neste teste'));
  }
}

class SupercellGatewayFake extends SupercellGatewayPort {
  tokenIsValid = true;
  fetchCalls: { tag: string; forceRefresh?: boolean }[] = [];
  verifyCalls = 0;

  fetchPlayer(tag: PlayerTag, forceRefresh?: boolean): Promise<PlayerFetchResult> {
    this.fetchCalls.push({ tag: tag.value, forceRefresh });
    return Promise.resolve({ player, fromCache: false });
  }

  verifyPlayerToken(): Promise<boolean> {
    this.verifyCalls++;
    return Promise.resolve(this.tokenIsValid);
  }
}

describe('LinkPlayerAccountUseCase', () => {
  let profiles: ProfileRepositoryFake;
  let supercell: SupercellGatewayFake;
  let useCase: LinkPlayerAccountUseCase;

  beforeEach(() => {
    profiles = new ProfileRepositoryFake();
    supercell = new SupercellGatewayFake();
    useCase = new LinkPlayerAccountUseCase(profiles, supercell);
  });

  it('vincula a conta, marca como verificada e grava o primeiro snapshot', async () => {
    const profile = await useCase.execute({
      userId: 'user-1',
      playerTag: '2pp0jccl',
      apiToken: 'token-do-jogo',
    });

    // Tag normalizada pelo value object, mesmo recebendo minuscula e sem `#`.
    expect(profile.playerTag).toBe('#2PP0JCCL');
    expect(profile.verifiedAt).toBeInstanceOf(Date);
    expect(profiles.snapshots).toHaveLength(1);
    expect(profiles.snapshots[0]?.stats.trophies).toBe(3000);
    expect(profiles.snapshots[0]?.clanTag).toBe('#CLAN123');
  });

  it('busca direto na origem, ignorando o cache, no momento da vinculacao', async () => {
    await useCase.execute({ userId: 'user-1', playerTag: '#2PP0JCCL', apiToken: 'token' });

    expect(supercell.fetchCalls).toEqual([{ tag: '#2PP0JCCL', forceRefresh: true }]);
  });

  it('rejeita tag em formato invalido antes de qualquer chamada externa', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', playerTag: '#IIIOOO', apiToken: 'token' }),
    ).rejects.toBeInstanceOf(PlayerTagInvalidError);

    expect(supercell.verifyCalls).toBe(0);
  });

  it('rejeita tag ja vinculada a outro usuario sem queimar o API Token', async () => {
    profiles.byTag = {
      id: 'outro',
      userId: 'user-2',
      playerTag: '#2PP0JCCL',
      name: 'Outro',
      verifiedAt: new Date(),
      townHallWeaponLevel: null,
      stats,
      clan: null,
      playStyles: [],
      lastSyncedAt: null,
    };

    await expect(
      useCase.execute({ userId: 'user-1', playerTag: '#2PP0JCCL', apiToken: 'token' }),
    ).rejects.toBeInstanceOf(PlayerTagAlreadyLinkedError);

    // O token do jogador e de uso unico: nao pode ser gasto num pedido que
    // ja sabemos que vai falhar.
    expect(supercell.verifyCalls).toBe(0);
  });

  it('permite revincular a mesma tag ao mesmo usuario', async () => {
    profiles.byTag = {
      id: 'profile-1',
      userId: 'user-1',
      playerTag: '#2PP0JCCL',
      name: 'Alan',
      verifiedAt: null,
      townHallWeaponLevel: null,
      stats,
      clan: null,
      playStyles: [],
      lastSyncedAt: null,
    };

    await expect(
      useCase.execute({ userId: 'user-1', playerTag: '#2PP0JCCL', apiToken: 'token' }),
    ).resolves.toMatchObject({ userId: 'user-1' });
  });

  it('rejeita quando a Supercell nao confirma a posse da conta', async () => {
    supercell.tokenIsValid = false;

    await expect(
      useCase.execute({ userId: 'user-1', playerTag: '#2PP0JCCL', apiToken: 'errado' }),
    ).rejects.toBeInstanceOf(PlayerTokenVerificationFailedError);

    expect(profiles.upserted).toBeNull();
  });
});

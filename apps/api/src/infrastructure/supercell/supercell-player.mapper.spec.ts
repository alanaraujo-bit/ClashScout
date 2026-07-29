import { toSupercellPlayer } from './supercell-player.mapper';

/** Recorte real de GET /players/{tag}, reduzido ao que consumimos. */
const payload = {
  tag: '#2PP0JCCL',
  name: 'Alan',
  townHallLevel: 16,
  townHallWeaponLevel: 5,
  expLevel: 220,
  trophies: 4100,
  bestTrophies: 4300,
  warStars: 1700,
  attackWins: 55,
  defenseWins: 8,
  donations: 1200,
  donationsReceived: 900,
  clanCapitalContributions: 30000,
  builderHallLevel: 10,
  builderBaseTrophies: 4500,
  role: 'coLeader',
  clan: { tag: '#CLAN123', name: 'Vanguard' },
  heroes: [
    { name: 'Barbarian King', level: 95, village: 'home' },
    { name: 'Archer Queen', level: 94, village: 'home' },
    { name: 'Grand Warden', level: 70, village: 'home' },
    { name: 'Royal Champion', level: 45, village: 'home' },
    { name: 'Battle Machine', level: 35, village: 'builderBase' },
  ],
};

describe('toSupercellPlayer', () => {
  it('extrai os niveis dos herois da vila principal', () => {
    const player = toSupercellPlayer(payload);

    expect(player.stats.heroes).toEqual({
      barbarianKing: 95,
      archerQueen: 94,
      grandWarden: 70,
      royalChampion: 45,
      // Nao desbloqueado: ausente no payload, null no dominio.
      minionPrince: null,
    });
  });

  it('ignora herois da base do construtor na contagem da vila principal', () => {
    const player = toSupercellPlayer(payload);

    expect(Object.values(player.stats.heroes)).not.toContain(35);
  });

  it('usa o `role` do jogador como cargo dele no cla', () => {
    const player = toSupercellPlayer(payload);

    expect(player.clan).toEqual({ tag: '#CLAN123', name: 'Vanguard', role: 'coLeader' });
  });

  it('trata jogador sem cla', () => {
    const { clan: _clan, role: _role, ...semCla } = payload;

    expect(toSupercellPlayer(semCla).clan).toBeNull();
  });

  it('assume zero quando clanCapitalContributions nao vem no payload', () => {
    const { clanCapitalContributions: _omitido, ...semContribuicao } = payload;

    expect(toSupercellPlayer(semContribuicao).stats.clanCapitalContributions).toBe(0);
  });

  it('preserva o payload original em `raw`', () => {
    expect(toSupercellPlayer(payload).raw).toBe(payload);
  });
});

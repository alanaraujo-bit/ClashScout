import {
  PlayStyle as PrismaPlayStyle,
  UserRole as PrismaUserRole,
  VacancyStatus as PrismaVacancyStatus,
} from '@clashscout/database';
import { PlayStyle, UserRole, VacancyStatus } from '@clashscout/shared';

/**
 * O schema Prisma redeclara os enums de dominio porque o Prisma nao consegue
 * importar tipos de TypeScript. Isso cria a chance de os dois divergirem em
 * silencio - e o repositorio faz cast entre eles (`row.playStyles as PlayStyle[]`),
 * de forma que a divergencia passaria pelo compilador e explodiria em runtime.
 *
 * Este teste e a rede de seguranca: adicionar um valor num lado e esquecer o
 * outro quebra o build.
 */
describe('enums do Prisma x @clashscout/shared', () => {
  const sortedValues = (enumObject: Record<string, string>): string[] =>
    Object.values(enumObject).sort();

  it('UserRole tem exatamente os mesmos valores', () => {
    expect(sortedValues(PrismaUserRole)).toEqual(sortedValues(UserRole));
  });

  it('PlayStyle tem exatamente os mesmos valores', () => {
    expect(sortedValues(PrismaPlayStyle)).toEqual(sortedValues(PlayStyle));
  });

  it('VacancyStatus tem exatamente os mesmos valores', () => {
    expect(sortedValues(PrismaVacancyStatus)).toEqual(sortedValues(VacancyStatus));
  });
});

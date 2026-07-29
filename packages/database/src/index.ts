/**
 * Reexporta o client gerado pelo Prisma para que os apps dependam de
 * `@clashscout/database` e nunca de `@prisma/client` direto. Isso mantem um
 * unico ponto de troca se o ORM ou o driver mudar.
 */
export * from '@prisma/client';
export { createPrismaClient, type CreatePrismaClientOptions } from './create-client';

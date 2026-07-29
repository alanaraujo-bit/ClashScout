-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'LEADER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlayStyle" AS ENUM ('WAR', 'FARMING', 'CWL', 'CLAN_GAMES', 'CASUAL');

-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerTag" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "townHallLevel" INTEGER NOT NULL,
    "townHallWeaponLevel" INTEGER,
    "expLevel" INTEGER NOT NULL,
    "trophies" INTEGER NOT NULL,
    "bestTrophies" INTEGER NOT NULL,
    "warStars" INTEGER NOT NULL,
    "attackWins" INTEGER NOT NULL,
    "defenseWins" INTEGER NOT NULL,
    "donations" INTEGER NOT NULL,
    "donationsReceived" INTEGER NOT NULL,
    "clanCapitalContributions" INTEGER NOT NULL DEFAULT 0,
    "barbarianKingLevel" INTEGER,
    "archerQueenLevel" INTEGER,
    "minionPrinceLevel" INTEGER,
    "grandWardenLevel" INTEGER,
    "royalChampionLevel" INTEGER,
    "builderHallLevel" INTEGER,
    "builderBaseTrophies" INTEGER,
    "battleMachineLevel" INTEGER,
    "battleCopterLevel" INTEGER,
    "clanTag" TEXT,
    "clanName" TEXT,
    "clanRole" TEXT,
    "playStyles" "PlayStyle"[],
    "rawData" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatsHistory" (
    "id" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "townHallLevel" INTEGER NOT NULL,
    "expLevel" INTEGER NOT NULL,
    "trophies" INTEGER NOT NULL,
    "bestTrophies" INTEGER NOT NULL,
    "warStars" INTEGER NOT NULL,
    "attackWins" INTEGER NOT NULL,
    "defenseWins" INTEGER NOT NULL,
    "donations" INTEGER NOT NULL,
    "donationsReceived" INTEGER NOT NULL,
    "clanCapitalContributions" INTEGER NOT NULL DEFAULT 0,
    "barbarianKingLevel" INTEGER,
    "archerQueenLevel" INTEGER,
    "minionPrinceLevel" INTEGER,
    "grandWardenLevel" INTEGER,
    "royalChampionLevel" INTEGER,
    "builderHallLevel" INTEGER,
    "builderBaseTrophies" INTEGER,
    "clanTag" TEXT,

    CONSTRAINT "PlayerStatsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanVacancy" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clanTag" TEXT NOT NULL,
    "clanName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
    "minTownHallLevel" INTEGER,
    "minTrophies" INTEGER,
    "minWarStars" INTEGER,
    "minBarbarianKingLevel" INTEGER,
    "minArcherQueenLevel" INTEGER,
    "minMinionPrinceLevel" INTEGER,
    "minGrandWardenLevel" INTEGER,
    "minRoyalChampionLevel" INTEGER,
    "playStyles" "PlayStyle"[],
    "language" TEXT,
    "bannerUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanVacancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_playerTag_key" ON "PlayerProfile"("playerTag");

-- CreateIndex
CREATE INDEX "PlayerProfile_townHallLevel_trophies_idx" ON "PlayerProfile"("townHallLevel", "trophies");

-- CreateIndex
CREATE INDEX "PlayerProfile_clanTag_idx" ON "PlayerProfile"("clanTag");

-- CreateIndex
CREATE INDEX "PlayerProfile_verifiedAt_idx" ON "PlayerProfile"("verifiedAt");

-- CreateIndex
CREATE INDEX "PlayerStatsHistory_playerProfileId_capturedAt_idx" ON "PlayerStatsHistory"("playerProfileId", "capturedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatsHistory_playerProfileId_capturedAt_key" ON "PlayerStatsHistory"("playerProfileId", "capturedAt");

-- CreateIndex
CREATE INDEX "ClanVacancy_status_minTownHallLevel_idx" ON "ClanVacancy"("status", "minTownHallLevel");

-- CreateIndex
CREATE INDEX "ClanVacancy_clanTag_idx" ON "ClanVacancy"("clanTag");

-- CreateIndex
CREATE INDEX "ClanVacancy_ownerId_idx" ON "ClanVacancy"("ownerId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatsHistory" ADD CONSTRAINT "PlayerStatsHistory_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanVacancy" ADD CONSTRAINT "ClanVacancy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

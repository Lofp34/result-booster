-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OutcomeLevel" AS ENUM ('NONE', 'LOW', 'MED', 'HIGH');

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectiveConfigJson" JSONB NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "expectedPrimaryMetricKey" TEXT NOT NULL,
    "expectedSecondaryMetricKeys" TEXT[],

    CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutcomeCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "checkWindowDays" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "outcomeLevel" "OutcomeLevel" NOT NULL,
    "metricValue" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "OutcomeCheck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutcomeCheck" ADD CONSTRAINT "OutcomeCheck_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ActivitySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

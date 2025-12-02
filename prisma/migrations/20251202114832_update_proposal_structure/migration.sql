/*
  Warnings:

  - You are about to drop the column `background` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `expectedImpact` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `methods` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `nPatients` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `objectives` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `references` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `statisticalAnalysis` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `statisticianName` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `statsSentAt` on the `Proposal` table. All the data in the column will be lost.
  - Added the required column `competingWork` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `literaturePosition` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainExposure` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryEndpoint` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryObjective` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scientificBackground` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyPopulation` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "background",
DROP COLUMN "expectedImpact",
DROP COLUMN "methods",
DROP COLUMN "nPatients",
DROP COLUMN "objectives",
DROP COLUMN "references",
DROP COLUMN "statisticalAnalysis",
DROP COLUMN "statisticianName",
DROP COLUMN "statsSentAt",
ADD COLUMN     "adjustmentCovariates" TEXT,
ADD COLUMN     "analysisDescription" TEXT,
ADD COLUMN     "analysisTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "competingWork" JSONB NOT NULL,
ADD COLUMN     "dataBaseline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataBiological" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataCMR" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataCT" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataClinicalFollowup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataCoreLab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataHospitalFollowup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataRHC" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataStressEcho" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataTOE" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataTTE" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataTTEFollowup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exclusionCriteria" TEXT,
ADD COLUMN     "inclusionCriteria" TEXT,
ADD COLUMN     "literaturePosition" TEXT NOT NULL,
ADD COLUMN     "mainExposure" TEXT NOT NULL,
ADD COLUMN     "primaryEndpoint" TEXT NOT NULL,
ADD COLUMN     "primaryObjective" TEXT NOT NULL,
ADD COLUMN     "scientificBackground" TEXT NOT NULL,
ADD COLUMN     "secondaryEndpoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "secondaryObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "secondaryTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "studyPopulation" TEXT NOT NULL,
ADD COLUMN     "subgroupAnalyses" TEXT,
ADD COLUMN     "targetJournals" TEXT[] DEFAULT ARRAY[]::TEXT[];

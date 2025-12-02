-- CreateEnum
CREATE TYPE "AppPermission" AS ENUM ('SUBMISSION', 'REVIEWING', 'ADMIN');

-- CreateEnum
CREATE TYPE "WindowStatus" AS ENUM ('UPCOMING', 'OPEN', 'REVIEW', 'RESPONSE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'PRIORITIZED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('ASSIGNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('ACCEPT', 'REJECT', 'REVISE');

-- CreateEnum
CREATE TYPE "OverlapAssessment" AS ENUM ('NO', 'PARTIAL', 'MAJOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "affiliation" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "centreCode" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "permissions" "AppPermission"[] DEFAULT ARRAY[]::"AppPermission"[];

-- CreateTable
CREATE TABLE "SubmissionWindow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "submissionOpenAt" TIMESTAMP(3) NOT NULL,
    "submissionCloseAt" TIMESTAMP(3) NOT NULL,
    "reviewStartAt" TIMESTAMP(3) NOT NULL,
    "reviewDeadlineDefault" TIMESTAMP(3) NOT NULL,
    "responseDeadline" TIMESTAMP(3) NOT NULL,
    "nextWindowOpensAt" TIMESTAMP(3),
    "status" "WindowStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainArea" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MainArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "submissionWindowId" TEXT NOT NULL,
    "mainAreaId" TEXT NOT NULL,
    "piUserId" TEXT NOT NULL,
    "centreCode" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "methods" TEXT NOT NULL,
    "statisticalAnalysis" TEXT NOT NULL,
    "expectedImpact" TEXT,
    "references" TEXT,
    "nPatients" INTEGER,
    "statisticianName" TEXT,
    "statsSentAt" TIMESTAMP(3),
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL DEFAULT 'ASSIGNED',
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "decision" "ReviewDecision",
    "overlap" "OverlapAssessment",
    "overlapDetails" TEXT,
    "commentsForPI" TEXT,
    "commentsForAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionWindow_name_key" ON "SubmissionWindow"("name");

-- CreateIndex
CREATE INDEX "SubmissionWindow_status_idx" ON "SubmissionWindow"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MainArea_label_key" ON "MainArea"("label");

-- CreateIndex
CREATE INDEX "Proposal_submissionWindowId_idx" ON "Proposal"("submissionWindowId");

-- CreateIndex
CREATE INDEX "Proposal_piUserId_idx" ON "Proposal"("piUserId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_isDeleted_idx" ON "Proposal"("isDeleted");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_isDeleted_idx" ON "Review"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Review_proposalId_reviewerId_key" ON "Review"("proposalId", "reviewerId");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_submissionWindowId_fkey" FOREIGN KEY ("submissionWindowId") REFERENCES "SubmissionWindow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_mainAreaId_fkey" FOREIGN KEY ("mainAreaId") REFERENCES "MainArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_piUserId_fkey" FOREIGN KEY ("piUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

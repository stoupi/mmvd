/*
  Warnings:

  - You are about to drop the column `centreCode` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `centreCode` on the `User` table. All the data in the column will be lost.
  - Added the required column `centreId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "centreCode",
ADD COLUMN     "centreId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "centreCode",
ADD COLUMN     "centreId" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "Centre" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "countryCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "patientCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Centre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReviewerTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReviewerTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Centre_code_key" ON "Centre"("code");

-- CreateIndex
CREATE INDEX "Centre_countryCode_idx" ON "Centre"("countryCode");

-- CreateIndex
CREATE INDEX "Centre_code_idx" ON "Centre"("code");

-- CreateIndex
CREATE INDEX "_ReviewerTopics_B_index" ON "_ReviewerTopics"("B");

-- CreateIndex
CREATE INDEX "Proposal_centreId_idx" ON "Proposal"("centreId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewerTopics" ADD CONSTRAINT "_ReviewerTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "MainArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewerTopics" ADD CONSTRAINT "_ReviewerTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

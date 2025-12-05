-- CreateEnum
CREATE TYPE "InvestigatorRole" AS ENUM ('PI', 'CO_INVESTIGATOR');

-- CreateTable
CREATE TABLE "Investigator" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "InvestigatorRole" NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "centreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investigator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Investigator_centreId_idx" ON "Investigator"("centreId");

-- CreateIndex
CREATE INDEX "Investigator_role_idx" ON "Investigator"("role");

-- AddForeignKey
ALTER TABLE "Investigator" ADD CONSTRAINT "Investigator_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

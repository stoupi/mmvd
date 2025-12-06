-- AlterTable
ALTER TABLE "SubmissionWindow" ALTER COLUMN "reviewStartAt" DROP NOT NULL,
ALTER COLUMN "reviewDeadlineDefault" DROP NOT NULL,
ALTER COLUMN "responseDeadline" DROP NOT NULL;

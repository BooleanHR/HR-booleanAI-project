-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN "rejectReason" TEXT;

-- AlterTable
ALTER TABLE "VerificationJob" ADD COLUMN "claudeReason" TEXT;
ALTER TABLE "VerificationJob" ADD COLUMN "claudeScore" REAL;
ALTER TABLE "VerificationJob" ADD COLUMN "claudeVerdict" TEXT;
ALTER TABLE "VerificationJob" ADD COLUMN "finalVerdict" TEXT;

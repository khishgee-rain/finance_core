-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "installments" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "paymentInterval" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "currency" SET DEFAULT 'MNT';

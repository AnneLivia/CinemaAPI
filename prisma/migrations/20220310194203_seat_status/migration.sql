/*
  Warnings:

  - You are about to drop the column `disable` on the `SessionSeats` table. All the data in the column will be lost.
  - You are about to drop the column `occupied` on the `SessionSeats` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'SELECTED', 'BLOCKED', 'OCCUPIED');

-- AlterTable
ALTER TABLE "SessionSeats" DROP COLUMN "disable",
DROP COLUMN "occupied",
ADD COLUMN     "status" "SeatStatus" NOT NULL DEFAULT E'AVAILABLE';

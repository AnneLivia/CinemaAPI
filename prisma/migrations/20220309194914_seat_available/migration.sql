/*
  Warnings:

  - You are about to drop the column `state` on the `SessionSeats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SessionSeats" DROP COLUMN "state",
ADD COLUMN     "occupied" BOOLEAN NOT NULL DEFAULT false;

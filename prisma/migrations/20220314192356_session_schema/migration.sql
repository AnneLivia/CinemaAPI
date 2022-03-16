/*
  Warnings:

  - You are about to drop the column `sessionSeatsId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `SessionSeats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sessionSeatId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SessionSeats" DROP CONSTRAINT "SessionSeats_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_sessionSeatsId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "sessionSeatsId",
ADD COLUMN     "sessionSeatId" TEXT NOT NULL;

-- DropTable
DROP TABLE "SessionSeats";

-- CreateTable
CREATE TABLE "SessionSeat" (
    "id" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "column" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "SeatType" NOT NULL DEFAULT E'STARDARD',
    "status" "SeatStatus" NOT NULL DEFAULT E'AVAILABLE',

    CONSTRAINT "SessionSeat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionSeat" ADD CONSTRAINT "SessionSeat_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sessionSeatId_fkey" FOREIGN KEY ("sessionSeatId") REFERENCES "SessionSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

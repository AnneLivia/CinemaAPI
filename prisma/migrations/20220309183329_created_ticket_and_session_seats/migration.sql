/*
  Warnings:

  - Added the required column `price` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('WHELLCHAIR', 'STARDARD', 'DOUBLESEAT');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('FREE', 'HALFPRICE', 'STARDARD', 'PROMOTIONAL');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "SessionSeats" (
    "id" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "column" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "SeatType" NOT NULL DEFAULT E'STARDARD',
    "disable" BOOLEAN NOT NULL DEFAULT false,
    "state" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SessionSeats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT E'STARDARD',
    "paymentStatus" BOOLEAN NOT NULL DEFAULT false,
    "sessionSeatsId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionSeats" ADD CONSTRAINT "SessionSeats_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sessionSeatsId_fkey" FOREIGN KEY ("sessionSeatsId") REFERENCES "SessionSeats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

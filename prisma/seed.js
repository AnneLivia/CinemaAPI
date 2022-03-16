import bcrypt from 'bcryptjs';
import prisma from '../src/database/prisma.js';

// anonymous function
(async () => {
  // Creating users
  await prisma.user.createMany({
    data: [
      {
        name: 'Anne Livia',
        email: 'annelivia@gmail.com',
        password: await bcrypt.hash('12345678', 10),
        role: 'ADMIN',
        birthDate: '16/01/2021',
      },
      {
        name: 'Jane Doe',
        email: 'janeDoe@gmail.com',
        password: await bcrypt.hash('12345678', 10),
        role: 'USER',
        birthDate: '16/01/2022',
      },
    ],
  });

  // it's going to be used on ticket
  const userId = (await prisma.user.findFirst({})).id;

  // creating movies
  await prisma.movie.createMany({
    data: [
      {
        name: 'Harry Potter and the Philosopher\'s Stone',
        description: 'Fantasy...',
        duration: 152,
        classification: 'GENERAL_AUDIENCE',
      },
      {
        name: 'Grave of the Fireflies',
        description: 'Anime...',
        duration: 89,
        classification: 'GENERAL_AUDIENCE',
      },
    ],
  });

  // it's going to be used on sessions
  const movieId = (await prisma.movie.findFirst({})).id;

  // creating session
  await prisma.session.create({
    data: {
      movie: { connect: { id: movieId } },
      sessionDate: '09/03/2022',
      price: 200,
      room: 'COMMON',
      SessionSeat: {
        createMany: {
          data: [
            {
              line: 'A',
              column: 1,
              name: 'A1',
            },
            {
              line: 'A',
              column: 2,
              name: 'A2',
            },
          ],
        },
      },
    },
  });

  // it's going to be used on tickets
  const sessionId = (await prisma.session.findFirst({})).id;
  const sessionSeatId = (await prisma.sessionSeat.findFirst({})).id;

  // creating ticket
  await prisma.ticket.create({
    data: {
      user: { connect: { id: userId } },
      session: { connect: { id: sessionId } },
      seat: { connect: { id: sessionSeatId } },
      category: 'HALFPRICE',
    },
  });
})();

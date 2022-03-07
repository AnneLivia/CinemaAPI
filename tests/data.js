const users = [
  {
    name: 'John Doe',
    birthDate: '16/01/2001',
    reviewer: false,
    email: 'johndoe@gmail.com',
    password: '12345678',
    role: 'USER',
  },
  {
    name: 'Jane Doe',
    birthDate: '16/01/2000',
    reviewer: true,
    email: 'janedoe@gmail.com',
    password: '12345678',
    role: 'ADMIN',
  },
];

const movies = [
  {
    name: 'Grave of the Fireflies',
    duration: 89,
    description: 'Anime',
    classification: 'GENERAL_AUDIENCE',
  },
  {
    name: 'Spirited Away',
    duration: 125,
    description: 'Anime',
    classification: 'GENERAL_AUDIENCE',
  },
];

const sessions = [
  {
    room: 'COMMON',
    sessionDate: '12/12/2022 12:12',
  },
];

export {
  users,
  movies,
  sessions,
};

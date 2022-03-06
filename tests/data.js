const users = [
  {
    name: 'Teste User 1',
    birthDate: '12/12/2012',
    reviewer: false,
    email: 'teste@gmail.com',
    password: '12345678',
    role: 'USER',
  },
  {
    name: 'Teste User 2',
    birthDate: '12/12/2013',
    reviewer: true,
    email: 'teste2@gmail.com',
    password: '12345678',
    role: 'ADMIN',
  },
  {
    name: 'Teste User 3',
    birthDate: '12/12/2014',
    reviewer: true,
    email: 'teste3@gmail.com',
    password: '12345678',
    role: 'USER',
  },
  {
    name: 'Teste User 4',
    birthDate: '12/12/2015',
    reviewer: false,
    email: 'teste4@gmail.com',
    password: '12345678',
    role: 'ADMIN',
  },
];

const movies = [
  {
    name: 'Movie Teste 1',
    duration: 200,
    description: 'A movie test 1',
    classification: 'GENERAL_AUDIENCE',
  },
  {
    name: 'Movie Teste 2',
    duration: 200,
    description: 'A movie test 2',
    classification: 'RESTRICTED',
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

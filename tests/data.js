const users = {
  user1: {
    name: 'Teste User 1',
    birthDate: '12/12/2012',
    reviewer: false,
    email: 'teste@gmail.com',
    password: '12345678',
    role: 'USER',
  },
  user2: {
    name: 'Teste User 2',
    birthDate: '12/12/2013',
    reviewer: true,
    email: 'teste2@gmail.com',
    password: '12345678',
    role: 'ADMIN',
  },
  user3: {
    name: 'Teste User 3',
    birthDate: '12/12/2014',
    reviewer: true,
    email: 'teste3@gmail.com',
    password: '12345678',
    role: 'USER',
  },

  user4: {
    name: 'Teste User 4',
    birthDate: '12/12/2014',
    reviewer: true,
    email: 'teste4gmail.com',
    password: '12345678',
    role: 'ADMIN',
  },
};

const movies = {
  movie1: {
    name: 'Movie Teste 1',
    duration: 200,
    description: 'a movie test1',
    classification: 'GENERAL_AUDIENCE',
  },
  movie2: {
    name: 'Movie Teste 2',
    duration: 200,
    description: 'a movie test2',
    classification: 'GENERAL_AUDIENCE',
  },
};

export {
  users,
  movies,
};

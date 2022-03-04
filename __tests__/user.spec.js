import supertest from 'supertest';
import prisma from '../src/database/prisma.js';
import app from '../src/app.js';

// before initialize test, should remove all users
beforeAll(async () => {
  await prisma.user.deleteMany({});
});

// after initialize test, should remove all users
afterAll(async () => {
  await prisma.user.deleteMany({});
});

describe('User sign up', () => {
  it('should create a new user', async () => {
    const result = await supertest(app).post('/api/users/')
      .send(
        {
          name: 'Teste User',
          birthDate: '12/12/2012',
          reviewer: false,
          email: 'teste@gmail.com',
          password: '12345678',
          role: 'USER',
        },
      );

    expect(result.statusCode).toBe(200);
    expect(result.body).toHaveProperty('id');
  });
});

// describe is a 'category' of test
describe('User authentication', () => {
  // it('should receive a JWT token when authenticated', () => {});
});

describe('GET /api/movies', () => {
  it('should return users', async () => {
    const result = await supertest(app).get('/api/users');
    expect(result.statusCode).toBe(401);
  });
});

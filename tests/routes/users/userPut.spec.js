import supertest from 'supertest';
import { jest } from '@jest/globals';
import prisma from '../../../src/database/prisma.js';
import app from '../../../src/index.js';
import { users } from '../../data.js';

const [user, admin] = users;

// before initialize test, should create a mock of console.log e error
beforeAll(async () => {
  // mockImplementation(fn) Accepts a function that should be used as the implementation of the mock
  // spyOn allows you to mock either the whole module or the individual functions of the module.
  // At its most general usage, it can be used to track calls on a method
  // spyOn Returns a Jest mock function
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});

  // creating users
  // creating admin and common user
  user.id = (await supertest(app).post('/api/users').send(user)).body.id;

  await supertest(app).post('/api/users').send(admin);

  user.token = (
    await supertest(app)
      .post('/api/login')
      .send({ email: user.email, password: user.password })
  ).body.token;

  admin.token = (
    await supertest(app)
      .post('/api/login')
      .send({ email: admin.email, password: admin.password })
  ).body.token;
});

// after test, should remove all users
afterAll(async () => {
  // deleting only created users here
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [user.email, admin.email],
      },
    },
  });
});

/* ================================== PUT ================================== */
describe('PUT HTTP Request', () => {
  describe('PUT /api/users/:id', () => {
    describe('When passed id and logged user\'s id are NOT the same', () => {
      it('should respond with a 403 status code even if user is an admin', async () => {
        const result = await supertest(app)
          .put(`/api/users/${user.id}`)
          .send({ name: 'John Doe PUT example' })
          .set({ Authorization: `Bearer ${admin.token}` });

        expect(result.statusCode).toBe(403);
      });
    });

    describe('When passed id and logged user\'s id are the same', () => {
      it('should respond with a 200 status code and return updated user', async () => {
        const result = await supertest(app)
          .put(`/api/users/${user.id}`)
          .send({ name: 'John Doe PUT example' })
          .set({ Authorization: `Bearer ${user.token}` });

        expect(result.statusCode).toBe(200);
        expect(result.body.record.name).toEqual('John Doe PUT example');
      });
    });
  });
});

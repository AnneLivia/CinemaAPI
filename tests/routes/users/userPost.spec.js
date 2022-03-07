import supertest from 'supertest';
import { jest } from '@jest/globals';
import prisma from '../../../src/database/prisma.js';
import app from '../../../src/index.js';
import { users } from '../../data.js';

const [user, admin] = users;

// before initialize test, should create a mock of console.log e error
beforeAll(() => {
  // mockImplementation(fn) Accepts a function that should be used as the implementation of the mock
  // spyOn allows you to mock either the whole module or the individual functions of the module.
  // At its most general usage, it can be used to track calls on a method
  // spyOn Returns a Jest mock function
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
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

/* ================================== POST ================================== */

describe('POST HTTP Request', () => {
  /* ================================== CREATE USER ================================== */

  // block of test, considering user post.
  describe('POST /api/users', () => {
    describe("When passing user's required data", () => {
      it('should respond with a 200 status code and contains an user id from the database', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(user);
        expect(result.statusCode).toBe(200);
        // .toHaveProperty = verifies if a key exists for a object
        expect(result.body).toHaveProperty('id');
      });
    });

    // unit test
    describe('When password is stored', () => {
      it('should be hashed', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(admin);
          // passsword has a maximum of 30 characters (JOI validation),
          // bcrypt generates a 60 length hash string
        expect(result.body.password).toHaveLength(60);
      });
    });

    describe('When password is missing', () => {
      const copyUser = { ...admin };
      delete copyUser.password;

      it('should respond with a 400 status code', async () => {
        const result = await supertest(app).post('/api/users').send(copyUser);
        expect(result.statusCode).toBe(400);
      });
    });

    describe("When user's email already exists", () => {
      it('should respond with a 400 status code', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(user);
        expect(result.statusCode).toBe(400);
      });
    });

    describe("When user's email is invalid", () => {
      const copyUser = { ...admin };
      copyUser.email = 'adad@.com';
      it('should respond with a 400 status code', async () => {
        const result = await supertest(app).post('/api/users').send(copyUser);
        expect(result.statusCode).toBe(400);
      });
    });
  });

  /* ================================== LOGIN ================================== */

  // describe is a 'category' of test
  describe('POST /api/login', () => {
    describe('When user authenticates', () => {
      it('should receive a JWT token', async () => {
        const result = await supertest(app).post('/api/login').send({
          email: user.email,
          password: user.password,
        });

        expect(result.body).toHaveProperty('token');
      });
    });

    describe('When email does not exist in the database', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).post('/api/login').send({
          email: 'asa@gmail.com',
          password: user.password,
        });
        expect(result.statusCode).toBe(404);
      });
    });

    describe('When password is incorrect', () => {
      it('should respond with a 401 status code', async () => {
        const result = await supertest(app).post('/api/login').send({
          email: user.email,
          password: '1212121212',
        });

        // status 401 = unauthorized.
        expect(result.statusCode).toBe(401);
      });
    });
  });
});

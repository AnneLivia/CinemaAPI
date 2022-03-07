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

  user.id = (await supertest(app).post('/api/users').send(user)).body.id;

  admin.id = (await supertest(app).post('/api/users').send(admin)).body.id;

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

/* ================================== GET ================================== */

describe('GET HTTP Request', () => {
  /* ================================== GET ALL ================================== */

  describe('GET /api/users', () => {
    describe('When user provides a token and the user is an admin', () => {
      it('should respond with a 200 status code', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(200);
      });

      it('should return all created users', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.body).toHaveProperty('records');
        // it must have returned data, since two user was created in this test
        expect(result.body.records).not.toBeNull();
      });
    });

    describe('When user provides a token, but the user is NOT an admin', () => {
      // forbidden = 403 = don't have access this resource
      it('should respond with a 403 status code', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(403);
      });

      it('should return that the user does not have admin privileges', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.body.message).toEqual(
          "You don't have Admin privileges to access this route",
        );
      });
    });

    describe('When user does not provide a token', () => {
      it('should respond with a 401 status code', async () => {
        const result = await supertest(app).get('/api/users');
        expect(result.statusCode).toBe(401);
      });
    });

    describe('When user provides an invalid token', () => {
      it('should respond with a 401 status code', async () => {
        // set allows to set headers
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: 'noauth' });
        expect(result.statusCode).toBe(401);
      });
    });
  });

  /* ================================== GET by id ================================== */
  describe('GET /api/users/:id', () => {
    describe("When passed id and logged user's id are the same", () => {
      it("should return the user's information even if user is NOT an admin", async () => {
        const result = await supertest(app)
          .get(`/api/users/${user.id}`)
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.body.id).toBe(user.id);
      });
    });

    describe("When passed id and logged user's id are NOT the same", () => {
      it("should return the user's information if user is an admin", async () => {
        const result = await supertest(app)
          .get(`/api/users/${user.id}`)
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.body.id).toBe(user.id);
      });

      it('should respond with a 403 status code if user is NOT an admin', async () => {
        const result = await supertest(app)
          .get(`/api/users/${admin.id}`)
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(403);
      });
    });

    describe('When passed id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app)
          .get('/api/users/1212121')
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

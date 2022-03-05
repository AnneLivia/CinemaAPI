import supertest from 'supertest';
import { jest } from '@jest/globals';
import prisma from '../src/database/prisma.js';
import app from '../src/index.js';

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
};

// before initialize test, should remove all users and creating a mock of console.log
beforeAll(async () => {
  // mockImplementation(fn) Accepts a function that should be used as the implementation of the mock
  // spyOn allows you to mock either the whole module or the individual functions of the module.
  // At its most general usage, it can be used to track calls on a method
  // spyOn Returns a Jest mock function
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});

  await prisma.user.deleteMany({});
});

// after initialize test, should remove all users
afterAll(async () => {
  await prisma.user.deleteMany({});
});

/* ================================== POST ================================== */

describe('POST', () => {
  // block of test, considering user post.
  describe('POST /api/users', () => {
    describe("When passing user's required data", () => {
      it('should respond with a 200 status code and contains an user id from the database', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(users.user1);
        expect(result.status).toBe(200);
        // .toHaveProperty = verifies if a key exists for a object
        expect(result.body).toHaveProperty('id');
      });
    });

    describe('When password is stored', () => {
      it('should be hashed', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(users.user2);
        // passsword has a maximum of 30 characters,
        // bcrypt generates a 60 length hash string
        expect(result.body.password).toHaveLength(60);
      });
    });

    describe('When password is missing', () => {
      const copyUser = { ...users.user2 };
      delete copyUser.password;

      it('should respond with a 400 status code', async () => {
        const result = await supertest(app).post('/api/users').send(copyUser);
        expect(result.statusCode).toBe(400);
      });

      it('should return that the password is required', async () => {
        const result = await supertest(app).post('/api/users').send(copyUser);

        expect(result.body.message).toEqual('Invalid Data');
        // since only password is missing, result.body.errors[0] contains this information
        // toContain checks substrings and also list values
        expect(result.body.errors[0]).toContain('password');
        expect(result.body.errors[0]).toContain('required');
      });
    });

    describe("When user's email already exists", () => {
      it('should respond with a 400 status code', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(users.user1);
        expect(result.statusCode).toBe(400);
      });

      it('should return that the email must be unique', async () => {
        const result = await supertest(app)
          .post('/api/users')
          .send(users.user1);

        expect(result.body.message).toContain('Unique');
        expect(result.body.message).toContain('email');
      });
    });

    describe("When user's email is invalid", () => {
      const copyUser = { ...users.user2 };
      copyUser.email = 'adad@.com';
      it('should respond with a 400 status code', async () => {
        const result = await supertest(app).post('/api/users').send(copyUser);
        expect(result.statusCode).toBe(400);
      });

      it('should return that the email is invalid', async () => {
        const result = await supertest(app).post('/api/users').send(copyUser);

        expect(result.body.errors[0]).toContain('valid');
        expect(result.body.errors[0]).toContain('email');
      });
    });
  });

  /* ================================== LOGIN ================================== */

  // describe is a 'category' of test
  describe('POST /api/login', () => {
    describe('When user authenticates', () => {
      it('should receive a JWT token', async () => {
        const result = await supertest(app).post('/api/login').send({
          email: users.user1.email,
          password: users.user1.password,
        });

        expect(result.body).toHaveProperty('token');
      });
    });

    describe('When email does not exist in the database', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).post('/api/login').send({
          email: 'asa@gmail.com',
          password: users.user1.password,
        });
        expect(result.statusCode).toBe(404);
      });
    });

    describe('When password is incorrect', () => {
      it('should respond with a 401 status code', async () => {
        const result = await supertest(app).post('/api/login').send({
          email: users.user1.email,
          password: '1212121212',
        });

        // status 401 = unauthorized.
        expect(result.statusCode).toBe(401);
      });
    });
  });
});

/* ================================== GET ================================== */

describe('GET', () => {
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // User 1 is not an admin
    user1Token = (await supertest(app)
      .post('/api/login')
      .send({ email: users.user1.email, password: users.user1.password })).body.token;

    // User 2 is an admin
    user2Token = (await supertest(app)
      .post('/api/login')
      .send({ email: users.user2.email, password: users.user2.password })).body.token;
  });

  describe('GET /api/users', () => {
    describe('When user provides a token and the user is an admin', () => {
      it('should respond with a 200 status code', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${user2Token}` });
        expect(result.statusCode).toBe(200);
      });

      it('should return all created users', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${user2Token}` });
        expect(result.body).toHaveProperty('records');
        // it must have returned data, since two user was created in this test
        expect(result.body.records).not.toBeNull();
      });
    });

    describe('When user provides a token, but the user is not an admin', () => {
      // forbidden = 403 = don't have access this resource
      it('should respond with a 403 status code', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${user1Token}` });
        expect(result.statusCode).toBe(403);
      });

      it('should return that the user does not have admin privileges', async () => {
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: `Bearer ${user1Token}` });
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

      it('should return that the authorization header was not found', async () => {
        const result = await supertest(app).get('/api/users');
        expect(result.body.message).toEqual('Authorization not found');
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

      it('should return the the token is invalid', async () => {
        // set allows to set headers
        const result = await supertest(app)
          .get('/api/users')
          .set({ Authorization: 'wrongauth' });
        expect(result.body.message).toEqual('Invalid Token');
      });
    });
  });

  /* ================================== GET by id ================================== */
  describe('GET /api/users/:id', () => {
    let idUser1;
    let idUser2;

    beforeAll(async () => {
      // User 1 is not an admin
      const result = await supertest(app)
        .get('/api/users')
        .set({ Authorization: `Bearer ${user2Token}` });

      // to make sure to get the correct id
      idUser1 = result.body.records[0].email === users.user1.email
        ? result.body.records[0].id
        : result.body.records[1].id;

      // to make sure to get the correct id
      idUser2 = result.body.records[1].email === users.user2.email
        ? result.body.records[1].id
        : result.body.records[0].id;
    });

    describe('When passed id and logged user\'s id are the same', () => {
      it("should return the user's information even if user is not an admin", async () => {
        const result = await supertest(app)
          .get(`/api/users/${idUser1}`)
          .set({ Authorization: `Bearer ${user1Token}` });
        expect(result.body.id).toBe(idUser1);
      });
    });

    describe('When passed id and logged user\'s id are not the same', () => {
      it("should return the user's information if user is an admin", async () => {
        const result = await supertest(app)
          .get(`/api/users/${idUser1}`)
          .set({ Authorization: `Bearer ${user2Token}` });
        expect(result.body.id).toBe(idUser1);
      });

      it('should respond with a 403 status code if user is not an admin', async () => {
        const result = await supertest(app)
          .get(`/api/users/${idUser2}`)
          .set({ Authorization: `Bearer ${user1Token}` });

        expect(result.statusCode).toBe(403);
      });
    });

    describe('When passed id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app)
          .get('/api/users/1212121')
          .set({ Authorization: `Bearer ${user2Token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

/* ================================== PUT ================================== */
describe('PUT', () => {
  let idUser1;
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // User 1 is not an admin
    user1Token = (await supertest(app)
      .post('/api/login')
      .send({ email: users.user1.email, password: users.user1.password })).body.token;

    // User 2 is an admin
    user2Token = (await supertest(app)
      .post('/api/login')
      .send({ email: users.user2.email, password: users.user2.password })).body.token;

    // User 1 is not an admin
    const result = await supertest(app)
      .get('/api/users')
      .set({ Authorization: `Bearer ${user2Token}` });

    // to make sure to get the correct id
    idUser1 = result.body.records[0].email === users.user1.email
      ? result.body.records[0].id
      : result.body.records[1].id;
  });

  describe('PUT /api/users/:id', () => {
    describe('When passed id and logged user\'s id are not the same', () => {
      it('should respond with a 403 status code even if user is an admin', async () => {
        const result = await supertest(app)
          .put(`/api/users/${idUser1}`)
          .send({ name: 'User Teste 1 Put' })
          .set({ Authorization: `Bearer ${user2Token}` });

        expect(result.statusCode).toBe(403);
      });
    });

    describe('When passed id and logged user\'s id are the same', () => {
      it('should respond with a 200 status code and return updated user', async () => {
        const result = await supertest(app)
          .put(`/api/users/${idUser1}`)
          .send({ name: 'User Teste 1 Put' })
          .set({ Authorization: `Bearer ${user1Token}` });

        expect(result.statusCode).toBe(200);
        expect(result.body.record.name).toEqual('User Teste 1 Put');
      });
    });
  });
});

/* ================================== DELETE ================================== */
describe('DELETE', () => {
  let idUser1;
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // User 1 is not an admin
    user1Token = (await supertest(app)
      .post('/api/login')
      .send({ email: users.user1.email, password: users.user1.password })).body.token;

    // User 2 is an admin
    user2Token = (await supertest(app)
      .post('/api/login')
      .send({ email: users.user2.email, password: users.user2.password })).body.token;

    // User 1 is not an admin
    const result = await supertest(app)
      .get('/api/users')
      .set({ Authorization: `Bearer ${user2Token}` });

    // to make sure to get the correct id
    idUser1 = result.body.records[0].email === users.user1.email
      ? result.body.records[0].id
      : result.body.records[1].id;
  });

  describe('DELETE /api/users/:id', () => {
    describe('When passed id and logged user\'s id are not the same', () => {
      it('should respond with a 403 status code even if user is an admin', async () => {
        const result = await supertest(app)
          .delete(`/api/users/${idUser1}`)
          .set({ Authorization: `Bearer ${user2Token}` });

        expect(result.statusCode).toBe(403);
      });
    });

    describe('When passed id and logged user\'s id are the same', () => {
      it('should respond with a 200 status code', async () => {
        const result = await supertest(app)
          .delete(`/api/users/${idUser1}`)
          .set({ Authorization: `Bearer ${user1Token}` });

        expect(result.statusCode).toBe(200);
      });
    });
  });
});

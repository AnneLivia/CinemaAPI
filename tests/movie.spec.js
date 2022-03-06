// in scripts, I've added 'cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest'
// because jest ships with experimental support for ECMAScript Modules (ESM)
// @types/jest jest autocomplete
import supertest from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/index.js';
import { movies, users, sessions } from './data.js';
import prisma from '../src/database/prisma.js';

let user3Token;
let user4Token;

const user3 = users[2]; // common user
const user4 = users[3]; // admin

let movie1Id;

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // creating admin and common user
  await supertest(app).post('/api/users').send(user3);
  await supertest(app).post('/api/users').send(user4);

  // User 3 is not an admin
  user3Token = (await supertest(app)
    .post('/api/login')
    .send({ email: user3.email, password: user3.password })).body.token;

  // User 4 is an admin
  user4Token = (await supertest(app)
    .post('/api/login')
    .send({ email: user4.email, password: user4.password })).body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [user3.email, user4.email],
      },
    },
  });

  await prisma.session.deleteMany({});
  await prisma.movie.deleteMany({});
});

/* ================================== POST ================================== */

describe('POST HTTP request', () => {
  /* ================================== CREATE MOVIE ================================== */
  describe('POST /api/movies/', () => {
    describe('When logged user is an admin', () => {
      it('should respond with a 200 status code and contains a movie id from the database', async () => {
        const result = await supertest(app).post('/api/movies')
          .send(movies[0]).set({ Authorization: `Bearer ${user4Token}` });
        expect(result.statusCode).toBe(200);
        expect(result.body).toHaveProperty('id');

        // it's going to be used in get, delete and put
        movie1Id = result.body.id;
      });
    });
    describe('When logged user is NOT an admin', () => {
      it('should respond with a 403 status code', async () => {
        const result = await supertest(app).post('/api/movies')
          .send(movies[0]).set({ Authorization: `Bearer ${user3Token}` });
        expect(result.statusCode).toBe(403);
      });
    });
  });
});

/* ================================== GET ================================== */
describe('GET HTTP request', () => {
  /* ================================== GET ALL ================================== */
  describe('GET /api/movies', () => {
    describe('When user provides a token', () => {
      it('should respond with a 200 status code and return all movies even if user is not an admin', async () => {
        const result = await supertest(app).get('/api/movies')
          .set({ Authorization: `Bearer ${user3Token}` });
        expect(result.statusCode).toBe(200);
        expect(result.body.records).not.toBeNull();
      });
    });
    describe('When user does NOT provide a token', () => {
      it('should respond with a 401 status code', async () => {
        const result = await supertest(app).get('/api/movies');
        expect(result.statusCode).toBe(401);
      });
    });
  });
  /* ================================== GET by id ================================== */
  describe('GET /api/movies/:id', () => {
    describe('When the movie id exists', () => {
      it('should respond with a 200 status code', async () => {
        const result = await supertest(app).get(`/api/movies/${movie1Id}`)
          .set({ Authorization: `Bearer ${user3Token}` });
        expect(result.statusCode).toBe(200);
      });
    });
    describe('When the movie id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).get('/api/movies/221431')
          .set({ Authorization: `Bearer ${user3Token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

/* ================================== PUT ================================== */
describe('PUT HTTP request', () => {
  describe('PUT /api/movies/:id', () => {
    describe('When the movie id exists and user is an admin', () => {
      it('should respond with a 200 status code', async () => {
        const result = await supertest(app).put(`/api/movies/${movie1Id}`)
          .send({ name: 'Movie Put test' }).set({ Authorization: `Bearer ${user4Token}` });
        expect(result.statusCode).toBe(200);
      });
    });
    describe('When the movie id exists, but user is NOT an admin', () => {
      it('should respond with a 403 status code', async () => {
        const result = await supertest(app).put(`/api/movies/${movie1Id}`)
          .send({ name: 'Movie Put test' }).set({ Authorization: `Bearer ${user3Token}` });
        expect(result.statusCode).toBe(403);
      });
    });
    describe('When the movie id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).put('/api/movies/221431')
          .send({ name: 'Movie Put test' }).set({ Authorization: `Bearer ${user4Token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

/* ================================== DELETE ================================== */
describe('DELETE HTTP request', () => {
  let movie2Id;

  beforeAll(async () => {
    // inserting a new movie to test session-movie relationship
    const result = await supertest(app).post('/api/movies')
      .send(movies[1]).set({ Authorization: `Bearer ${user4Token}` });

    // creating a new session, associated with the movie[1] id
    movie2Id = result.body.id;

    await supertest(app).post('/api/sessions')
      .send({ movieId: movie2Id, ...sessions[0] }).set({ Authorization: `Bearer ${user4Token}` });
  });

  describe('DELETE /api/movies/:id', () => {
    describe('When an existing movie is not being referenced in sessions model', () => {
      it('should respond with a 200 status code if user is an admin', async () => {
        const result = await supertest(app).delete(`/api/movies/${movie1Id}`)
          .set({ Authorization: `Bearer ${user4Token}` });
        expect(result.statusCode).toBe(200);
      });
      it('should respond with a 403 status code if user is NOT an admin', async () => {
        const result = await supertest(app).delete(`/api/movies/${movie2Id}`)
          .set({ Authorization: `Bearer ${user3Token}` });
        expect(result.statusCode).toBe(403);
      });
    });
    describe('When an existing movie is being referenced in \'sessions\' model', () => {
      it('should respond with a 400 status code', async () => {
        const result = await supertest(app).delete(`/api/movies/${movie2Id}`)
          .set({ Authorization: `Bearer ${user4Token}` });
        expect(result.statusCode).toBe(400);
      });
    });
    describe('When the movie id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).delete('/api/movies/221431')
          .set({ Authorization: `Bearer ${user4Token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});
/*
describe('GET', () => {
  describe('GET /api/movies', () => {
    describe('When access this route', () => {
      it('should return all movies', async () => {
        const result = await supertest(app).get('/api/movies');
        expect(result.statusCode).toBe(200);
      });
    });
  });
});

describe('Test', () => {
  it('should return true', () => {
    expect(true).toBe(true);
  });
}) */

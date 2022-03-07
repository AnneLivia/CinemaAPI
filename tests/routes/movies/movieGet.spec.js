// in scripts, I've added 'cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest'
// because jest ships with experimental support for ECMAScript Modules (ESM)
// @types/jest jest autocomplete
import supertest from 'supertest';
import { jest } from '@jest/globals';
import prisma from '../../../src/database/prisma.js';
import app from '../../../src/index.js';
import { movies, users } from '../../data.js';

const [user, admin] = users;
const [movie] = movies;

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // creating admin and common user
  await supertest(app).post('/api/users').send(user);
  await supertest(app).post('/api/users').send(admin);

  user.token = (await supertest(app)
    .post('/api/login')
    .send({ email: user.email, password: user.password })).body.token;

  admin.token = (await supertest(app)
    .post('/api/login')
    .send({ email: admin.email, password: admin.password })).body.token;

  // creating movie to test the GET method
  movie.id = (await supertest(app).post('/api/movies').send(movie)
    .set({ Authorization: `Bearer ${admin.token}` })).body.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [user.email, admin.email],
      },
    },
  });

  await prisma.movie.deleteMany({});
});

/* ================================== GET ================================== */
describe('GET HTTP request', () => {
  /* ================================== GET ALL ================================== */
  describe('GET /api/movies', () => {
    describe('When user provides a token', () => {
      it('should respond with a 200 status code and return all movies even if user is not an admin', async () => {
        const result = await supertest(app).get('/api/movies')
          .set({ Authorization: `Bearer ${user.token}` });
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
        const result = await supertest(app).get(`/api/movies/${movie.id}`)
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(200);
      });
    });
    describe('When the movie id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).get('/api/movies/221431')
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

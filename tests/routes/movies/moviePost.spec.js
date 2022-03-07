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

/* ================================== POST ================================== */

describe('POST HTTP request', () => {
  /* ================================== CREATE MOVIE ================================== */
  describe('POST /api/movies/', () => {
    describe('When logged user is an admin', () => {
      it('should respond with a 200 status code and contains a movie id from the database', async () => {
        const result = await supertest(app).post('/api/movies')
          .send(movie).set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(200);
        expect(result.body).toHaveProperty('id');
      });
    });
    describe('When logged user is NOT an admin', () => {
      it('should respond with a 403 status code', async () => {
        const result = await supertest(app).post('/api/movies')
          .send(movie).set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(403);
      });
    });
  });
});

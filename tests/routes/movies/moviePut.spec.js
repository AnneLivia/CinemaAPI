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

  // User 3 is not an admin
  user.token = (await supertest(app)
    .post('/api/login')
    .send({ email: user.email, password: user.password })).body.token;
  // User 4 is an admin
  admin.token = (await supertest(app)
    .post('/api/login')
    .send({ email: admin.email, password: admin.password })).body.token;

  // creating movie to test the PUT method
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

/* ================================== PUT ================================== */
describe('PUT HTTP request', () => {
  describe('PUT /api/movies/:id', () => {
    describe('When the movie id exists and user is an admin', () => {
      it('should respond with a 200 status code', async () => {
        const result = await supertest(app).put(`/api/movies/${movie.id}`)
          .send({ name: 'Movie Put test' }).set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(200);
      });
    });
    describe('When the movie id exists, but user is NOT an admin', () => {
      it('should respond with a 403 status code', async () => {
        const result = await supertest(app).put(`/api/movies/${movie.id}`)
          .send({ name: 'Movie Put test' }).set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(403);
      });
    });
    describe('When the movie id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).put('/api/movies/221431')
          .send({ name: 'Movie Put test' }).set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

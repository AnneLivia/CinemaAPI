// in scripts, I've added 'cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest'
// because jest ships with experimental support for ECMAScript Modules (ESM)
// @types/jest jest autocomplete
import supertest from 'supertest';
import { jest } from '@jest/globals';
import prisma from '../../../src/database/prisma.js';
import app from '../../../src/index.js';
import { movies, users, sessions } from '../../data.js';

const [user, admin] = users;
const [movie1, movie2] = movies;

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
  movie1.id = (await supertest(app).post('/api/movies')
    .send(movie1).set({ Authorization: `Bearer ${admin.token}` })).body.id;
  movie2.id = (await supertest(app).post('/api/movies')
    .send(movie2).set({ Authorization: `Bearer ${admin.token}` })).body.id;

  // creating a session to test if a movie is not removed when there's a session referecing it
  await supertest(app).post('/api/sessions')
    .send({ movieId: movie2.id, ...sessions[0] }).set({ Authorization: `Bearer ${admin.token}` });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [user.email, admin.email],
      },
    },
  });

  await prisma.session.deleteMany({});
  await prisma.movie.deleteMany({});
});

/* ================================== DELETE ================================== */
describe('DELETE HTTP request', () => {
  describe('DELETE /api/movies/:id', () => {
    describe('When an existing movie is NOT being referenced in sessions model', () => {
      it('should respond with a 200 status code if user is an admin', async () => {
        const result = await supertest(app).delete(`/api/movies/${movie1.id}`)
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(200);
      });
      it('should respond with a 403 status code if user is NOT an admin', async () => {
        const result = await supertest(app).delete(`/api/movies/${movie2.id}`)
          .set({ Authorization: `Bearer ${user.token}` });
        expect(result.statusCode).toBe(403);
      });
    });
    describe('When an existing movie is being referenced in \'sessions\' model', () => {
      it('should respond with a 400 status code', async () => {
        const result = await supertest(app).delete(`/api/movies/${movie2.id}`)
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(400);
      });
    });
    describe('When the movie id does not exist', () => {
      it('should respond with a 404 status code', async () => {
        const result = await supertest(app).delete('/api/movies/221431')
          .set({ Authorization: `Bearer ${admin.token}` });
        expect(result.statusCode).toBe(404);
      });
    });
  });
});

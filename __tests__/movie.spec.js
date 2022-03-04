// in scripts, I've added 'cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest'
// because jest ships with experimental support for ECMAScript Modules (ESM)
// @types/jest jest autocomplete
import supertest from 'supertest';
import express from 'express';
import MovieRouter from '../src/routes/MovieRouter.js';

const app = express();

app.use('/api', MovieRouter);

describe('GET /api/movies', () => {
  it('should return movies', async () => {
    const result = await supertest(app).get('/api/movies');
    expect(result.statusCode).toBe(200);
  });
});

/*
describe('Test', () => {
  it('should return true', () => {
    expect(true).toBe(true);
  });
});
*/

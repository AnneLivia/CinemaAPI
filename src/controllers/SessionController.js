import joiImported from 'joi';
import joiDate from '@joi/date';
import Prisma from '@prisma/client';
import Controller from './Controller.js';
import { BadRequest, Forbidden } from '../utils/CustomError.js';

const Joi = joiImported.extend(joiDate);
const { SessionRoom } = Prisma;

class Session extends Controller {
  maxLines = 2;

  maxColumns = 2;

  // Generally lines are letters, cols are numbers in cinema
  // Array(26) = length of the array
  // fill = fills up a object with some specific number from start to end
  // 65 is letter 'A' in ASCII. B == 66, etc.
  // fromCharCode() method returns a string created from the specified sequence of UTF-16 code
  alphabet = Array(26).fill(0).map((value, index) => (String.fromCharCode(index + 65)));

  constructor() {
    super('session', {
      findMany: { include: { movie: true, sessionSeats: true } },
    });
  }

  generateSeats() {
    // an array of SessionSeats objects to create many when creating a session
    const seats = [];

    // in sessionseats model, sessionId, is automatically inserted since I'm doing Nested writes
    // in order to use ++ or -- unary. https://eslint.org/docs/rules/no-plusplus
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < this.maxLines; i++) {
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < this.maxColumns; j++) {
        const line = this.alphabet[i];
        const column = j + 1;
        seats.push(
          {
            line,
            column,
            name: `${line}${column}`,
            type: 'STARDARD',
            state: 'AVAILABLE',
            disable: false,
          },
        );
      }
    }

    return seats;
  }

  // only admin user can store
  async store(req, res, next) {
    if (req.userLogged.role !== 'ADMIN') { throw new Forbidden('You don\'t have Admin privileges'); }

    const Schema = Joi.object({
      // HH = hours (24 hours time). if hh (12 hours time with a or A where a = am and A = pm)
      sessionDate: Joi.date().required().format('DD/MM/YYYY HH:mm'),
      room: Joi.string().valid(
        SessionRoom.COMMON,
        SessionRoom.DLUX,
        SessionRoom.IMAX,
        SessionRoom.XD,
      ),
      // Requires the string value to be a valid GUID.
      movieId: Joi.string().required().guid(),
      price: Joi.number().required().positive(),
    });

    const { error } = Schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error(error);
      throw new BadRequest('Invalid data', error.details.map(({ message }) => message));
    }

    // overwrite req.body to insert in a custom way to store the data.
    // in Controller, the store is generic. only = create({data: req.body})
    // by overwriting req.body, I'm going to specify how I want some data
    // to be stored in the database
    const {
      sessionDate, room, movieId, price,
    } = req.body;

    req.body = {
      sessionDate,
      room,
      // nested query. If the related record does not exist, Prisma Client throws an exception
      movie: { connect: { id: movieId } },
      price,
      // create many options, to generate seats associated to this session.
      SessionSeats: { createMany: { data: this.generateSeats() } },
    };

    super.store(req, res, next);
  }

  // only admin user can update
  async update(req, res, next) {
    if (req.userLogged.role !== 'ADMIN') { throw new Forbidden('You don\'t have Admin privileges'); }

    const Schema = Joi.object({
      // HH = hours (24 hours time). if hh (12 hours time with a or A where a = am and A = pm)
      sessionDate: Joi.date().format('DD/MM/YYYY HH:mm'),
      room: Joi.string().valid(
        SessionRoom.COMMON,
        SessionRoom.DLUX,
        SessionRoom.IMAX,
        SessionRoom.XD,
      ),
      // Requires the string value to be a valid GUID.
      movieId: Joi.string().guid(),
    });

    const { error } = Schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error(error);
      throw new BadRequest('Invalid data', error.details.map(({ message }) => message));
    }

    super.update(req, res, next);
  }

  // only admin can delete
  async remove(req, res, next) {
    if (req.userLogged.role === 'ADMIN') { return super.remove(req, res, next); }

    throw new Forbidden('You don\'t have Admin privileges');
  }
}

export default Session;

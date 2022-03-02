import joiImported from 'joi';
import joiDate from '@joi/date';
import Prisma from '@prisma/client';
import Controller from './Controller.js';
import { BadRequest } from '../utils/CustomError.js';

const Joi = joiImported.extend(joiDate);
const { SessionRoom } = Prisma;

class Session extends Controller {
  constructor() {
    super('session');
  }

  async store(req, res, next) {
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
    });

    const { error } = Schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error(error);
      throw new BadRequest('Invalid data', error.details.map(({ message }) => message));
    }

    super.store(req, res, next);
  }

  async update(req, res, next) {
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
}

export default Session;

import Joi from 'joi';
import Prisma from '@prisma/client';
import Controller from './Controller.js';
import { BadRequest, Forbidden } from '../utils/CustomError.js';

const { Classification } = Prisma;

class MovieController extends Controller {
  constructor() {
    super('movie');
  }

  // only admin user can store
  async store(req, res, next) {
    if (req.userLogged.role !== 'ADMIN') { throw new Forbidden('You don\'t have Admin privileges'); }

    const schema = Joi.object({
      name: Joi.string().required().max(50),
      description: Joi.string().required().max(5000),
      duration: Joi.number().required().positive().max(500),
      classification: Joi.string().valid(
        Classification.GENERAL_AUDIENCE,
        Classification.PARENT_GUIDANCE_SUGGESTED,
        Classification.RESTRICTED,
      ),
    });

    const schemaValidated = schema.validate(req.body, { abortEarly: false });

    if (schemaValidated.error) {
      console.error(schemaValidated.error);
      throw new BadRequest('Invalid data', schemaValidated.error.details.map(({ message }) => message));
    }

    super.store(req, res, next);
  }

  // only admin user can update
  async update(req, res, next) {
    if (req.userLogged.role !== 'ADMIN') { throw new Forbidden('You don\'t have Admin privileges'); }

    const schema = Joi.object({
      name: Joi.string().max(50),
      description: Joi.string().max(5000),
      duration: Joi.number().positive().max(500),
      classification: Joi.string().valid(
        Classification.GENERAL_AUDIENCE,
        Classification.PARENT_GUIDANCE_SUGGESTED,
        Classification.RESTRICTED,
      ),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

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

export default MovieController;

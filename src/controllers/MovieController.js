import Joi from 'joi';
import Prisma from '@prisma/client';
import Controller from './Controller.js';
import { BadRequest } from '../utils/CustomError.js';

const { Classification } = Prisma;

class MovieController extends Controller {
  constructor() {
    super('movie');
  }

  async store(req, res, next) {
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

  async update(req, res, next) {
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
}

export default MovieController;

import prisma from '../database/prisma.js';
import { BadRequest, NotFound } from '../utils/CustomError.js';
import logger from '../utils/logger.js';

class Controller {
  // default value of options for findmany method {} = without options;
  // If I pass something inside the {}, such as: include: {model: true}
  // this is going to include the model's information in findmany results
  constructor(
    model,
    prismaOptions = {
      findMany: {},
      // other options for methods
    },
  ) {
    this.prismaClient = prisma;
    this.model = model;
    this.client = prisma[model];
    this.prismaOptions = prismaOptions;
    if (!this.client) {
      logger.error(`Model ${this.model} does not exists on Prisma Schema.`);
    }
  }

  /**
   * @description Get all Registries according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  // eslint-disable-next-line no-unused-vars
  async index(req, res, next) {
    // return an array of registries
    // this.prismaOptions.findMany = contains all additional options I passed to the constructor
    // this.prismaOptions.findMany === {some_option: {something: something...}};
    const records = await this.client.findMany(this.prismaOptions.findMany);
    res.json({ records });
  }

  /**
   * @description Get One Registry by Id according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async getOne(req, res, next) {
    const { id } = req.params;

    const record = await this.client.findUnique(
      { where: { id } },
    );

    if (record) {
      return res.json(record);
    }

    logger.error(`${this.model} with id ${id} was not found`);
    // If synchronous code throws an error, I can throw it using just throw new Error('BROKEN')
    // and Express will catch this on its own.
    // For errors returned from asynchronous functions invoked by route handlers and middleware
    // you must pass them to the next() function where Express will catch and process them
    next(new NotFound('Record not found'));
  }

  /**
   * @description Create a new registry according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async store(req, res, next) {
    try {
      const record = await this.client.create({ data: req.body });
      res.json(record);
    } catch (error) {
      // need to pass the error to the express error middleware using next(error)
      // Prisma error code: 'P2002' ==  Unique constraint failed on some fields of the model
      if (error.code === 'P2002') {
        next(
          new BadRequest(
            `Unique constraint failed on the field(s): ${error.meta.target.join(', ')}`,
          ),
        );
      }

      // other errors
      // console.error(error);
      logger.error(error);
      next(new BadRequest('Unexpected error'));
    }
  }

  /**
   * @description Update a registry by id according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const record = await this.client.update({
        where: { id },
        data: req.body,
      });
      res.json({ record });
    } catch (error) {
      // Prisma error code: 'P2002' ==  Unique constraint failed on some fields of the model
      if (error.code === 'P2002') {
        next(
          new BadRequest(
            `Unique constraint failed on the field(s): ${error.meta.target.join(', ')}`,
          ),
        );
      }

      logger.error(error);
      next(new NotFound('Record to update does not exist'));
    }
  }

  /**
   * @description Remove a registry by id according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async remove(req, res, next) {
    const { id } = req.params;
    try {
      await this.client.delete({ where: { id } });
      res.json({ message: `${this.model} was deleted successfully` });
    } catch (error) {
      // If I try to delete a movie that is being referenced in session,
      // it occurs an error Foreign key constraint failed on the field:
      // `Session_movieId_fkey (index)`. code: P2003.
      if (error.code === 'P2003') {
        next(
          new BadRequest(
            `This ${this.model} id is being referenced in another model`,
          ),
        );
      }
      // returns a RecordNotFound if the registry is not found
      logger.error(error);
      next(new NotFound('Record to delete does not exist'));
    }
  }
}

export default Controller;

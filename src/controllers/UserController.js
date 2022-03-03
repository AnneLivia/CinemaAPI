import joiImported from 'joi';
import joiDate from '@joi/date';
import Prisma from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Controller from './Controller.js';
import prisma from '../database/prisma.js';
import hashPassword from '../utils/hashPassword.js';
import config from '../config/config.js';
import {
  BadRequest, NotFound, Unauthorized, Forbidden,
} from '../utils/CustomError.js';

const { Role } = Prisma;

const Joi = joiImported.extend(joiDate);

const { JWT_SECRET } = config;

class UserController extends Controller {
  constructor() {
    super('user');
  }

  async store(req, res, next) {
    const schema = Joi.object({
      role: Joi.string().valid(Role.USER, Role.ADMIN),
      name: Joi.string().required(),
      password: Joi.string().required().min(8).max(30),
      email: Joi.string().email().required(),
      birthDate: Joi.date().format('DD/MM/YYYY').required(),
      reviewer: Joi.boolean(),
    });

    // abortEarly: false = possible to see all erros, if true, it's possible to see only one
    // schema.validate returns an object with the following keys: error, value, warning, artifacts.
    // If the input is valid, then the error will be undefined.
    // If the input is invalid, error is assigned a ValidationError
    // object providing more information
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // error is an object containing many informations: inside details there's an array of errors
      // including many informartion about the errors, such as: message, type, context, etc.
      console.error(error);
      // If synchronous code throws an error, I can throw it using just throw new Error('mensage')
      // and Express will catch this on its own.
      throw new BadRequest('Invalid Data', error.details.map(({ message }) => message));
    }

    // if there's any error, hash password
    req.body.password = await hashPassword(req.body.password);

    super.store(req, res, next);
  }

  async update(req, res, next) {
    if (req.userLogged.id !== req.params.id) {
      throw new Forbidden('You cannot update this user\'s information');
    }

    const schema = Joi.object({
      role: Joi.string().valid(Role.USER, Role.ADMIN),
      name: Joi.string(),
      password: Joi.string().min(8).max(30),
      email: Joi.string().email(),
      birthDate: Joi.date().format('DD/MM/YYYY'),
      reviewer: Joi.boolean(),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error(error);
      throw new BadRequest('Invalid data', error.details.map(({ message }) => message));
    }

    // If password was specified in the body, then
    // updated it with a hash, otherwise, returns undefined
    req.body.password = req.body.password ? await hashPassword(req.body.password) : undefined;

    super.update(req, res, next);
  }

  // eslint-disable-next-line class-methods-use-this
  async login(req, res) {
    const { email, password } = req.body;

    const schema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8).max(30),
    });

    const { error } = schema.validate(
      { email, password },
      { abortEarly: false },
    );

    if (error) {
      console.error(error);
      throw new BadRequest('Invalid Data', error.details.map(({ message }) => message));
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFound('User not found');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new Unauthorized('Password is incorrect');
    }

    delete user.password;

    const token = jwt.sign(user, JWT_SECRET);

    res.json({ token });
  }

  // secure route restricted to "Admin" users only
  async index(req, res, next) {
    if (req.userLogged.role === 'ADMIN') {
      return super.index(req, res, next);
    }

    // if I want the current user to check their own information using this route
    // I can call the getOne method, passing the current logged user id in the req.params.id.
    // req.params.id = req.userLogged.id;
    // return this.getOne(req, res, next);

    throw new Forbidden('You don\'t have Admin privileges to access this route');
  }

  // Admin users can access all users' information by passing the Id,
  // but no-admin role users cannot have access to other users' information,
  // except for their own information
  async getOne(req, res, next) {
    const { id } = req.params;

    if (id === req.userLogged.id || req.userLogged.role === 'ADMIN') {
      return super.getOne(req, res, next);
    }

    throw new Forbidden('You don\'t have Admin privileges');
  }

  // delele only allows the deletion of some user if the current user is the one logged
  async remove(req, res, next) {
    const { id } = req.params;
    if (id === req.userLogged.id) {
      return super.remove(req, res, next);
    }

    throw new Forbidden('You cannot delete this user');
  }
}

export default UserController;

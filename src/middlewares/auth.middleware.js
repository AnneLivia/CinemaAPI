import unless from 'express-unless';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { Unauthorized } from '../utils/CustomError.js';

const { JWT_SECRET } = config;

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) { throw new Unauthorized('Authorization not found'); }

  const [, token] = authorization.split(' ');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userLogged = payload;
  } catch (error) {
    console.error(error);
    throw new Unauthorized('Invalid Token');
  }

  next();
};

// in order to support unless function from express-unless
authMiddleware.unless = unless;

export default authMiddleware;

import Joi from 'joi';
import Prisma from '@prisma/client';
import Controller from './Controller.js';

import {
  BadRequest,
} from '../utils/CustomError.js';

const { TicketCategory } = Prisma;

const schema = Joi.object({
  category: Joi.string().valid(...Object.values(TicketCategory)),
  sessionSeatId: Joi.string().required().guid(),
  sessionId: Joi.string().required().guid(),
});

class TicketController extends Controller {
  constructor() {
    super('ticket');
  }

  // when user buys a ticket, this method must be called
  async store(req, res, next) {
    const { category, sessionSeatId, sessionId } = req.body;

    const { error } = schema.validate(
      { category, sessionSeatId, sessionId },
      { abortEarly: false },
    );

    if (error) {
      console.error(error);
      throw new BadRequest('Invalid Data', error.details.map(({ message }) => message));
    }

    // checking if the seat is already occupied or not, or it's blocked
    const statusSeat = await this.prismaClient.sessionSeat.findUnique(
      { where: { id: sessionSeatId } },
    );

    if (statusSeat && (statusSeat.status === 'OCCUPIED' || statusSeat.status === 'BLOCKED')) {
      return next(new BadRequest('This seat is unavailable'));
    }

    // current logged user is buying the ticket
    const userId = req.userLogged.id;

    try {
      const ticket = await this.prismaClient.ticket.create({
        data: {
          user: { connect: { id: userId } },
          session: { connect: { id: sessionId } },
          seat: { connect: { id: sessionSeatId } },
          category,
          paymentStatus: true,
        },
      });

      await this.prismaClient.sessionSeat.update({
        data: { status: 'OCCUPIED' },
        where: { id: sessionSeatId },
      });

      res.json(ticket);
    } catch (err) {
      console.error(err);

      if (err.code === 'P2025') {
        next(new BadRequest('One or both passed Ids (Session and SessionSeat) are incorrect'));
      }
      next(new BadRequest('Unexpected Error'));
    }
  }
}

export default TicketController;

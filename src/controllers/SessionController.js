import Controller from "./Controller.js";
import joiImported from "Joi";
import joiDate from "@joi/date";
import Prisma from "@prisma/client";

const Joi = joiImported.extend(joiDate);
const { SessionRoom } = Prisma;

class Session extends Controller {
  constructor() {
    super("session");
  }

  async store(req, res) {
    const Schema = Joi.object({
      // HH = hours (24 hours time). if hh (12 hours time with a or A where a = am and A = pm)
      sessionDate: Joi.date().required().format("DD/MM/YYYY HH:mm"),
      room: Joi.string().valid(
        SessionRoom.COMMON,
        SessionRoom.DLUX,
        SessionRoom.IMAX,
        SessionRoom.XD
      ),
      // Requires the string value to be a valid GUID.
      movieId: Joi.string().required().guid(),
    });

    const { error } = Schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error(error);
      return res.status(400).json({
        message: "Invalid Data",
        errors: error.details.map(({ message }) => message),
      });
    }

    super.store(req, res);
  }

  async update(req, res) {
    const Schema = Joi.object({
      // HH = hours (24 hours time). if hh (12 hours time with a or A where a = am and A = pm)
      sessionDate: Joi.date().format("DD/MM/YYYY HH:mm"),
      room: Joi.string().valid(
        SessionRoom.COMMON,
        SessionRoom.DLUX,
        SessionRoom.IMAX,
        SessionRoom.XD
      ),
      // Requires the string value to be a valid GUID.
      movieId: Joi.string().guid(),
    });

    const { error } = Schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error(error);
      return res.status(400).json({
        message: "Invalid Data",
        errors: error.details.map(({ message }) => message),
      });
    }

    super.update(req, res);
  }
}

export default Session;

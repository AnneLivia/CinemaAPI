import prisma from "../database/prisma.js";

class Controller {
  constructor(model) {
    this.model = model;
    this.client = prisma[model];
  }

  /**
   * @description Get all Registries according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async index(req, res) {
    // return an array of registries
    const registries = await this.client.findMany();
    res.json({ registries });
  }

  /**
   * @description Get One Registry by Id according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async getOne(req, res) {
    const { id } = req.params;

    const registry = await this.client.findUnique({ where: { id } });

    if (registry) {
      return res.json(registry);
    }

    console.log(`${this.model} with id ${id} was not found.`);
    return res.status(404).json({ message: `${this.model} not found.` });
  }

  /**
   * @description Create a new registry according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async store(req, res) {
    try {
      const registry = await this.client.create({ data: req.body });
      res.json(registry);
    } catch (error) {
      // Prisma error code: 'P2002' ==  Unique constraint failed on some fields of the model
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({
            error: "Invalid Data",
            message: `Unique constraint failed on the field(s): ${error.meta.target.join(', ')}.`,
          });
      }

      // other errors
      console.error(error);
      res.status(400).json({ message: "Unexpected error." });
    }
  }

  /**
   * @description Update a registry by id according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async update(req, res) {
    const { id } = req.params;
    try {
      const registry = await this.client.update({
        where: { id },
        data: req.body,
      });
      res.json({ registry });
    } catch (error) {

      // Prisma error code: 'P2002' ==  Unique constraint failed on some fields of the model
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({
            error: "Invalid Data",
            message: `Unique constraint failed on the field(s): ${error.meta.target.join(', ')}.`,
          });
      }

      console.error(error);
      res.status(400).json({ message: "Unexpected error." });
    }
  }

  /**
   * @description Remove a registry by id according to Model name
   * @param {*} req Object with properties about the HTTP request
   * @param {*} res Object representing the HTTP response sent when an HTTP request occurs
   * @returns
   */

  async remove(req, res) {
    const { id } = req.params;
    try {
      await this.client.delete({ where: { id } });
      res.json({ message: `${this.model} was deleted successfully` });
    } catch (error) {
      // returns a RecordNotFound if the registry is not found
      console.error(error);
      res.status(404).json({ message: "Record to delete does not exist." });
    }
  }
}

export default Controller;

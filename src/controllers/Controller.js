import prisma from '../database/prisma.js';

class Controller {
  constructor(model) {
    this.model = model;
    this.client = prisma[model];
  }

  /**
   * @description Get all Registries according to Model name
   * @param {*} req
   * @param {*} res
   * @returns
   */

  async index(req, res) {
    // return an array of registries
    const registries = await this.client.findMany();
    res.json({ registries });
  }

  /**
   * @description Get One Registry by Id according to Model name
   * @param {*} request
   * @param {*} response
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
   * @param {*} request
   * @param {*} response
   * @returns
   */

  async store(req, res) {
    try {
      const registry = await this.client.create({ data: req.body });
      res.json(registry);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Unexpected error.' });
    }
  }

  /**
   * @description Update a registry by id according to Model name
   * @param {*} request
   * @param {*} response
   * @returns
   */

  async update(req, res) {
    const { id } = req.params;
    try {
      const registry = await this.client.update({ where: { id }, data: req.body });
      res.json({ registry });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Unexpected error.' });
    }
  }

  /**
   * @description Remove a registry by id according to Model name
   * @param {*} request
   * @param {*} response
   * @returns
   */

  async remove(req, res) {
    const { id } = req.params;
    try {
      await this.client.delte({ where: { id } });
      res.json({ message: `${this.model} was deleted` });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Unexpected error.' });
    }
  }
}

export default Controller;

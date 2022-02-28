import { Router } from 'express';

class MyRouter {
  constructor(path, Controller) {
    this.path = path;
    this.controller = new Controller();
    this.router = Router();
    // to load the routes when instantiate
    this.loadRoutes();
  }

  loadRoutes() {
    this.router.get(this.path, this.controller.index.bind(this.controller));
    this.router.get(`${this.path}/:id`, this.controller.getOne.bind(this.controller));
    this.router.post(this.path, this.controller.store.bind(this.controller));
    this.router.put(`${this.path}/:id`, this.controller.update.bind(this.controller));
    this.router.delete(`${this.path}/:id`, this.controller.remove.bind(this.controller));
  }
}

export default MyRouter;

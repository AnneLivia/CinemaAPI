import Router from './Router.js';
import UserController from '../controllers/UserController.js';

const router = new Router('/users', UserController);

// need to export the router middleware
export default router.router;

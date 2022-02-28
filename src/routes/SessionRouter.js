import Router from './Router.js';
import SessionController from '../controllers/SessionController.js';

const router = new Router('/sessions', SessionController);

// need to export the router middleware
export default router.router;

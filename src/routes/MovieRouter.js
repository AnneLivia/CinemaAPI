import Router from './Router.js';
import MovieController from '../controllers/MovieController.js';

const router = new Router('/movies', MovieController);

// need to export the router middleware
export default router.router;

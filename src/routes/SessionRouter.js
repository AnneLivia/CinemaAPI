import Router from './Router.js';
import SessionController from '../controllers/SessionController.js';

const router = new Router('/sessions', SessionController);

const sessionController = new SessionController();

router.router.put('/sessions/:idSession/seat/:idSeat', sessionController.updateSeat.bind(sessionController));

// need to export the router middleware
export default router.router;

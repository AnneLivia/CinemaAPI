import Router from './Router.js';
import TicketController from '../controllers/TicketController.js';

const router = new Router('/tickets', TicketController);

export default router.router;

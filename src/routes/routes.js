import { Router } from 'express';

import UserRouter from './UserRouter.js';
import MovieRouter from './MovieRouter.js';
import SessionRouter from './SessionRouter.js';
import TicketRouter from './TicketRouter.js';

const router = Router();

router.use(UserRouter);
router.use(MovieRouter);
router.use(SessionRouter);
router.use(TicketRouter);

export default router;

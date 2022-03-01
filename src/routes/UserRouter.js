import Router from './Router.js';
import UserController from '../controllers/UserController.js';

const router = new Router('/users', UserController);
const userController = new UserController();

// Since user has a login path apart from CRUD routes, need to add here this additional route
router.router.post('/login', userController.login.bind(userController));

// need to export the router middleware
export default router.router;

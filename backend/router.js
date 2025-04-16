import { Router } from 'express';
import { signUp, login, checkIfLoggedIn, addAdmin } from './controllers/authController.js';

const router = Router();

//routes for authentication
router.post('/signup', signUp);
router.post('/login', login);
router.post('/checkifloggedin', checkIfLoggedIn);
router.post('/addadmin', addAdmin);

export default router;
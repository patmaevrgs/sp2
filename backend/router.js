import { Router } from 'express';
import { signUp, login, checkIfLoggedIn, addAdmin } from './controllers/authController.js';
import { createAnnouncement, getAnnouncements, deleteAnnouncement, updateAnnouncement } from './controllers/announcementController.js';

const router = Router();

//routes for authentication
router.post('/signup', signUp);
router.post('/login', login);
router.post('/checkifloggedin', checkIfLoggedIn);
router.post('/addadmin', addAdmin);

// Announcements
router.post('/announcements', createAnnouncement);  // Note the /api prefix
router.get('/announcements', getAnnouncements);     // Same here
router.delete('/announcements/:id', deleteAnnouncement);
router.patch('/announcements/:id', updateAnnouncement);

export default router;
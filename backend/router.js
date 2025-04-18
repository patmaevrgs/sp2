import { Router } from 'express';
import { signUp, login, checkIfLoggedIn, addAdmin } from './controllers/authController.js';
import { createAnnouncement, getAnnouncements, deleteAnnouncement, updateAnnouncement } from './controllers/announcementController.js';
import { createLog, getLogs, deleteOldLogs } from './controllers/userLogController.js';
import { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus, 
  residentResponse, 
  getBookingsCalendar,
  checkBookingConflict,
  residentCancelBooking
} from './controllers/ambulanceController.js';
import multer from 'multer';

const router = Router();

// Set up multer for memory storage (we'll handle file saving in controller)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes for authentication
router.post('/signup', signUp);
router.post('/login', login);
router.post('/checkifloggedin', checkIfLoggedIn);
router.post('/addadmin', addAdmin);

// Announcements
router.post('/announcements', upload.array('files'), createAnnouncement);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);
router.patch('/announcements/:id', upload.array('files'), updateAnnouncement);

// User Logs
router.post('/logs', createLog);
router.get('/logs', getLogs);
router.delete('/logs', deleteOldLogs);

// Ambulance Booking Routes
router.post('/ambulance', createBooking);
router.get('/ambulance', getBookings);
router.get('/ambulance/:id', getBookingById);
router.patch('/ambulance/:id/status', updateBookingStatus);
router.patch('/ambulance/:id/resident-response', residentResponse);
router.get('/ambulance-calendar', getBookingsCalendar);
router.get('/ambulance-conflict', checkBookingConflict);
router.patch('/ambulance/:id/cancel', residentCancelBooking);

// Serve static files
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default router;
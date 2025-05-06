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
import {
  createCourtReservation,
  getCourtReservations,
  getCourtReservationById,
  updateCourtReservationStatus,
  cancelCourtReservation,
  getCourtReservationsCalendar,
  checkReservationConflict
} from './controllers/courtController.js';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus
} from './controllers/transactionController.js';
import { 
  createReport, 
  getAllReports, 
  getUserReports, 
  updateReportStatus, 
  cancelReport,
  addResidentFeedback,
  getReportById
} from './controllers/reportController.js';
import {
  createProposal,
  getProposals,
  getProposalById,
  updateProposalStatus,
  cancelProposal,
  deleteProposal
} from './controllers/proposalController.js';
import {
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequestStatus,
  cancelDocumentRequest
} from './controllers/documentRequestController.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateUserPassword 
} from './controllers/userController.js';
import multer from 'multer';
import { generateDocument } from './controllers/documentGeneratorController.js';

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

// User Profile Routes
router.get('/profile', getUserProfile);
router.put('/profile/update', updateUserProfile);
router.put('/profile/password', updateUserPassword);

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

// Court Reservation Routes
router.post('/court', createCourtReservation);
router.get('/court', getCourtReservations);
router.get('/court/:id', getCourtReservationById);
router.patch('/court/:id/status', updateCourtReservationStatus);
router.patch('/court/:id/cancel', cancelCourtReservation);
router.get('/court-calendar', getCourtReservationsCalendar);
router.get('/court-conflict', checkReservationConflict); // This endpoint doesn't need auth

// Transaction Routes
router.post('/transactions', createTransaction);
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransactionById);
router.patch('/transactions/:id/status', updateTransactionStatus);

// Infrastructure Report Routes
router.post('/reports', upload.array('media', 5), createReport); 
router.get('/reports', getAllReports); 
router.get('/reports/user', getUserReports); // This is the route causing the 500 error
router.put('/reports/:reportId/status', updateReportStatus); 
router.post('/reports/:reportId/feedback', addResidentFeedback);
router.put('/reports/:reportId/cancel', cancelReport);
router.get('/reports/:reportId', getReportById);

// Project Proposal Routes
router.post('/proposals', upload.single('document'), createProposal);
router.get('/proposals', getProposals);
router.get('/proposals/:id', getProposalById);
router.patch('/proposals/:id/status', updateProposalStatus);
router.patch('/proposals/:id/cancel', cancelProposal);
router.delete('/proposals/:id', deleteProposal);

// Document Request Routes
router.post('/documents', createDocumentRequest);
router.get('/documents', getDocumentRequests);
router.get('/documents/:id', getDocumentRequestById);
router.patch('/documents/:id/status', updateDocumentRequestStatus);
router.patch('/documents/:id/cancel', cancelDocumentRequest);

// Document Generation Route
router.post('/documents/generate', generateDocument);

// Serve static files
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default router;
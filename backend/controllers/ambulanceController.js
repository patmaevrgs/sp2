import AmbulanceBooking from '../models/AmbulanceBooking.js';
import mongoose from 'mongoose';

// Create a new ambulance booking
export const createBooking = async (req, res) => {
  try {
    const {
      patientName,
      pickupDate,
      pickupTime,
      duration,
      pickupAddress,
      contactNumber,
      destination,
      emergencyDetails,
      additionalNote,
      submitterRelation
    } = req.body;

    // Get user ID from request body or token
    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const newBooking = new AmbulanceBooking({
      patientName,
      pickupDate: new Date(pickupDate),
      pickupTime,
      duration,
      pickupAddress,
      contactNumber,
      destination,
      emergencyDetails,
      additionalNote: additionalNote || '',
      submitterRelation,
      bookedBy: userId,
      status: 'pending'
    });

    const savedBooking = await newBooking.save();
    
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error creating ambulance booking:', error);
    res.status(500).json({ message: 'Error creating ambulance booking', error: error.message });
  }
};

// Get all ambulance bookings with optional filtering
export const getBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, userId } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // Status filter
    if (status) filter.status = status;
    
    // User filter (for resident view)
    if (userId) filter.bookedBy = new mongoose.Types.ObjectId(userId);
    
    // Date range filter
    if (startDate || endDate) {
      filter.pickupDate = {};
      if (startDate) filter.pickupDate.$gte = new Date(startDate);
      if (endDate) filter.pickupDate.$lte = new Date(endDate);
    }
    
    // Fetch bookings with applied filters, sort by pickup date
    const bookings = await AmbulanceBooking.find(filter)
      .sort({ pickupDate: 1, pickupTime: 1 })
      .populate('bookedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching ambulance bookings:', error);
    res.status(500).json({ message: 'Error fetching ambulance bookings', error: error.message });
  }
};

// Get a single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await AmbulanceBooking.findById(id)
      .populate('bookedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    if (!booking) {
      return res.status(404).json({ message: 'Ambulance booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching ambulance booking:', error);
    res.status(500).json({ message: 'Error fetching ambulance booking', error: error.message });
  }
};

// Update a booking's status by admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment, dieselCost, adminId } = req.body;
    
    // Get admin ID from request body
    const processedBy = adminId || req.body.userId;
    
    // Validate status
    const validStatuses = ['pending', 'booked', 'cancelled', 'completed', 'needs_approval'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find the booking
    const booking = await AmbulanceBooking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Ambulance booking not found' });
    }
    
    // Update fields
    if (status) booking.status = status;
    if (adminComment !== undefined) booking.adminComment = adminComment;
    if (dieselCost !== undefined) booking.dieselCost = dieselCost;
    
    // Set processed by admin
    if (processedBy) booking.processedBy = processedBy;
    booking.updatedAt = Date.now();
    
    const savedBooking = await booking.save();
    
    const updatedBooking = await AmbulanceBooking.findById(id)
      .populate('bookedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating ambulance booking:', error);
    res.status(500).json({ message: 'Error updating ambulance booking', error: error.message });
  }
};

// Resident responds to diesel cost requirement
export const residentResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { acceptDieselCost, userId } = req.body;
    
    const booking = await AmbulanceBooking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Ambulance booking not found' });
    }
    
    // Verify that this booking belongs to the authenticated user
    if (booking.bookedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Update status based on resident response
    if (acceptDieselCost) {
      booking.status = 'pending'; // Back to pending for admin to confirm
      booking.dieselCost = true;
    } else {
      booking.status = 'cancelled';
      booking.adminComment += ' | Resident declined to cover diesel cost.';
    }
    
    booking.updatedAt = Date.now();
    const savedBooking = await booking.save();
    
    res.status(200).json(savedBooking);
  } catch (error) {
    console.error('Error updating resident response:', error);
    res.status(500).json({ message: 'Error updating resident response', error: error.message });
  }
};

// Get all bookings for a calendar view (simplified data)
export const getBookingsCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let dateFilter = {};
    
    // If month and year are provided, filter by that month
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        pickupDate: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }
    
    // Fetch only booked appointments (no cancelled/pending)
    const bookings = await AmbulanceBooking.find({
      ...dateFilter,
      status: { $in: ['booked', 'completed'] }
    }).select('pickupDate pickupTime duration status');
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching calendar bookings:', error);
    res.status(500).json({ message: 'Error fetching calendar bookings', error: error.message });
  }
};

// Check for booking conflicts (same date/time)
export const checkBookingConflict = async (req, res) => {
  try {
    const { pickupDate, pickupTime, duration, excludeBookingId } = req.query;
    
    if (!pickupDate || !pickupTime || !duration) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Convert pickupDate to Date object
    const bookingDate = new Date(pickupDate);
    
    // Build filter to find overlapping bookings
    const filter = {
      pickupDate: bookingDate,
      status: { $in: ['booked', 'pending', 'needs_approval'] }
    };
    
    // Exclude current booking when checking for edits
    if (excludeBookingId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }
    
    const existingBookings = await AmbulanceBooking.find(filter);
    
    // Simple time conflict check (would need more sophisticated logic for real-world use)
    const hasConflict = existingBookings.some(booking => booking.pickupTime === pickupTime);
    
    res.status(200).json({ hasConflict, conflictingBookings: hasConflict ? existingBookings : [] });
  } catch (error) {
    console.error('Error checking booking conflict:', error);
    res.status(500).json({ message: 'Error checking booking conflict', error: error.message });
  }
};

// Resident cancels their own booking
export const residentCancelBooking = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, cancellationReason } = req.body;
      
      const booking = await AmbulanceBooking.findById(id);
      
      if (!booking) {
        return res.status(404).json({ message: 'Ambulance booking not found' });
      }
      
      // Verify that this booking belongs to the authenticated user
      if (booking.bookedBy.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }
      
      // Only allow cancellation if booking is in pending or needs_approval status
      if (booking.status !== 'pending' && booking.status !== 'needs_approval' && booking.status !== 'booked') {
        return res.status(400).json({ 
          message: 'Booking cannot be cancelled. Only pending, needs approval, or booked status can be cancelled by resident.' 
        });
      }
      
      // Update booking status to cancelled
      booking.status = 'cancelled';
      booking.adminComment = booking.adminComment 
        ? `${booking.adminComment} | Cancelled by resident. Reason: ${cancellationReason || 'No reason provided'}`
        : `Cancelled by resident. Reason: ${cancellationReason || 'No reason provided'}`;
      
      booking.updatedAt = Date.now();
      const savedBooking = await booking.save();
      
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: savedBooking
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
  };
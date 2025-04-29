import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  FormHelperText,
  Chip,
  Card,
  CardContent,
  CardActions,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMonths } from 'date-fns';

// Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ResidentAmbulance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    pickupDate: null,
    pickupTime: null,
    duration: '',
    pickupAddress: '',
    contactNumber: '',
    destination: '',
    emergencyDetails: '',
    additionalNote: '',
    submitterRelation: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingConflict, setBookingConflict] = useState(false);
  
  // Dialog states
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDecisionDialog, setOpenDecisionDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Get user ID and load data on component mount
  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserBookings(storedUserId);
    }
    fetchCalendarData();
  }, []);

  // Fetch calendar data to show booked dates
  const fetchCalendarData = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await fetch(`http://localhost:3002/ambulance-calendar?month=${month}&year=${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  // Fetch user's bookings
  const fetchUserBookings = async (userId) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`http://localhost:3002/ambulance?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setUserBookings(data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle date and time picker changes
  const handleDateChange = (date) => {
    setFormData({ ...formData, pickupDate: date });
    if (errors.pickupDate) {
      setErrors({ ...errors, pickupDate: null });
    }
  };

  const handleTimeChange = (time) => {
    setFormData({ ...formData, pickupTime: time });
    if (errors.pickupTime) {
      setErrors({ ...errors, pickupTime: null });
    }
  };

  // Check for booking conflicts
  const checkBookingConflict = async () => {
    try {
      if (!formData.pickupDate || !formData.pickupTime) {
        return false;
      }
      
      const formattedDate = format(formData.pickupDate, 'yyyy-MM-dd');
      const formattedTime = format(formData.pickupTime, 'HH:mm');
      
      const response = await fetch(
        `http://localhost:3002/ambulance-conflict?pickupDate=${formattedDate}&pickupTime=${formattedTime}&duration=${formData.duration}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check booking conflict');
      }
      
      const data = await response.json();
      setBookingConflict(data.hasConflict);
      return data.hasConflict;
    } catch (error) {
      console.error('Error checking booking conflict:', error);
      return false;
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.patientName) newErrors.patientName = 'Patient name is required';
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.pickupAddress) newErrors.pickupAddress = 'Pickup address is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (!formData.emergencyDetails) newErrors.emergencyDetails = 'Emergency details are required';
    if (!formData.submitterRelation) newErrors.submitterRelation = 'Your relation to the patient is required';
    
    // Validate date is not in the past
    if (formData.pickupDate && formData.pickupDate < new Date().setHours(0, 0, 0, 0)) {
      newErrors.pickupDate = 'Pickup date cannot be in the past';
    }
    
    // Validate contact number format (simple check)
    if (formData.contactNumber && !/^\d{10,11}$/.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number (10-11 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const hasConflict = await checkBookingConflict();
    if (hasConflict) {
      setBookingConflict(true);
      return;
    }
    
    setOpenConfirmDialog(true);
  };

  // Submit booking to server
  const submitBooking = async () => {
    setLoading(true);
    setBookingError(null);
    
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const formattedDate = format(formData.pickupDate, 'yyyy-MM-dd');
      const formattedTime = format(formData.pickupTime, 'HH:mm');
      
      const bookingData = {
        ...formData,
        pickupDate: formattedDate,
        pickupTime: formattedTime,
        userId: userId // Include userId in the request body
      };
      
      const response = await fetch('http://localhost:3002/ambulance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const data = await response.json();
      
      // Clear form and show success message
      setFormData({
        patientName: '',
        pickupDate: null,
        pickupTime: null,
        duration: '',
        pickupAddress: '',
        contactNumber: '',
        destination: '',
        emergencyDetails: '',
        additionalNote: '',
        submitterRelation: ''
      });
      
      setBookingSuccess(true);
      setOpenConfirmDialog(false);
      
      // Refresh bookings list
      fetchUserBookings(userId);
      fetchCalendarData();
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Handle diesel cost decision
  const handleDieselCostDecision = async (accept) => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId || !currentBooking) {
        throw new Error('Missing required data');
      }
      
      const response = await fetch(`http://localhost:3002/ambulance/${currentBooking._id}/resident-response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          acceptDieselCost: accept,
          userId: userId 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update response');
      }
      
      // Refresh bookings list
      fetchUserBookings(userId);
      setOpenDecisionDialog(false);
    } catch (error) {
      console.error('Error updating response:', error);
      setBookingError(error.message || 'Failed to update response');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async () => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId || !currentBooking) {
        throw new Error('Missing required data');
      }
      
      const response = await fetch(`http://localhost:3002/ambulance/${currentBooking._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: userId,
          cancellationReason: cancellationReason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      // Show success message
      setBookingSuccess(true);
      
      // Refresh bookings list
      fetchUserBookings(userId);
      setOpenCancelDialog(false);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setBookingError(error.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'booked': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      case 'needs_approval': return 'secondary';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'booked': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'needs_approval': return <WarningIcon />;
      default: return null;
    }
  };

  // Format status text for display
  const formatStatus = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'booked': return 'Booked';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'needs_approval': return 'Needs Approval';
      default: return status;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DirectionsCarIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Ambulance Booking
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Barangay Maahas provides free ambulance service for emergencies. Note that in the latter months of the year, residents may need to cover diesel costs due to budget constraints.
            </Typography>
          </Alert>
          
          {bookingConflict && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1">
                This time slot is already booked. Please select a different date or time.
              </Typography>
            </Alert>
          )}
          
          {bookingSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1">
                Your ambulance booking has been submitted successfully! The admin will review your request.
              </Typography>
            </Alert>
          )}
          
          {bookingError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1">
                {bookingError}
              </Typography>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Patient Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Patient Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Patient Full Name"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  error={!!errors.patientName}
                  helperText={errors.patientName}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Relation to Patient"
                  name="submitterRelation"
                  value={formData.submitterRelation}
                  onChange={handleInputChange}
                  required
                  error={!!errors.submitterRelation}
                  helperText={errors.submitterRelation}
                  placeholder="e.g., Self, Parent, Spouse, Child, etc."
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber}
                  placeholder="e.g., 09XX-XXX-XXXX"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              {/* Pickup Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1 }} />
                  Pickup Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Pickup Date"
                  value={formData.pickupDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.pickupDate}
                      helperText={errors.pickupDate}
                    />
                  )}
                  minDate={new Date()}
                  maxDate={addMonths(new Date(), 2)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Pickup Time"
                  value={formData.pickupTime}
                  onChange={handleTimeChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.pickupTime}
                      helperText={errors.pickupTime}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.duration}>
                  <InputLabel>Estimated Duration</InputLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    label="Estimated Duration"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="1-2 hours">1-2 hours</MenuItem>
                    <MenuItem value="2-4 hours">2-4 hours</MenuItem>
                    <MenuItem value="4-6 hours">4-6 hours</MenuItem>
                    <MenuItem value="6+ hours">6+ hours</MenuItem>
                  </Select>
                  {errors.duration && <FormHelperText>{errors.duration}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Address"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  required
                  error={!!errors.pickupAddress}
                  helperText={errors.pickupAddress}
                  multiline
                  rows={2}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  error={!!errors.destination}
                  helperText={errors.destination}
                  placeholder="Hospital name or complete address"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              {/* Emergency Details */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalHospitalIcon sx={{ mr: 1 }} />
                  Emergency Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Details of Emergency"
                  name="emergencyDetails"
                  value={formData.emergencyDetails}
                  onChange={handleInputChange}
                  required
                  error={!!errors.emergencyDetails}
                  helperText={errors.emergencyDetails}
                  multiline
                  rows={3}
                  placeholder="Please describe the emergency situation or medical condition"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  name="additionalNote"
                  value={formData.additionalNote}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  placeholder="Any additional information we should know (optional)"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Booking Request'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setFormData({
                      patientName: '',
                      pickupDate: null,
                      pickupTime: null,
                      duration: '',
                      pickupAddress: '',
                      contactNumber: '',
                      destination: '',
                      emergencyDetails: '',
                      additionalNote: '',
                      submitterRelation: ''
                    });
                    setErrors({});
                  }}
                >
                  Clear Form
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* User's Recent Bookings */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarMonthIcon sx={{ mr: 1 }} />
            Your Ambulance Bookings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {loadingBookings ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : userBookings.length === 0 ? (
            <Alert severity="info">
              You don't have any ambulance bookings yet.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {userBookings.map((booking) => (
                <Grid item xs={12} sm={6} md={4} key={booking._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      borderTop: `4px solid ${theme.palette[getStatusColor(booking.status)].main}`
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" noWrap title={booking.patientName}>
                          {booking.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {booking.serviceId || 'N/A'}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatStatus(booking.status)}
                          color={getStatusColor(booking.status)}
                          icon={getStatusIcon(booking.status)}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {new Date(booking.pickupDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {booking.pickupTime} ({booking.duration})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap title={booking.destination}>
                          To: {booking.destination}
                        </Typography>
                      </Box>
                      
                      {booking.adminComment && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2">Admin Comment:</Typography>
                          <Typography variant="body2">{booking.adminComment}</Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          setCurrentBooking(booking);
                          setOpenDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                      
                      {booking.status === 'needs_approval' && (
                        <Button 
                          color="primary"
                          variant="contained"
                          size="small"
                          onClick={() => {
                            setCurrentBooking(booking);
                            setOpenDecisionDialog(true);
                          }}
                        >
                          Respond
                        </Button>
                      )}
                      
                      {/* Allow cancellation for pending, needs_approval, and booked statuses */}
                      {(booking.status === 'pending' || booking.status === 'needs_approval' || booking.status === 'booked') && (
                        <Button 
                          variant="outlined" 
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setCurrentBooking(booking);
                            setOpenCancelDialog(true);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
        
      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {currentBooking && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Ambulance Booking Details
                </Typography>
                <Chip
                  label={formatStatus(currentBooking.status)}
                  color={getStatusColor(currentBooking.status)}
                  icon={getStatusIcon(currentBooking.status)}
                  size="medium"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Patient Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      <strong>Patient Name:</strong> {currentBooking.patientName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Relation to Patient:</strong> {currentBooking.submitterRelation}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Contact Number:</strong> {currentBooking.contactNumber}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Pickup Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      <strong>Date:</strong> {format(new Date(currentBooking.pickupDate), 'MMMM d, yyyy')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Time:</strong> {currentBooking.pickupTime}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Duration:</strong> {currentBooking.duration}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Pickup Address:</strong> {currentBooking.pickupAddress}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Destination:</strong> {currentBooking.destination}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Emergency Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" paragraph>
                      {currentBooking.emergencyDetails}
                    </Typography>
                  </Box>
                  
                  {currentBooking.additionalNote && (
                    <>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Additional Notes
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" paragraph>
                          {currentBooking.additionalNote}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {currentBooking.adminComment && (
                    <>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Admin Comments
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                        <Typography variant="body1">
                          {currentBooking.adminComment}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Diesel Cost Coverage:</strong> {currentBooking.dieselCost ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created On:</strong> {format(new Date(currentBooking.createdAt), 'MMM d, yyyy h:mm a')}
                    </Typography>
                    {currentBooking.updatedAt && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Last Updated:</strong> {format(new Date(currentBooking.updatedAt), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailsDialog(false)} color="primary">
                Close
              </Button>
              
              {/* Show appropriate action buttons based on status */}
              {currentBooking.status === 'needs_approval' && (
                <Button 
                  onClick={() => {
                    setOpenDetailsDialog(false);
                    setOpenDecisionDialog(true);
                  }} 
                  color="primary" 
                  variant="contained"
                >
                  Respond to Request
                </Button>
              )}
              
              {(currentBooking.status === 'pending' || 
                currentBooking.status === 'needs_approval' || 
                currentBooking.status === 'booked') && (
                <Button 
                  onClick={() => {
                    setOpenDetailsDialog(false);
                    setOpenCancelDialog(true);
                  }} 
                  color="error" 
                  variant="outlined"
                  startIcon={<CancelIcon />}
                >
                  Cancel Booking
                </Button>
              )}
            </DialogActions>
          </>
        )}
        
      </Dialog>
        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
        >
          <DialogTitle>Confirm Ambulance Booking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to request an ambulance for {formData.patientName} on {formData.pickupDate && format(formData.pickupDate, 'MMMM d, yyyy')} at {formData.pickupTime && format(formData.pickupTime, 'h:mm a')}?
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Note:</Typography>
              <Typography variant="body2">
                Barangay Maahas provides free ambulance service for emergencies, but in the latter months of the year, residents may need to cover diesel costs due to budget constraints.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={submitBooking} 
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Diesel Cost Decision Dialog */}
        <Dialog
          open={openDecisionDialog}
          onClose={() => setOpenDecisionDialog(false)}
        >
          <DialogTitle>Diesel Cost Request</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {currentBooking?.adminComment || 'The admin has requested that you cover the diesel costs for this ambulance service due to budget constraints.'}
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Would you like to proceed with the booking by covering the diesel costs?</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => handleDieselCostDecision(false)} 
              color="secondary"
              disabled={loading}
            >
              No, Cancel Booking
            </Button>
            <Button 
              onClick={() => handleDieselCostDecision(true)} 
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              Yes, I'll Cover the Cost
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Cancellation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => {
            setOpenCancelDialog(false);
            setCancellationReason('');
          }}
        >
          <DialogTitle>Cancel Ambulance Booking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel your ambulance booking for {currentBooking?.patientName} on {currentBooking && new Date(currentBooking.pickupDate).toLocaleDateString()} at {currentBooking?.pickupTime}?
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Reason for Cancellation"
              fullWidth
              multiline
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancellation (optional)"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenCancelDialog(false);
                setCancellationReason('');
              }} 
              color="primary"
            >
              No, Keep Booking
            </Button>
            <Button 
              onClick={handleCancelBooking} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Yes, Cancel Booking'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Success Snackbar */}
        <Snackbar
          open={bookingSuccess}
          autoHideDuration={6000}
          onClose={() => setBookingSuccess(false)}
          message="Ambulance booking submitted successfully"
        />
      </Container>
    </LocalizationProvider>
  );
};

export default ResidentAmbulance;
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  FormControlLabel, 
  Checkbox,
  InputLabel, 
  MenuItem, 
  Select, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parseISO, isAfter, addHours, isBefore, startOfDay } from 'date-fns';

function ResidentCourt() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservations, setReservations] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [eventInfoOpen, setEventInfoOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [formData, setFormData] = useState({
    representativeName: '',
    reservationDate: null,
    startTime: null,
    duration: '',
    contactNumber: '',
    purpose: '',
    numberOfPeople: '',
    additionalNotes: ''
  });
  
  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' }
  ];
  
  const peopleRangeOptions = [
    { value: '1-10', label: '1-10 people' },
    { value: '11-20', label: '11-20 people' },
    { value: '21-30', label: '21-30 people' },
    { value: '31-50', label: '31-50 people' },
    { value: '51-100', label: '51-100 people' },
    { value: '100+', label: 'More than 100 people' }
  ];
  
  const purposeOptions = [
    'Sports Activity',
    'Community Event',
    'Personal Celebration',
    'Meeting',
    'Practice Session',
    'Other'
  ];
  
  // Fetch user's court reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const userId = localStorage.getItem('user');
        
        if (!userId) return;
        
        const response = await fetch(`http://localhost:3002/court?userId=${userId}`, {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservations');
        }
        
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setError('Failed to load your reservations');
      }
    };
    
    fetchReservations();
  }, []);
  
  // Fetch calendar data
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const today = new Date();
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        
        const response = await fetch(`http://localhost:3002/court-calendar?start=${today.toISOString().split('T')[0]}&end=${threeMonthsLater.toISOString().split('T')[0]}`, {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch calendar data');
        }
        
        const data = await response.json();
        setCalendarEvents(data.map(event => ({
          ...event,
          backgroundColor: event.status === 'approved' ? '#4caf50' : '#ff9800'
        })));
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };
    
    if (showCalendar) {
      fetchCalendarData();
    }
  }, [showCalendar]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle date and time pickers
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      reservationDate: date
    });
  };
  
  const handleTimeChange = (time) => {
    setFormData({
      ...formData,
      startTime: time
    });
  };

  // Check for time conflicts with existing reservations
  const checkTimeConflict = async () => {
    try {
      if (!formData.reservationDate || !formData.startTime || !formData.duration) {
        return false; // Can't check without complete data
      }
      
      const formattedDate = format(formData.reservationDate, 'yyyy-MM-dd');
      const formattedTime = format(formData.startTime, 'HH:mm');
      
      console.log('Checking conflict with:', {
        date: formattedDate,
        startTime: formattedTime,
        duration: formData.duration
      });
      
      const response = await fetch(
        `http://localhost:3002/court-conflict?date=${formattedDate}&startTime=${formattedTime}&duration=${formData.duration}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const data = await response.json();
      console.log('Conflict check result:', data);
      
      return data.hasConflict;
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return true; // Assume conflict on error (safer)
    }
  };

  // And update your handleSubmit function to properly call this:
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAgreed) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    // Validate form
    const requiredFields = ['representativeName', 'reservationDate', 'startTime', 'duration', 'contactNumber', 'purpose', 'numberOfPeople'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in all required fields`);
        return;
      }
    }
    
    // Check if date is in the past
    if (isBefore(formData.reservationDate, startOfDay(new Date()))) {
      setError('Cannot book reservations for past dates');
      return;
    }
    
    // Check for time conflicts
    setLoading(true);
    const hasTimeConflict = await checkTimeConflict();
    setLoading(false);
    
    if (hasTimeConflict) {
      setError('The selected time conflicts with an existing reservation. Please choose a different time.');
      return;
    }
    
    // Open confirmation dialog if no conflicts
    setConfirmDialogOpen(true);
  };
  
  // Submit reservation after confirmation
  const submitReservation = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    setError('');
  
    try {
      const userId = localStorage.getItem('user');
      
      console.log('User ID from localStorage:', userId);
      
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Format date and time
      const formattedData = {
        ...formData,
        userId: userId,
        reservationDate: format(formData.reservationDate, 'yyyy-MM-dd'),
        startTime: format(formData.startTime, 'HH:mm')
      };
      
      console.log('Submitting reservation data:', formattedData);
      
      const response = await fetch('http://localhost:3002/court', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit reservation');
      }
      
      // Success handling
      setReservations([responseData.reservation, ...reservations]);
      setSuccess('Court reservation submitted successfully!');
      
      // Reset form
      setFormData({
        representativeName: '',
        reservationDate: null,
        startTime: null,
        duration: '',
        contactNumber: '',
        purpose: '',
        numberOfPeople: '',
        additionalNotes: ''
      });
      
      setTermsAgreed(false);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setError(error.message || 'Failed to submit reservation');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel reservation
  const handleCancelReservation = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3002/court/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: localStorage.getItem('user') // Send user ID in the request body
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to cancel reservation');
      }
      
      // Update local state
      setReservations(reservations.map(res => 
        res._id === id ? { ...res, status: 'cancelled' } : res
      ));
      
      setSuccess('Reservation cancelled successfully');
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError(error.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };
  
  // View reservation details
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Calculate payment information based on selected time
  const calculatePayment = () => {
    if (!formData.startTime) return 'Free';
    
    const hour = formData.startTime.getHours();
    if (hour >= 18) {
      return formData.duration ? `₱${200 * formData.duration} (₱200/hour after 6PM)` : 'Rate: ₱200/hour after 6PM';
    }
    
    return 'Free (Morning hours)';
  };
  
  // Toggle calendar view
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h2">
          Court Reservation
        </Typography>
        
        <Grid container spacing={3}>
          {/* Booking Form */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                mb: 3
              }}
            >
              <Typography variant="h6" gutterBottom>
                Book the Barangay Maahas Covered Court
              </Typography>
              
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="representativeName"
                  label="Representative Full Name"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleInputChange}
                />
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Reservation Date *"
                      value={formData.reservationDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      disablePast
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Start Time *"
                      value={formData.startTime}
                      onChange={handleTimeChange}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      minutesStep={30}
                    />
                  </Grid>
                </Grid>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="duration-label">Duration</InputLabel>
                      <Select
                        labelId="duration-label"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        label="Duration"
                      >
                        {durationOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="contactNumber"
                      label="Contact Number"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="purpose-label">Purpose of Reservation</InputLabel>
                  <Select
                    labelId="purpose-label"
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    label="Purpose of Reservation"
                  >
                    {purposeOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="people-label">Estimated Number of People</InputLabel>
                  <Select
                    labelId="people-label"
                    id="numberOfPeople"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleInputChange}
                    label="Estimated Number of People"
                  >
                    {peopleRangeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="additionalNotes"
                  label="Additional Notes"
                  name="additionalNotes"
                  multiline
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                />
                
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Information:
                  </Typography>
                  <Typography variant="body2">
                    {calculatePayment()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Payment will be handled face-to-face on the day of your reservation.
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the terms and conditions for using the Barangay Maahas Covered Court
                    </Typography>
                  }
                  sx={{ mt: 2 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Reservation'}
                </Button>
              </Box>
            </Paper>
            
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={toggleCalendar}
              fullWidth
              sx={{ mb: 2 }}
            >
              {showCalendar ? 'Hide Calendar' : 'View Availability Calendar'}
            </Button>
          </Grid>
          
          {/* My Reservations / Calendar */}
          <Grid item xs={12} md={6}>
            {showCalendar ? (
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Court Availability
                  </Typography>
                  <Button 
                    size="small"
                    startIcon={<InfoOutlinedIcon />}
                    onClick={() => setEventInfoOpen(true)}
                  >
                    Info
                  </Button>
                </Box>
                <Box sx={{ height: '500px' }}>
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={calendarEvents}
                    height="100%"
                  />
                </Box>
              </Paper>
            ) : (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  My Reservations
                </Typography>
                
                {reservations.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                    You don't have any court reservations yet.
                  </Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {reservations.map((reservation) => (
                      <Card key={reservation._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="div">
                              {format(new Date(reservation.reservationDate), 'MMMM d, yyyy')}
                            </Typography>
                            <Chip 
                              label={reservation.status.toUpperCase()} 
                              color={getStatusColor(reservation.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            Time: {reservation.startTime} ({reservation.duration} hour{reservation.duration > 1 ? 's' : ''})
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Purpose: {reservation.purpose}
                          </Typography>
                          
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              size="small" 
                              onClick={() => handleViewDetails(reservation)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
        
        {/* Dialogs */}
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirm Reservation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please review your reservation details:
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Date:</strong> {formData.reservationDate ? format(formData.reservationDate, 'MMMM d, yyyy') : ''}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {formData.startTime ? format(formData.startTime, 'h:mm a') : ''} ({formData.duration} hour{formData.duration > 1 ? 's' : ''})
              </Typography>
              <Typography variant="body2">
                <strong>Representative:</strong> {formData.representativeName}
              </Typography>
              <Typography variant="body2">
                <strong>Purpose:</strong> {formData.purpose}
              </Typography>
              <Typography variant="body2">
                <strong>Payment:</strong> {calculatePayment()}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitReservation} variant="contained">
              Confirm Booking
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Reservation Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedReservation && (
            <>
              <DialogTitle>
                Reservation Details
                <Chip 
                  label={selectedReservation.status.toUpperCase()} 
                  color={getStatusColor(selectedReservation.status)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Date</Typography>
                    <Typography variant="body2" gutterBottom>
                      {format(new Date(selectedReservation.reservationDate), 'MMMM d, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Time</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.startTime} ({selectedReservation.duration} hour{selectedReservation.duration > 1 ? 's' : ''})
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Representative</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.representativeName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Contact Number</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.contactNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Number of People</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.numberOfPeople}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Purpose</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.purpose}
                    </Typography>
                  </Grid>
                  {selectedReservation.additionalNotes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Additional Notes</Typography>
                      <Typography variant="body2" gutterBottom>
                        {selectedReservation.additionalNotes}
                      </Typography>
                    </Grid>
                  )}
                  {selectedReservation.adminComment && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Admin Comment</Typography>
                      <Typography variant="body2" gutterBottom>
                        {selectedReservation.adminComment}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {selectedReservation.status === 'pending' && (
                  <Button 
                    onClick={() => handleCancelReservation(selectedReservation._id)} 
                    color="error"
                  >
                    Cancel Reservation
                  </Button>
                )}
                <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Calendar Info Dialog */}
        <Dialog
          open={eventInfoOpen}
          onClose={() => setEventInfoOpen(false)}
        >
          <DialogTitle>Calendar Information</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The calendar shows all existing court reservations. Booked time slots are not available for reservation.
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                <Typography variant="body2">Approved Reservations</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ff9800', mr: 1 }} />
                <Typography variant="body2">Pending Reservations</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventInfoOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbars for feedback */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}
  
export default ResidentCourt;
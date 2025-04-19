import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
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
  Chip,
  useMediaQuery,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';

function AdminCourt() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const calendarRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservations, setReservations] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionType, setActionType] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [calendarLoading, setCalendarLoading] = useState(false);
  
  // For pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Log action for admin activity tracking
  const logAdminAction = async (action, details, entityId) => {
    try {
      const token = localStorage.getItem('token');
      const adminName = `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`;
      
      await fetch('http://localhost:3002/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminName,
          action,
          details,
          entityId
        })
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };
  
  // Fetch all court reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      let url = 'http://localhost:3002/court';
      const params = new URLSearchParams();
      if (dateFilter) params.append('startDate', format(dateFilter, 'yyyy-MM-dd'));
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchReservations();
  }, [dateFilter, statusFilter]);
  
  const fetchCalendarData = useCallback(async () => {
    try {
      setCalendarLoading(true);
      
      const today = new Date();
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = threeMonthsLater.toISOString().split('T')[0];
      
      console.log('Fetching calendar data from API...', {
        start: startDate,
        end: endDate,
        userType: 'admin'
      });
      
      const url = `http://localhost:3002/court-calendar?start=${startDate}&end=${endDate}&userType=admin`;
      
      const response = await fetch(url);
      
      console.log('Calendar API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar data: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Raw calendar data from API:', data);
      
      // Verify and format events
      const validEvents = data
        .filter(event => event.start && event.end)
        .map((event, index) => ({
          id: event.id || `event-${index}`,
          title: event.title || 'Reserved',
          start: event.start,
          end: event.end,
          backgroundColor: event.status === 'approved' ? '#4caf50' : '#ff9800', // Green for approved, orange for pending
          borderColor: event.status === 'approved' ? '#4caf50' : '#ff9800',
          textColor: 'white'
        }));
      
      console.log('Formatted calendar events:', validEvents);
      
      setCalendarEvents(validEvents);
      
      // Force calendar refetch
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data: ' + error.message);
    } finally {
      setCalendarLoading(false);
    }
  }, []);
  
  // Fetch calendar data when calendar view is toggled
  useEffect(() => {
    if (showCalendar) {
      fetchCalendarData();
    }
  }, [showCalendar, fetchCalendarData]);
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open reservation details dialog
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };
  
  // Open action dialog (approve/reject)
  const handleOpenActionDialog = (reservation, action) => {
    setSelectedReservation(reservation);
    setActionType(action);
    setAdminComment('');
    setActionDialogOpen(true);
  };
  
  // Process reservation action (approve/reject)
  const handleProcessReservation = async () => {
    try {
      setLoading(true);
      setActionDialogOpen(false);
      
      const token = localStorage.getItem('token');
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      
      console.log(`Processing reservation ${selectedReservation._id} with status: ${status}`);
      
      // Update reservation status
      const response = await fetch(`http://localhost:3002/court/${selectedReservation._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          adminComment
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${actionType} reservation: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Reservation ${status} response:`, data);
      
      // Update local state
      setReservations(reservations.map(res => 
        res._id === selectedReservation._id ? data : res
      ));
      
      // Log the admin action
      const actionDetails = `${actionType === 'approve' ? 'Approved' : 'Rejected'} court reservation for ${selectedReservation.representativeName} on ${format(new Date(selectedReservation.reservationDate), 'MMM d, yyyy')}`;
      await logAdminAction(`court_reservation_${status}`, actionDetails, selectedReservation._id);
      
      setSuccess(`Reservation ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      
      // Refresh calendar if showing and the action was approve
      if (showCalendar && actionType === 'approve') {
        console.log('Refreshing calendar after approval');
        await fetchCalendarData();
      }
    } catch (error) {
      console.error(`Error ${actionType}ing reservation:`, error);
      setError(`Failed to ${actionType} reservation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle calendar view
  const toggleCalendar = () => {
    setShowCalendar(prev => !prev);
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
  
  // Clear filters
  const handleClearFilters = () => {
    setDateFilter(null);
    setStatusFilter('all');
  };
  
  // Calculate payment based on start time
  const calculatePayment = (startTime) => {
    const hour = parseInt(startTime.split(':')[0]);
    return hour >= 18 ? '₱200/hour' : 'Free (Morning hours)';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Manual refresh of calendar
  const handleRefreshCalendar = () => {
    if (showCalendar) {
      fetchCalendarData();
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h2" sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
        }}>
          Court Reservation Management
        </Typography>
        
        <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Filter by Date"
                value={dateFilter}
                onChange={(newDate) => setDateFilter(newDate)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                Clear
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={showCalendar ? handleRefreshCalendar : fetchReservations}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={toggleCalendar}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                {showCalendar ? 'List View' : 'Calendar'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {showCalendar ? (
          <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3, height: { xs: '400px', sm: '500px', md: '600px' } }}>
            <Typography variant="h6" gutterBottom>
              Court Reservation Calendar
              {calendarLoading && (
                <CircularProgress size={20} sx={{ ml: 2, verticalAlign: 'middle' }} />
              )}
            </Typography>
            <Box sx={{ height: '90%' }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: isMobile ? 'timeGridDay,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={calendarEvents}
                height="100%"
                eventDisplay="block"
                displayEventTime={true}
                displayEventEnd={true}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                eventClick={(info) => {
                  console.log('Event clicked:', info.event);
                  const reservationId = info.event.id;
                  const reservation = reservations.find(r => r._id === reservationId);
                  if (reservation) {
                    handleViewDetails(reservation);
                  } else {
                    console.log('Could not find matching reservation for event', reservationId);
                  }
                }}
              />
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ width: '100%' }}>
            <TableContainer component={Paper} sx={{ maxHeight: { xs: '400px', sm: '600px' } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    {!isMobile && <TableCell>Representative</TableCell>}
                    {!isMobile && <TableCell>Purpose</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 3 }}>
                        No reservations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (rowsPerPage > 0
                      ? reservations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : reservations
                    ).map((reservation) => (
                      <TableRow key={reservation._id}>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                          {formatDate(reservation.reservationDate)}
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                          {reservation.startTime} ({reservation.duration} hr)
                        </TableCell>
                        {!isMobile && <TableCell>{reservation.representativeName}</TableCell>}
                        {!isMobile && <TableCell>{reservation.purpose}</TableCell>}
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                          <Chip
                            label={reservation.status.toUpperCase()}
                            color={getStatusColor(reservation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 2px', sm: '16px' } }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(reservation)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          
                          {reservation.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleOpenActionDialog(reservation, 'approve')}
                                title="Approve"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                              
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenActionDialog(reservation, 'reject')}
                                title="Reject"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={reservations.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Paper>
        )}
        
        {/* Dialogs */}
        {/* Reservation Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              margin: { xs: '8px', sm: '16px' }
            }
          }}
        >
          {selectedReservation && (
            <>
              <DialogTitle>
                Court Reservation Details
                <Chip 
                  label={selectedReservation.status.toUpperCase()} 
                  color={getStatusColor(selectedReservation.status)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Date</Typography>
                    <Typography variant="body2" gutterBottom>
                      {format(new Date(selectedReservation.reservationDate), 'MMMM d, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Time</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.startTime} ({selectedReservation.duration} hour{selectedReservation.duration > 1 ? 's' : ''})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Representative</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.representativeName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Booked By</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.bookedBy?.firstName} {selectedReservation.bookedBy?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Contact Number</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReservation.contactNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Payment</Typography>
                    <Typography variant="body2" gutterBottom>
                      {calculatePayment(selectedReservation.startTime)}
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
                  {selectedReservation.processedBy && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Processed By</Typography>
                      <Typography variant="body2" gutterBottom>
                        {selectedReservation.processedBy.firstName} {selectedReservation.processedBy.lastName}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {selectedReservation.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        handleOpenActionDialog(selectedReservation, 'approve');
                      }} 
                      color="success"
                      variant="contained"
                      size={isMobile ? "small" : "medium"}
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        handleOpenActionDialog(selectedReservation, 'reject');
                      }} 
                      color="error"
                      variant="contained"
                      size={isMobile ? "small" : "medium"}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button onClick={() => setDetailsDialogOpen(false)} size={isMobile ? "small" : "medium"}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Action Dialog (Approve/Reject) */}
        <Dialog
          open={actionDialogOpen}
          onClose={() => setActionDialogOpen(false)}
          sx={{
            '& .MuiDialog-paper': {
              width: { xs: '90%', sm: '70%', md: '50%' },
              maxWidth: '600px'
            }
          }}
        >
          <DialogTitle>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Court Reservation
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this court reservation?' 
                : 'Please provide a reason for rejecting this reservation:'}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="adminComment"
              label="Comment (Optional for approval, required for rejection)"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              required={actionType === 'reject'}
              error={actionType === 'reject' && !adminComment}
              helperText={actionType === 'reject' && !adminComment ? 'Please provide a reason for rejection' : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)} size={isMobile ? "small" : "medium"}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessReservation} 
              color={actionType === 'approve' ? 'success' : 'error'}
              variant="contained"
              disabled={actionType === 'reject' && !adminComment}
              size={isMobile ? "small" : "medium"}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
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

export default AdminCourt;
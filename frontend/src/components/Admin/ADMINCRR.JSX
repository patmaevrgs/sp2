import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
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
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import InfoIcon from '@mui/icons-material/Info';


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
  
  // ServiceIdCell component for court reservations
  const ServiceIdCell = ({ reservation }) => {
    const [serviceId, setServiceId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (reservation && reservation._id) {
        setLoading(true);
        fetch(`http://localhost:3002/court/${reservation._id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.serviceId) {
              setServiceId(data.serviceId);
            }
            setLoading(false);
          })
          .catch(err => {
            console.error('Error fetching service ID:', err);
            setLoading(false);
          });
      }
    }, [reservation]);

    return (
      <>
        {loading ? (
          <CircularProgress size={16} />
        ) : (
          serviceId || (reservation.serviceId || 'N/A')
        )}
      </>
    );
  };

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
      
      // Get admin name
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      const adminName = `${firstName} ${lastName}`;

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
          adminComment,
          adminName
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ 
            fontWeight: 600,
            display: 'flex', 
            alignItems: 'center'
          }}
        >
          <CalendarMonthIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
          Court Reservation Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={showCalendar ? "contained" : "outlined"}
            startIcon={<CalendarMonthIcon />}
            onClick={toggleCalendar}
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            {showCalendar ? 'List View' : 'Calendar View'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={showCalendar ? handleRefreshCalendar : fetchReservations}
            size="small"
            sx={{ 
              borderRadius: 1.5,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.85rem'
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Paper 
        sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search by Service ID */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Service ID"
              onChange={(e) => {
                const searchValue = e.target.value.trim();
                // Implement local filtering based on serviceId
                // This is a simple implementation - you could modify fetchReservations to accept a search parameter
                if (searchValue) {
                  setStatusFilter('all'); // Reset to all when searching
                  const filtered = reservations.filter(r => 
                    r.serviceId && r.serviceId.toLowerCase().includes(searchValue.toLowerCase())
                  );
                  // You might need to adjust this to fit your actual data structure
                  // If using a server filter, you'd call fetchReservations with the search term instead
                } else {
                  // Reset to original data if search is cleared
                  fetchReservations();
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: 1.5,
                },
                minWidth: '250px'
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Filter by Date"
              value={dateFilter}
              onChange={(newDate) => setDateFilter(newDate)}
              sx={{ 
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem'
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content - Calendar or Tabbed List View */}
      {showCalendar ? (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            height: { xs: '450px', sm: '550px', md: '650px' },
            borderRadius: 2,
            boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
            overflow: 'hidden' 
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CalendarMonthIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
              Court Reservation Calendar
            </Typography>
            
            {calendarLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Loading calendar...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ height: 'calc(100% - 40px)' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: isMobile ? 'timeGridDay,timeGridWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
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
        /* Tabs and List View */
        <Paper 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={statusFilter === 'all' ? 0 : statusFilter === 'pending' ? 1 : statusFilter === 'approved' ? 2 : statusFilter === 'cancelled' ? 3 : 4}
              onChange={(e, newValue) => {
                switch(newValue) {
                  case 0: setStatusFilter('all'); break;
                  case 1: setStatusFilter('pending'); break;
                  case 2: setStatusFilter('approved'); break;
                  case 3: setStatusFilter('cancelled'); break;
                  case 4: setStatusFilter('rejected'); break;
                  default: setStatusFilter('all');
                }
                setPage(0); // Reset to first page when changing tabs
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  py: 1.5
                },
                '& .Mui-selected': {
                  fontWeight: 600
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    All Reservations
                    <Chip 
                      label={reservations.length} 
                      size="small"
                      sx={{
                        ml: 1,
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: 'grey.600',
                        color: 'white'
                      }}
                    />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Pending
                    {reservations.filter(r => r.status === 'pending').length > 0 && (
                      <Chip 
                        label={reservations.filter(r => r.status === 'pending').length} 
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: 'warning.main',
                          color: 'white'
                        }}
                      />
                    )}
                  </Box>
                } 
              />
              <Tab label="Approved" />
              <Tab label="Cancelled" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>
          {/* Reservations List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={32} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading reservations...
              </Typography>
            </Box>
          ) : reservations.filter(r => statusFilter === 'all' || r.status === statusFilter).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CalendarMonthIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No {statusFilter !== 'all' ? statusFilter : ''} court reservations found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try changing your filters or refreshing the page
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer sx={{ maxHeight: { xs: '450px', sm: '600px' } }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Service ID
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Time
                      </TableCell>
                      {!isMobile && (
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                            fontSize: '0.8rem'
                          }}
                        >
                          Representative
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                            fontSize: '0.8rem'
                          }}
                        >
                          Purpose
                        </TableCell>
                      )}
                      {statusFilter === 'all' && (
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                            fontSize: '0.8rem'
                          }}
                        >
                          Status
                        </TableCell>
                      )}
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? reservations
                          .filter(r => statusFilter === 'all' || r.status === statusFilter)
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : reservations.filter(r => statusFilter === 'all' || r.status === statusFilter)
                    ).map((reservation) => (
                      <TableRow 
                        key={reservation._id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            bgcolor: '#f5f5f5',
                            width: 'fit-content',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontFamily: 'monospace',
                          }}>
                            {reservation.serviceId || <ServiceIdCell reservation={reservation} />}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {formatDate(reservation.reservationDate)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {reservation.startTime} ({reservation.duration} hr)
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1, 
                                  bgcolor: 'primary.light',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {reservation.representativeName ? 
                                  reservation.representativeName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2) : 
                                  'U'}
                              </Avatar>
                              {reservation.representativeName}
                            </Box>
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {reservation.purpose.length > 30
                              ? `${reservation.purpose.substring(0, 30)}...`
                              : reservation.purpose}
                          </TableCell>
                        )}
                        {statusFilter === 'all' && (
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Chip
                              label={reservation.status.toUpperCase()}
                              color={getStatusColor(reservation.status)}
                              size="small"
                              sx={{ 
                                height: 24, 
                                fontSize: '0.75rem',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                              onClick={() => handleViewDetails(reservation)}
                              sx={{ 
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                py: 0.5,
                                minWidth: 0,
                              }}
                            >
                              View
                            </Button>
                            
                            {reservation.status === 'pending' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleOpenActionDialog(reservation, 'approve')}
                                  sx={{ 
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    px: 1,
                                    minWidth: 0
                                  }}
                                >
                                  Approve
                                </Button>
                                
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleOpenActionDialog(reservation, 'reject')}
                                  sx={{ 
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    px: 1,
                                    minWidth: 0
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid',
                borderColor: 'divider',
                px: 2
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {reservations.filter(r => statusFilter === 'all' || r.status === statusFilter).length > 0 ? 
                    `Showing ${Math.min(page * rowsPerPage + 1, reservations.filter(r => statusFilter === 'all' || r.status === statusFilter).length)} to ${Math.min((page + 1) * rowsPerPage, reservations.filter(r => statusFilter === 'all' || r.status === statusFilter).length)} of ${reservations.filter(r => statusFilter === 'all' || r.status === statusFilter).length} reservations` : 
                    'No reservations found'}
                </Typography>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reservations.filter(r => statusFilter === 'all' || r.status === statusFilter).length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      fontSize: '0.75rem',
                      color: 'text.secondary'
                    },
                    '.MuiTablePagination-select': {
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </Paper>
      )}
      {/* Reservation Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        {selectedReservation && (
          <>
            <DialogTitle sx={{ 
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonthIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="h6" component="span">
                  Court Reservation Details
                </Typography>
                <Chip 
                  label={selectedReservation.status.toUpperCase()} 
                  color={getStatusColor(selectedReservation.status)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              <IconButton
                aria-label="close"
                onClick={() => setDetailsDialogOpen(false)}
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha('#f5f5f5', 0.8),
                    color: 'text.primary'
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ px: 3, py: 2 }}>
              {/* Header info */}
              <Box sx={{ mb: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha('#e3f2fd', 0.3),
                    border: '1px solid',
                    borderColor: alpha('#2196f3', 0.1),
                    borderRadius: 2
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={7}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {format(new Date(selectedReservation.reservationDate), 'MMMM d, yyyy')} at {selectedReservation.startTime}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Chip 
                          label={`Service ID: ${selectedReservation.serviceId || 'Processing...'}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 28,
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            borderRadius: 1,
                            bgcolor: '#f5f5f5'
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
              
              {/* Timeline info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 1.5, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    bgcolor: alpha('#f5f5f5', 0.5) 
                  }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Reservation Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {format(new Date(selectedReservation.reservationDate), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 1.5, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    bgcolor: alpha('#f5f5f5', 0.5) 
                  }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReservation.startTime} ({selectedReservation.duration} hour{selectedReservation.duration > 1 ? 's' : ''})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Box sx={{ 
                    p: 1.5, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    bgcolor: alpha('#f5f5f5', 0.5),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Payment
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {calculatePayment(selectedReservation.startTime)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Main content */}
              <Grid container spacing={3}>
                {/* Left column */}
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                    Booking Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Representative
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedReservation.representativeName}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Contact Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedReservation.contactNumber}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Number of People
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedReservation.numberOfPeople}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Booked By
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedReservation.bookedBy?.firstName} {selectedReservation.bookedBy?.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Right column */}
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <InfoIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                    Additional Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Purpose
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedReservation.purpose}
                      </Typography>
                    </Box>
                    
                    {selectedReservation.additionalNotes && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Additional Notes
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedReservation.additionalNotes}
                        </Typography>
                      </Box>
                    )}
                    
                    {selectedReservation.adminComment && (
                      <Box sx={{ mt: 2 }}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: alpha('#f5f5f5', 0.7),
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                          }}
                        >
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'text.secondary',
                              fontSize: '0.8rem'
                            }}
                          >
                            <CommentIcon sx={{ mr: 1, fontSize: '1rem' }} />
                            Admin Comment
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                            {selectedReservation.adminComment}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                    
                    {selectedReservation.processedBy && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Processed By
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedReservation.processedBy.firstName} {selectedReservation.processedBy.lastName}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ 
              px: 3, 
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              {selectedReservation.status === 'pending' && (
                <>
                  <Button 
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleOpenActionDialog(selectedReservation, 'approve');
                    }} 
                    color="success"
                    variant="contained"
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
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
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button 
                onClick={() => setDetailsDialogOpen(false)} 
                variant="outlined"
                sx={{ 
                  ml: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          {actionType === 'approve' ? (
            <CheckCircleIcon sx={{ mr: 1.5, color: 'success.main' }} />
          ) : (
            <CancelIcon sx={{ mr: 1.5, color: 'error.main' }} />
          )}
          {actionType === 'approve' ? 'Approve' : 'Reject'} Court Reservation
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
            {actionType === 'approve' 
              ? 'Are you sure you want to approve this court reservation?' 
              : 'Please provide a reason for rejecting this reservation:'}
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="normal"
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
            variant="outlined"
            size="small"
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: '0.9rem'
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setActionDialogOpen(false)}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProcessReservation} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionType === 'reject' && !adminComment}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              position: 'relative'
            }}
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
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 1.5,
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 1.5,
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            }
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  </LocalizationProvider>
);
}

export default AdminCourt;
import React, { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneIcon from '@mui/icons-material/Done';
import CommentIcon from '@mui/icons-material/Comment';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Tab panel component for the bookings tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Styled badge for calendar events
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

// Responsive Dialog wrapper
const ResponsiveDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    [theme.breakpoints.down('sm')]: {
      margin: '16px',
      width: 'calc(100% - 32px)',
      maxHeight: 'calc(100% - 32px)',
    },
  },
}));

const AdminAmbulance = () => {
  const calendarRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [needsApprovalCount, setNeedsApprovalCount] = useState(0);
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [dieselDialogOpen, setDieselDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  
  // Admin info for logging
  const [adminName, setAdminName] = useState('');

  // Handle calendar view change
  const handleCalendarViewChange = (view) => {
    setCalendarView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };
  
  // Get admin name from localStorage
  useEffect(() => {
    try {
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      
      if (firstName && lastName) {
        setAdminName(`${firstName} ${lastName}`);
      } else if (localStorage.getItem("fullName")) {
        setAdminName(localStorage.getItem("fullName"));
      } else {
        setAdminName(localStorage.getItem("user") || "Unknown Admin");
      }
    } catch (e) {
      console.error("Error getting admin name:", e);
      setAdminName("Unknown Admin");
    }
  }, []);
  
  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/ambulance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data);
      
      // Count bookings by status
      const pendingBookings = data.filter(booking => booking.status === 'pending');
      const bookedBookings = data.filter(booking => booking.status === 'booked');
      const needsApprovalBookings = data.filter(booking => booking.status === 'needs_approval');
      
      setPendingCount(pendingBookings.length);
      setBookedCount(bookedBookings.length);
      setNeedsApprovalCount(needsApprovalBookings.length);
      
      // Initialize filtered bookings
      setFilteredBookings(data);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);
  
  // Apply filters when filter states change
  useEffect(() => {
    if (bookings.length === 0) return;
    
    let filtered = [...bookings];
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    // Apply tab filter
    else {
      switch (tabValue) {
        case 0: // All
          break;
        case 1: // Pending
          filtered = filtered.filter(booking => booking.status === 'pending');
          break;
        case 2: // Booked
          filtered = filtered.filter(booking => booking.status === 'booked');
          break;
        case 3: // Needs Approval
          filtered = filtered.filter(booking => booking.status === 'needs_approval');
          break;
        case 4: // Completed & Cancelled
          filtered = filtered.filter(booking => 
            booking.status === 'completed' || booking.status === 'cancelled'
          );
          break;
        default:
          break;
      }
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.pickupDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === filterDate.getTime();
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.patientName.toLowerCase().includes(query) ||
        booking.pickupAddress.toLowerCase().includes(query) ||
        booking.destination.toLowerCase().includes(query) ||
        booking.contactNumber.includes(query)
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateFilter, searchQuery, tabValue]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFilter(null);
    setSearchQuery('');
  };
  
  // Format booking for calendar
  const getCalendarEvents = () => {
    return bookings
      .filter(booking => booking.status === 'booked' || booking.status === 'completed')
      .map(booking => {
        const startDateTime = new Date(`${format(new Date(booking.pickupDate), 'yyyy-MM-dd')}T${booking.pickupTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000)); // 2-hour duration
  
        return {
          id: booking._id,
          title: `${booking.patientName} - ${booking.destination}`,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          color: booking.status === 'completed' ? theme.palette.success.main : theme.palette.primary.main,
          extendedProps: { booking }
        };
      });
  };
  
  // Handle calendar event click
  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps.booking);
    setDetailsDialogOpen(true);
  };
  
  // Update booking status
  const updateBookingStatus = async (id, status, comment = null, dieselCost = null) => {
    try {
      // Get admin ID from localStorage
      const adminId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      // Get admin name
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      const adminName = `${firstName} ${lastName}`;

      if (!adminId) {
        throw new Error('Admin ID not found. Please log in again.');
      }
      
      const updateData = { 
        status,
        adminId, // Include adminId in the request body
        adminName
      };
      
      if (comment !== null) updateData.adminComment = comment;
      if (dieselCost !== null) updateData.dieselCost = dieselCost;
      
      const response = await fetch(`http://localhost:3002/ambulance/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      // Refresh bookings
      fetchBookings();
      
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(error.message || 'Failed to update booking status');
      return false;
    }
  };
  
  // Helper function to get action type
  const getActionType = (action) => {
    switch (action) {
      case 'booked': return 'AMBULANCE_BOOKING_ACCEPTED';
      case 'cancelled': return 'AMBULANCE_BOOKING_CANCELLED';
      case 'completed': return 'AMBULANCE_BOOKING_COMPLETED';
      case 'needs_approval': return 'AMBULANCE_BOOKING_NEEDS_APPROVAL';
      default: return 'AMBULANCE_BOOKING_UPDATED';
    }
  };
  
  // Helper function to get action details
  const getActionDetails = (action, details) => {
    if (!selectedBooking) return '';
    
    let actionDetails = '';
    switch (action) {
      case 'booked':
        actionDetails = `Accepted ambulance booking ${selectedBooking.serviceId} for ${selectedBooking.patientName}`;
        break;
      case 'cancelled':
        actionDetails = `Cancelled ambulance booking ${selectedBooking.serviceId} for ${selectedBooking.patientName}`;
        break;
      case 'completed':
        actionDetails = `Marked ambulance booking ${selectedBooking.serviceId} as completed for ${selectedBooking.patientName}`;
        break;
      case 'needs_approval':
        actionDetails = `Requested diesel cost approval for ${selectedBooking.patientName}'s ambulance booking ${selectedBooking.serviceId}`;
        break;
      default:
        actionDetails = `Updated ambulance booking ${selectedBooking.serviceId} for ${selectedBooking.patientName}`;
    }
    
    if (details) {
      actionDetails += ` - ${details}`;
    }
    
    return actionDetails;
  };
  
  // Handle accepting a booking
  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(selectedBooking._id, 'booked');
    if (success) {
      setAcceptDialogOpen(false);
    }
  };
  
  // Handle cancelling a booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(
      selectedBooking._id, 
      'cancelled',
      adminComment || 'Cancelled by admin'
    );
    
    if (success) {
      setCancelDialogOpen(false);
      setAdminComment('');
    }
  };
  
  // Handle completing a booking
  const handleCompleteBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(selectedBooking._id, 'completed');
    if (success) {
      setCompleteDialogOpen(false);
    }
  };
  
  // Handle diesel cost request
  const handleDieselCostRequest = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(
      selectedBooking._id,
      'needs_approval',
      adminComment || 'Please confirm if you can cover the diesel cost for this ambulance service.'
    );
    
    if (success) {
      setDieselDialogOpen(false);
      setAdminComment('');
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
  
  // Format date with relative terms
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 2, sm: 3 }, 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 1.5, sm: 2 },
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'center', sm: 'flex-start' },
              mb: { xs: 1, sm: 0 }
            }}>
              <DirectionsCarIcon sx={{ 
                fontSize: { xs: 24, sm: 28, md: 32 }, 
                mr: { xs: 1, sm: 1.5, md: 2 }, 
                color: 'primary.main' 
              }} />
              <Typography variant={isMobile ? "h5" : "h4"} component="h1">
                Ambulance Booking Management
              </Typography>
            </Box>
            
            <Box sx={{ 
              ml: { xs: 0, sm: 'auto' }, 
              display: 'flex', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'center', sm: 'flex-end' },
            }}>
              <Tooltip title="Pending Requests">
                <Chip
                  icon={<PendingIcon />}
                  label={`Pending: ${pendingCount}`}
                  color="warning"
                  variant={tabValue === 1 ? "filled" : "outlined"}
                  onClick={() => setTabValue(1)}
                  size={isMobile ? "small" : "medium"}
                />
              </Tooltip>
              
              <Tooltip title="Needs Approval">
                <Chip
                  icon={<WarningIcon />}
                  label={`Needs Approval: ${needsApprovalCount}`}
                  color="secondary"
                  variant={tabValue === 3 ? "filled" : "outlined"}
                  onClick={() => setTabValue(3)}
                  sx={{ display: needsApprovalCount > 0 ? 'flex' : 'none' }}
                  size={isMobile ? "small" : "medium"}
                />
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Accordion 
              expanded={isFilterExpanded} 
              onChange={() => setIsFilterExpanded(!isFilterExpanded)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon sx={{ mr: 1 }} />
                  <Typography>Filters & Search</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Search Bookings"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Patient name, address, etc."
                      size={isMobile ? "small" : "medium"}
                      margin="dense"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"} margin="dense">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="booked">Booked</MenuItem>
                        <MenuItem value="needs_approval">Needs Approval</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Filter by Date"
                      value={dateFilter}
                      onChange={setDateFilter}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          size={isMobile ? "small" : "medium"}
                          margin="dense"
                        />
                      )}
                      clearable
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleResetFilters}
                      sx={{ height: { xs: 40, sm: 40, md: 56 } }}
                    >
                      Reset Filters
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ mb: 2 }}
              >
                <Tab 
                  icon={<DirectionsCarIcon />} 
                  label={isMobile ? "" : "All"} 
                  aria-label="All Bookings"
                  sx={{ minWidth: isMobile ? 'auto' : 'inherit' }}
                />
                <Tab 
                  icon={
                    <Badge badgeContent={pendingCount} color="warning">
                      <PendingIcon />
                    </Badge>
                  } 
                  label={isMobile ? "" : "Pending"} 
                  aria-label="Pending Bookings"
                  sx={{ minWidth: isMobile ? 'auto' : 'inherit' }}
                />
                <Tab 
                  icon={
                    <Badge badgeContent={bookedCount} color="success">
                      <CheckCircleIcon />
                    </Badge>
                  } 
                  label={isMobile ? "" : "Booked"} 
                  aria-label="Booked Appointments"
                  sx={{ minWidth: isMobile ? 'auto' : 'inherit' }}
                />
                <Tab 
                  icon={
                    <Badge badgeContent={needsApprovalCount} color="secondary">
                      <WarningIcon />
                    </Badge>
                  } 
                  label={isMobile ? "" : "Needs Approval"} 
                  aria-label="Bookings Needing Approval"
                  sx={{ minWidth: isMobile ? 'auto' : 'inherit' }}
                />
                <Tab 
                  icon={<DoneIcon />} 
                  label={isMobile ? "" : "Completed/Cancelled"} 
                  aria-label="Completed or Cancelled Bookings"
                  sx={{ minWidth: isMobile ? 'auto' : 'inherit' }}
                />
                <Tab 
                  icon={<CalendarMonthIcon />} 
                  label={isMobile ? "" : "Calendar"} 
                  aria-label="Calendar View"
                  sx={{ minWidth: isMobile ? 'auto' : 'inherit' }}
                />
              </Tabs>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* All Bookings Tab */}
                <TabPanel value={tabValue} index={0}>
                  {filteredBookings.length === 0 ? (
                    <Alert severity="info">No bookings found.</Alert>
                  ) : (
                    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                      {filteredBookings.map((booking) => (
                        <Grid item xs={12} sm={6} md={4} key={booking._id}>
                          <BookingCard 
                            booking={booking}
                            onViewDetails={() => {
                              setSelectedBooking(booking);
                              setDetailsDialogOpen(true);
                            }}
                            onAccept={() => {
                              setSelectedBooking(booking);
                              setAcceptDialogOpen(true);
                            }}
                            onCancel={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                            onComplete={() => {
                              setSelectedBooking(booking);
                              setCompleteDialogOpen(true);
                            }}
                            onDieselRequest={() => {
                              setSelectedBooking(booking);
                              setDieselDialogOpen(true);
                            }}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatStatus={formatStatus}
                            isMobile={isMobile}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>
                
                {/* Pending Tab */}
                <TabPanel value={tabValue} index={1}>
                  {filteredBookings.length === 0 ? (
                    <Alert severity="info">No pending bookings found.</Alert>
                  ) : (
                    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                      {filteredBookings.map((booking) => (
                        <Grid item xs={12} sm={6} md={4} key={booking._id}>
                          <BookingCard 
                            booking={booking}
                            onViewDetails={() => {
                              setSelectedBooking(booking);
                              setDetailsDialogOpen(true);
                            }}
                            onAccept={() => {
                              setSelectedBooking(booking);
                              setAcceptDialogOpen(true);
                            }}
                            onCancel={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                            onDieselRequest={() => {
                              setSelectedBooking(booking);
                              setDieselDialogOpen(true);
                            }}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatStatus={formatStatus}
                            isMobile={isMobile}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>
                
                {/* Booked Tab */}
                <TabPanel value={tabValue} index={2}>
                  {filteredBookings.length === 0 ? (
                    <Alert severity="info">No booked appointments found.</Alert>
                  ) : (
                    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                      {filteredBookings.map((booking) => (
                        <Grid item xs={12} sm={6} md={4} key={booking._id}>
                          <BookingCard 
                            booking={booking}
                            onViewDetails={() => {
                              setSelectedBooking(booking);
                              setDetailsDialogOpen(true);
                            }}
                            onComplete={() => {
                              setSelectedBooking(booking);
                              setCompleteDialogOpen(true);
                            }}
                            onCancel={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatStatus={formatStatus}
                            isMobile={isMobile}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>

                {/* Needs Approval Tab */}
                <TabPanel value={tabValue} index={3}>
                  {filteredBookings.length === 0 ? (
                    <Alert severity="info">No bookings needing approval found.</Alert>
                  ) : (
                    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                      {filteredBookings.map((booking) => (
                        <Grid item xs={12} sm={6} md={4} key={booking._id}>
                          <BookingCard 
                            booking={booking}
                            onViewDetails={() => {
                              setSelectedBooking(booking);
                              setDetailsDialogOpen(true);
                            }}
                            onAccept={() => {
                              setSelectedBooking(booking);
                              setAcceptDialogOpen(true);
                            }}
                            onCancel={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatStatus={formatStatus}
                            isMobile={isMobile}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>

                {/* Completed/Cancelled Tab */}
                <TabPanel value={tabValue} index={4}>
                  {filteredBookings.length === 0 ? (
                    <Alert severity="info">No completed or cancelled bookings found.</Alert>
                  ) : (
                    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                      {filteredBookings.map((booking) => (
                        <Grid item xs={12} sm={6} md={4} key={booking._id}>
                          <BookingCard 
                            booking={booking}
                            onViewDetails={() => {
                              setSelectedBooking(booking);
                              setDetailsDialogOpen(true);
                            }}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatStatus={formatStatus}
                            isMobile={isMobile}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>

                {/* Calendar View Tab */}
                <TabPanel value={tabValue} index={5}>
                  <Box sx={{ height: { xs: '50vh', sm: '60vh', md: '70vh' } }}>
                    {/* Calendar View Controls for Mobile */}
                    {isMobile && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 1 }}>
                        <Button 
                          size="small" 
                          variant={calendarView === 'dayGridMonth' ? 'contained' : 'outlined'}
                          onClick={() => handleCalendarViewChange('dayGridMonth')}
                        >
                          Month
                        </Button>
                        <Button 
                          size="small" 
                          variant={calendarView === 'timeGridWeek' ? 'contained' : 'outlined'}
                          onClick={() => handleCalendarViewChange('timeGridWeek')}
                        >
                          Week
                        </Button>
                        <Button 
                          size="small" 
                          variant={calendarView === 'timeGridDay' ? 'contained' : 'outlined'}
                          onClick={() => handleCalendarViewChange('timeGridDay')}
                        >
                          Day
                        </Button>
                      </Box>
                    )}
                    
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                      initialView={calendarView}
                      headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
                      }}
                      events={getCalendarEvents()}
                      eventClick={handleEventClick}
                      height="100%"
                      eventDisplay="block"
                      displayEventTime={true}
                      displayEventEnd={true}
                      allDaySlot={false}
                      slotMinTime="06:00:00"
                      slotMaxTime="22:00:00"
                    />
                  </Box>
                </TabPanel>
                </>
                )}
                </Box>
                </Paper>

                {/* Details Dialog */}
                <ResponsiveDialog
                  open={detailsDialogOpen}
                  onClose={() => setDetailsDialogOpen(false)}
                  maxWidth="md"
                  fullWidth
                  fullScreen={isMobile}
                >
                  {selectedBooking && (
                    <>
                      <DialogTitle>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? 1 : 0
                        }}>
                          <Typography variant={isMobile ? "subtitle1" : "h6"}>
                            Ambulance Booking Details
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Booking ID: {selectedBooking.serviceId || 'N/A'}
                          </Typography>
                          <Chip
                            label={formatStatus(selectedBooking.status)}
                            color={getStatusColor(selectedBooking.status)}
                            icon={getStatusIcon(selectedBooking.status)}
                            size={isMobile ? "small" : "medium"}
                          />
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Patient Information
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body1">
                                <strong>Patient Name:</strong> {selectedBooking.patientName}
                              </Typography>
                              <Typography variant="body1">
                                <strong>Submitted By:</strong> {selectedBooking.bookedBy?.firstName} {selectedBooking.bookedBy?.lastName} ({selectedBooking.submitterRelation})
                              </Typography>
                              <Typography variant="body1">
                                <strong>Contact Number:</strong> {selectedBooking.contactNumber}
                              </Typography>
                            </Box>
                            
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Pickup Details
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body1">
                                <strong>Date:</strong> {format(new Date(selectedBooking.pickupDate), 'MMMM d, yyyy')} ({formatDate(selectedBooking.pickupDate)})
                              </Typography>
                              <Typography variant="body1">
                                <strong>Time:</strong> {selectedBooking.pickupTime}
                              </Typography>
                              <Typography variant="body1">
                                <strong>Duration:</strong> {selectedBooking.duration}
                              </Typography>
                              <Typography variant="body1">
                                <strong>Pickup Address:</strong> {selectedBooking.pickupAddress}
                              </Typography>
                              <Typography variant="body1">
                                <strong>Destination:</strong> {selectedBooking.destination}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Emergency Details
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body1" paragraph>
                                {selectedBooking.emergencyDetails}
                              </Typography>
                            </Box>
                            
                            {selectedBooking.additionalNote && (
                              <>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                  Additional Notes
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body1" paragraph>
                                    {selectedBooking.additionalNote}
                                  </Typography>
                                </Box>
                              </>
                            )}
                            
                            {selectedBooking.adminComment && (
                              <>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                  Admin Comments
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                                  <Typography variant="body1">
                                    {selectedBooking.adminComment}
                                  </Typography>
                                </Box>
                              </>
                            )}
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Diesel Cost Coverage:</strong> {selectedBooking.dieselCost ? 'Yes' : 'No'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Created On:</strong> {format(new Date(selectedBooking.createdAt), 'MMM d, yyyy h:mm a')}
                              </Typography>
                              {selectedBooking.processedBy && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Processed By:</strong> {selectedBooking.processedBy.firstName} {selectedBooking.processedBy.lastName}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </DialogContent>
                      <DialogActions sx={{ 
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'stretch',
                        p: isMobile ? 2 : undefined,
                        '& > button': {
                          m: isMobile ? 0.5 : undefined
                        }
                      }}>
                        <Button onClick={() => setDetailsDialogOpen(false)} color="primary" fullWidth={isMobile}>
                          Close
                        </Button>
                        
                        {selectedBooking.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setDieselDialogOpen(true);
                              }} 
                              color="warning"
                              startIcon={<LocalGasStationIcon />}
                              fullWidth={isMobile}
                            >
                              Diesel Cost
                            </Button>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setCancelDialogOpen(true);
                              }} 
                              color="error"
                              fullWidth={isMobile}
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setAcceptDialogOpen(true);
                              }} 
                              color="success"
                              variant="contained"
                              fullWidth={isMobile}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        
                        {selectedBooking.status === 'needs_approval' && (
                          <>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setCancelDialogOpen(true);
                              }} 
                              color="error"
                              fullWidth={isMobile}
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setAcceptDialogOpen(true);
                              }} 
                              color="success"
                              variant="contained"
                              fullWidth={isMobile}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        
                        {selectedBooking.status === 'booked' && (
                          <>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setCancelDialogOpen(true);
                              }} 
                              color="error"
                              fullWidth={isMobile}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => {
                                setDetailsDialogOpen(false);
                                setCompleteDialogOpen(true);
                              }} 
                              color="success"
                              variant="contained"
                              fullWidth={isMobile}
                            >
                              Mark Completed
                            </Button>
                          </>
                        )}
                      </DialogActions>
                    </>
                  )}
                </ResponsiveDialog>

                {/* Accept Dialog */}
                <ResponsiveDialog
                  open={acceptDialogOpen}
                  onClose={() => setAcceptDialogOpen(false)}
                  fullScreen={isMobile}
                >
                  <DialogTitle>Accept Ambulance Booking</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to accept this ambulance booking for {selectedBooking?.patientName}?
                    </DialogContentText>
                    
                    {selectedBooking?.status === 'needs_approval' && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This booking has diesel cost approval from the resident.
                      </Alert>
                    )}
                  </DialogContent>
                  <DialogActions sx={{ flexDirection: isMobile ? 'column' : 'row', p: isMobile ? 2 : undefined }}>
                    <Button 
                      onClick={() => setAcceptDialogOpen(false)} 
                      color="primary"
                      fullWidth={isMobile}
                      sx={{ mb: isMobile ? 1 : undefined }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAcceptBooking} 
                      color="primary" 
                      variant="contained"
                      fullWidth={isMobile}
                    >
                      Accept Booking
                    </Button>
                  </DialogActions>
                </ResponsiveDialog>

                {/* Cancel Dialog */}
                <ResponsiveDialog
                  open={cancelDialogOpen}
                  onClose={() => setCancelDialogOpen(false)}
                  fullScreen={isMobile}
                >
                  <DialogTitle>Cancel Ambulance Booking</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to cancel this ambulance booking for {selectedBooking?.patientName}?
                    </DialogContentText>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Reason for Cancellation"
                      fullWidth
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      multiline
                      rows={isMobile ? 2 : 3}
                      sx={{ mt: 2 }}
                      size={isMobile ? "small" : "medium"}
                    />
                  </DialogContent>
                  <DialogActions sx={{ flexDirection: isMobile ? 'column' : 'row', p: isMobile ? 2 : undefined }}>
                    <Button 
                      onClick={() => setCancelDialogOpen(false)} 
                      color="primary"
                      fullWidth={isMobile}
                      sx={{ mb: isMobile ? 1 : undefined }}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleCancelBooking} 
                      color="error" 
                      variant="contained"
                      fullWidth={isMobile}
                    >
                      Cancel Booking
                    </Button>
                  </DialogActions>
                </ResponsiveDialog>

                {/* Complete Dialog */}
                <ResponsiveDialog
                  open={completeDialogOpen}
                  onClose={() => setCompleteDialogOpen(false)}
                  fullScreen={isMobile}
                >
                  <DialogTitle>Mark Booking as Completed</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to mark this ambulance service for {selectedBooking?.patientName} as completed?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions sx={{ flexDirection: isMobile ? 'column' : 'row', p: isMobile ? 2 : undefined }}>
                    <Button 
                      onClick={() => setCompleteDialogOpen(false)} 
                      color="primary"
                      fullWidth={isMobile}
                      sx={{ mb: isMobile ? 1 : undefined }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCompleteBooking} 
                      color="success" 
                      variant="contained"
                      fullWidth={isMobile}
                    >
                      Mark as Completed
                    </Button>
                  </DialogActions>
                </ResponsiveDialog>

                {/* Diesel Cost Dialog */}
                <ResponsiveDialog
                  open={dieselDialogOpen}
                  onClose={() => setDieselDialogOpen(false)}
                  fullScreen={isMobile}
                >
                  <DialogTitle>Request Diesel Cost Coverage</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Due to budget constraints, you need to ask the resident to cover the diesel cost for this ambulance service.
                    </DialogContentText>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Message to Resident"
                      fullWidth
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      multiline
                      rows={isMobile ? 2 : 3}
                      placeholder="Please confirm if you can cover the diesel cost for this ambulance service."
                      sx={{ mt: 2 }}
                      size={isMobile ? "small" : "medium"}
                    />
                  </DialogContent>
                  <DialogActions sx={{ flexDirection: isMobile ? 'column' : 'row', p: isMobile ? 2 : undefined }}>
                    <Button 
                      onClick={() => setDieselDialogOpen(false)} 
                      color="primary"
                      fullWidth={isMobile}
                      sx={{ mb: isMobile ? 1 : undefined }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDieselCostRequest} 
                      color="primary" 
                      variant="contained"
                      fullWidth={isMobile}
                    >
                      Send Request
                    </Button>
                  </DialogActions>
                </ResponsiveDialog>
                </Container>
                </LocalizationProvider>
                );
              };
                // Booking Card Component
              const BookingCard = ({ 
                booking, 
                onViewDetails, 
                onAccept, 
                onCancel, 
                onComplete,
                onDieselRequest,
                formatDate,
                getStatusColor,
                getStatusIcon,
                formatStatus,
                isMobile
              }) => {
                return (
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderTop: `4px solid ${
                        booking.status === 'pending' ? 'warning.main' : 
                        booking.status === 'booked' ? 'success.main' : 
                        booking.status === 'cancelled' ? 'error.main' : 
                        booking.status === 'completed' ? 'primary.main' : 
                        booking.status === 'needs_approval' ? 'secondary.main' : 'grey.500'
                      }`
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant={isMobile ? "subtitle1" : "h6"} noWrap title={booking.patientName}>
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
                          {formatDate(booking.pickupDate)}
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
                      
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {booking.contactNumber}
                        </Typography>
                      </Box>
                      
                      {booking.adminComment && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <CommentIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {booking.adminComment}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ 
                      justifyContent: 'space-between', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      p: isMobile ? '8px 12px' : 2, 
                      pt: 0,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={onViewDetails}
                        fullWidth={isMobile}
                      >
                        Details
                      </Button>
                      
                      {booking.status === 'pending' && (
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          width: isMobile ? '100%' : 'auto',
                          justifyContent: isMobile ? 'space-between' : 'flex-end'
                        }}>
                          <Tooltip title="Request Diesel Cost Coverage">
                            <IconButton size="small" color="warning" onClick={onDieselRequest}>
                              <LocalGasStationIcon />
                            </IconButton>
                          </Tooltip>
                          <Button size="small" color="error" onClick={onCancel}>
                            Reject
                          </Button>
                          <Button size="small" color="success" variant="contained" onClick={onAccept}>
                            Accept
                          </Button>
                        </Box>
                      )}
                      
                      {booking.status === 'booked' && (
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          width: isMobile ? '100%' : 'auto',
                          justifyContent: isMobile ? 'space-between' : 'flex-end'
                        }}>
                          <Button size="small" color="error" onClick={onCancel}>
                            Cancel
                          </Button>
                          <Button size="small" color="success" variant="contained" onClick={onComplete}>
                            Complete
                          </Button>
                        </Box>
                      )}
                      
                      {booking.status === 'needs_approval' && (
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          width: isMobile ? '100%' : 'auto',
                          justifyContent: isMobile ? 'space-between' : 'flex-end'
                        }}>
                          <Button size="small" color="error" onClick={onCancel}>
                            Reject
                          </Button>
                          <Button size="small" color="success" variant="contained" onClick={onAccept}>
                            Accept
                          </Button>
                        </Box>
                      )}
                    </CardActions>
                  </Card>
                );
              };

              export default AdminAmbulance;
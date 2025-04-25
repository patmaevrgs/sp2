import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  Room as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Event as EventIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const ResidentTransaction = () => {
  // Get userId from localStorage
  const userId = localStorage.getItem('user');
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filter, setFilter] = useState('all');
  
  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/transactions?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load your transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (transactionId) => {
  try {
    // First, get the transaction details
    const response = await fetch(`http://localhost:3002/transactions/${transactionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const transaction = await response.json();
    
    // Now, if this is a court reservation or ambulance booking, fetch the details
    let referenceDetails = null;
    
    if (transaction.serviceType === 'court_reservation' && transaction.referenceId) {
      const refResponse = await fetch(`http://localhost:3002/court/${transaction.referenceId}`);
      if (refResponse.ok) {
        referenceDetails = await refResponse.json();
      }
    } else if (transaction.serviceType === 'ambulance_booking' && transaction.referenceId) {
      const refResponse = await fetch(`http://localhost:3002/ambulance/${transaction.referenceId}`);
      if (refResponse.ok) {
        referenceDetails = await refResponse.json();
      }
    }
    
    // Combine the data
    setSelectedTransaction({
      ...transaction,
      referenceDetails: referenceDetails
    });
    
    setOpenDetails(true);
  } catch (err) {
    console.error('Error fetching transaction details:', err);
    setSnackbar({
      open: true,
      message: 'Failed to load transaction details',
      severity: 'error'
    });
  }
};

  const handleCancelRequest = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenCancel(true);
  };

  const confirmCancel = async () => {
    try {
      let cancelEndpoint = '';
      
      if (selectedTransaction.serviceType === 'ambulance_booking' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/ambulance/${selectedTransaction.referenceId}/cancel`;
      } else if (selectedTransaction.serviceType === 'court_reservation' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/court/${selectedTransaction.referenceId}/cancel`;
      } else {
        throw new Error('Cannot cancel this type of transaction');
      }
      
      const response = await fetch(cancelEndpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          cancellationReason
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setOpenCancel(false);
      setCancellationReason('');
      fetchTransactions();
      setSnackbar({
        open: true,
        message: 'Your request has been cancelled successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error cancelling request:', err);
      setSnackbar({
        open: true,
        message: 'Failed to cancel your request. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedTransaction(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Update the getStatusChip function to handle both approved and booked statuses
const getStatusChip = (status) => {
  let color = 'default';
  let label = status;

  switch (status) {
    case 'pending':
      color = 'warning';
      break;
    case 'approved':
    case 'booked':
      color = 'primary';
      // Display 'Approved' for both 'approved' and 'booked' statuses
      label = status === 'booked' ? 'Approved' : status;
      break;
    case 'completed':
      color = 'success';
      break;
    case 'cancelled':
      color = 'error';
      break;
    case 'needs_approval':
      color = 'info';
      label = 'Needs Approval';
      break;
    default:
      color = 'default';
  }

  return <Chip size="small" label={label.replace('_', ' ')} color={color} />;
};

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'ambulance_booking':
        return 'Ambulance Booking';
      case 'document_request':
        return 'Document Request';
      case 'payment':
        return 'Payment';
      case 'court_reservation':
        return 'Court Reservation';
      case 'other':
        return 'Other Service';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const canCancel = (transaction) => {
    return ['pending', 'needs_approval', 'booked'].includes(transaction.status);
  };

  const filteredTransactions = filter === 'all' 
  ? transactions 
  : transactions.filter(transaction => {
      if (filter === 'active') {
        // Include both 'approved' and 'booked' statuses in active transactions
        return ['pending', 'booked', 'needs_approval', 'approved'].includes(transaction.status);
      } else if (filter === 'ambulance') {
        return transaction.serviceType === 'ambulance_booking';
      } else if (filter === 'document') {
        return transaction.serviceType === 'document_request';
      } else if (filter === 'court') {
        return transaction.serviceType === 'court_reservation';
      } else if (filter === 'payment') {
        return transaction.serviceType === 'payment';
      } else if (filter === 'approved') {
        // Special case: if filtering for approved, also include booked
        return transaction.status === 'approved' || transaction.status === 'booked';
      } else if (filter === 'booked') {
        // Special case: if filtering for booked, also include approved
        return transaction.status === 'booked' || transaction.status === 'approved';
      } else {
        return transaction.status === filter;
      }
    });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // No transactions found
  if (!loading && transactions.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Transactions
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No transactions found</Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            You don't have any transactions yet.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4, px: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            My Transactions
          </Typography>
          <IconButton onClick={fetchTransactions} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="filter-select-label">Filter</InputLabel>
            <Select
              labelId="filter-select-label"
              value={filter}
              label="Filter"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="active">Active Requests</MenuItem>
              <MenuItem value="ambulance">Ambulance Bookings</MenuItem>
              <MenuItem value="document">Document Requests</MenuItem>
              <MenuItem value="court">Court Reservations</MenuItem>
              <MenuItem value="payment">Payments</MenuItem>
              <Divider />
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredTransactions.map((transaction) => (
            <Paper key={transaction._id} sx={{ mb: 2, overflow: 'hidden' }}>
              <ListItem 
                button 
                onClick={() => handleViewDetails(transaction._id)}
                sx={{ 
                  borderLeft: '4px solid',
                  borderLeftColor: (() => {
                    switch(transaction.status) {
                      case 'pending': return 'warning.main';
                      case 'approved':
                      case 'booked': return 'primary.main';
                      case 'completed': return 'success.main';
                      case 'cancelled': return 'error.main';
                      case 'needs_approval': return 'info.main';
                      default: return 'grey.500';
                    }
                  })()
                }}
              >
                <ListItemText
                  primary={getServiceTypeLabel(transaction.serviceType)}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {getStatusChip(transaction.status)}
                      </Typography>
                      {" — "}{formatDate(transaction.createdAt)}
                      {transaction.serviceType === 'ambulance_booking' && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.patientName} • {transaction.details.destination}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="view" onClick={() => handleViewDetails(transaction._id)}>
                    <VisibilityIcon />
                  </IconButton>
                  {canCancel(transaction) && (
                    <IconButton edge="end" aria-label="cancel" onClick={() => handleCancelRequest(transaction)} color="error">
                      <CancelIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>

        {/* Transaction Details Dialog - Mobile */}
        <Dialog 
          open={openDetails} 
          onClose={handleCloseDetails} 
          fullScreen={isMobile}
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Transaction Details
            <IconButton
              aria-label="close"
              onClick={handleCloseDetails}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CancelIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {getServiceTypeLabel(selectedTransaction.serviceType)}
                  </Typography>
                  {getStatusChip(selectedTransaction.status)}
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" paragraph>
                    <strong>Created:</strong> {formatDateTime(selectedTransaction.createdAt)}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Last Updated:</strong> {formatDateTime(selectedTransaction.updatedAt)}
                  </Typography>
                </Grid>
                
                {selectedTransaction.serviceType === 'ambulance_booking' && selectedTransaction.details && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                        Ambulance Booking Information
                      </Typography>
                      <Divider />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" paragraph>
                        <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        <strong>Patient:</strong> {selectedTransaction.details.patientName}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        <strong>Pickup Date:</strong> {formatDate(selectedTransaction.details.pickupDate)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        <strong>Pickup Time:</strong> {selectedTransaction.details.pickupTime}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        <strong>Destination:</strong> {selectedTransaction.details.destination}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        <strong>Diesel Cost Required:</strong> {selectedTransaction.details.dieselCost ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    
                    {selectedTransaction.referenceDetails && (
                      <Grid item xs={12}>
                        <Typography variant="body2" paragraph>
                          <strong>Additional Notes:</strong> {selectedTransaction.referenceDetails.additionalNote || 'None'}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Emergency Details:</strong> {selectedTransaction.referenceDetails.emergencyDetails || 'None'}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
                
                {selectedTransaction.adminComment && (
                  <Grid item xs={12}>
                    <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Admin Comment:
                        </Typography>
                        <Typography variant="body2">
                          {selectedTransaction.adminComment}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            {selectedTransaction && canCancel(selectedTransaction) && (
              <Button 
                onClick={() => {
                  handleCloseDetails();
                  handleCancelRequest(selectedTransaction);
                }} 
                color="error"
                fullWidth={isMobile}
                variant="contained"
              >
                Cancel Request
              </Button>
            )}
            {!isMobile && <Button onClick={handleCloseDetails}>Close</Button>}
          </DialogActions>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog 
          open={openCancel} 
          onClose={() => setOpenCancel(false)}
          fullWidth
        >
          <DialogTitle>Cancel Request</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this request? This action cannot be undone.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="reason"
              label="Reason for cancellation (optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancel(false)}>No, Keep Request</Button>
            <Button onClick={confirmCancel} color="error">
              Yes, Cancel Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // Desktop view
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Transactions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-select-label">Filter</InputLabel>
          <Select
            labelId="filter-select-label"
            value={filter}
            label="Filter"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Transactions</MenuItem>
            <MenuItem value="active">Active Requests</MenuItem>
            <MenuItem value="ambulance">Ambulance Bookings</MenuItem>
            <MenuItem value="document">Document Requests</MenuItem>
            <MenuItem value="court">Court Reservations</MenuItem>
            <MenuItem value="payment">Payments</MenuItem>
            <Divider />
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="booked">Booked</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchTransactions}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{getServiceTypeLabel(transaction.serviceType)}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell>{getStatusChip(transaction.status)}</TableCell>
                <TableCell>
                  {transaction.serviceType === 'ambulance_booking' && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Patient:</strong> {transaction.details.patientName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Destination:</strong> {transaction.details.destination}
                      </Typography>
                    </>
                  )}
                  {transaction.serviceType === 'court_reservation' && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Court:</strong> {transaction.details.courtName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {formatDate(transaction.details.reservationDate)}
                      </Typography>
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewDetails(transaction._id)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  {canCancel(transaction) && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleCancelRequest(transaction)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Transaction Details Dialog - Desktop */}
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Transaction Details
          {isMobile && (
            <IconButton
              aria-label="close"
              onClick={handleCloseDetails}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CancelIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {getServiceTypeLabel(selectedTransaction.serviceType)}
                </Typography>
                {getStatusChip(selectedTransaction.status)}
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedTransaction.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDateTime(selectedTransaction.createdAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {formatDateTime(selectedTransaction.updatedAt)}
                </Typography>
                {selectedTransaction.amount > 0 && (
                  <Typography variant="body2">
                    <strong>Amount:</strong> ₱{selectedTransaction.amount.toFixed(2)}
                  </Typography>
                )}
              </Grid>
              
              {/* Ambulance Booking Details */}
              {selectedTransaction.serviceType === 'ambulance_booking' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Ambulance Booking Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  {/* From transaction.details */}
                  {selectedTransaction.details && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Patient:</strong> {selectedTransaction.details.patientName}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Pickup Date:</strong> {formatDate(selectedTransaction.details.pickupDate)}
                        </Typography>
                        <Typography variant="body2">
                          <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Pickup Time:</strong> {selectedTransaction.details.pickupTime}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Destination:</strong> {selectedTransaction.details.destination}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Diesel Cost Required:</strong> {selectedTransaction.details.dieselCost ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {/* From referenceDetails - more comprehensive information */}
                  {selectedTransaction.referenceDetails && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Patient:</strong> {selectedTransaction.referenceDetails.patientName}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Pickup Date:</strong> {formatDate(selectedTransaction.referenceDetails.pickupDate)}
                        </Typography>
                        <Typography variant="body2">
                          <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Pickup Time:</strong> {selectedTransaction.referenceDetails.pickupTime}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Duration:</strong> {selectedTransaction.referenceDetails.duration}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Pickup Address:</strong> {selectedTransaction.referenceDetails.pickupAddress}
                        </Typography>
                        <Typography variant="body2">
                          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Destination:</strong> {selectedTransaction.referenceDetails.destination}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Contact:</strong> {selectedTransaction.referenceDetails.contactNumber}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Submitter Relation:</strong> {selectedTransaction.referenceDetails.submitterRelation}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Emergency Details:</strong> {selectedTransaction.referenceDetails.emergencyDetails || 'None'}
                        </Typography>
                        {selectedTransaction.referenceDetails.additionalNote && (
                          <Typography variant="body2">
                            <strong>Additional Notes:</strong> {selectedTransaction.referenceDetails.additionalNote}
                          </Typography>
                        )}
                      </Grid>
                    </>
                  )}
                </>
              )}
              
              {/* Court Reservation Details */}
              {selectedTransaction.serviceType === 'court_reservation' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Court Reservation Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  {/* From transaction.details */}
                  {selectedTransaction.details && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Representative:</strong> {selectedTransaction.details.representativeName}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Date:</strong> {formatDate(selectedTransaction.details.reservationDate)}
                        </Typography>
                        <Typography variant="body2">
                          <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Time:</strong> {selectedTransaction.details.startTime}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Duration:</strong> {selectedTransaction.details.duration} hours
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Purpose:</strong> {selectedTransaction.details.purpose}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {/* From referenceDetails - more comprehensive information */}
                  {selectedTransaction.referenceDetails && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Representative:</strong> {selectedTransaction.referenceDetails.representativeName}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Date:</strong> {formatDate(selectedTransaction.referenceDetails.reservationDate)}
                        </Typography>
                        <Typography variant="body2">
                          <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Time:</strong> {selectedTransaction.referenceDetails.startTime}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Duration:</strong> {selectedTransaction.referenceDetails.duration} hours
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Contact:</strong> {selectedTransaction.referenceDetails.contactNumber}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Purpose:</strong> {selectedTransaction.referenceDetails.purpose}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Number of People:</strong> {selectedTransaction.referenceDetails.numberOfPeople}
                        </Typography>
                      </Grid>
                      
                      {selectedTransaction.referenceDetails.additionalNotes && (
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Additional Notes:</strong> {selectedTransaction.referenceDetails.additionalNotes}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}
              
              {/* Document Request Details (placeholder for future implementation) */}
              {selectedTransaction.serviceType === 'document_request' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Document Request Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  {selectedTransaction.details && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Request details will be shown here</strong>
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
              
              {/* Admin Comments Section */}
              {selectedTransaction.adminComment && (
                <Grid item xs={12}>
                  <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Admin Comment:
                      </Typography>
                      <Typography variant="body2">
                        {selectedTransaction.adminComment}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedTransaction && canCancel(selectedTransaction) && (
            <Button 
              onClick={() => {
                handleCloseDetails();
                handleCancelRequest(selectedTransaction);
              }} 
              color="error"
              variant={isMobile ? "contained" : "outlined"}
              fullWidth={isMobile}
            >
              Cancel Request
            </Button>
          )}
          {!isMobile && <Button onClick={handleCloseDetails}>Close</Button>}
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={openCancel} onClose={() => setOpenCancel(false)}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this request? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for cancellation (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancel(false)}>No, Keep Request</Button>
          <Button onClick={confirmCancel} color="error">
            Yes, Cancel Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResidentTransaction;
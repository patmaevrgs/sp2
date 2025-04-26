import React, { useState, useEffect } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
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
  Refresh as RefreshIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const ResidentTransaction = () => {
  // Get userId from localStorage
  const userId = localStorage.getItem('user');
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackReportId, setFeedbackReportId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackSatisfied, setFeedbackSatisfied] = useState(true);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filter, setFilter] = useState('all');
  
  // Diesel response states
  const [openDieselDialog, setOpenDieselDialog] = useState(false);
  const [dieselResponseLoading, setDieselResponseLoading] = useState(false);
  
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
      
      // Now, fetch the reference details based on service type
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
      } else if (transaction.serviceType === 'infrastructure_report') {
        // Try to get the report ID from either referenceId or details.reportId
        let reportId = transaction.referenceId;
        
        // If referenceId is not available, check details.reportId
        if (!reportId && transaction.details && transaction.details.reportId) {
          reportId = transaction.details.reportId;
        }
        
        if (reportId) {
          const refResponse = await fetch(`http://localhost:3002/reports/${reportId}`);
          if (refResponse.ok) {
            const reportData = await refResponse.json();
            if (reportData.success && reportData.report) {
              referenceDetails = reportData.report;
            }
          }
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

  const submitFeedback = async () => {
    if (!feedbackReportId) {
      setSnackbar({
        open: true,
        message: 'Cannot submit feedback: Missing report reference',
        severity: 'error'
      });
      return;
    }
    
    setFeedbackSubmitting(true);
    
    try {
      console.log('Submitting feedback for report:', feedbackReportId);
      
      const response = await fetch(`http://localhost:3002/reports/${feedbackReportId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satisfied: feedbackSatisfied,
          comments: feedbackComments
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setOpenFeedbackDialog(false);
      setOpenDetails(false); // Close both dialogs
      setFeedbackComments('');
      setFeedbackSatisfied(true);
      setFeedbackReportId(null); // Clear the stored ID
      fetchTransactions();
      setSnackbar({
        open: true,
        message: 'Your feedback has been submitted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit your feedback: ' + err.message,
        severity: 'error'
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleCancelRequest = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenCancel(true);
  };

  const confirmCancel = async () => {
    try {
      let cancelEndpoint = '';
      let method = 'PATCH'; // Default method for ambulance and court
      
      if (selectedTransaction.serviceType === 'ambulance_booking' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/ambulance/${selectedTransaction.referenceId}/cancel`;
      } else if (selectedTransaction.serviceType === 'court_reservation' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/court/${selectedTransaction.referenceId}/cancel`;
      } else if (selectedTransaction.serviceType === 'infrastructure_report' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/reports/${selectedTransaction.referenceId}/cancel`;
        method = 'PUT'; // Use PUT for report cancellation as defined in your router
      } else {
        throw new Error('Cannot cancel this type of transaction');
      }
      
      const response = await fetch(cancelEndpoint, {
        method: method,
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
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel request');
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
        message: 'Failed to cancel your request: ' + err.message,
        severity: 'error'
      });
    }
  };

  // Diesel cost response functions
  const handleRespondToDiesel = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDieselDialog(true);
  };

  const handleDieselCostDecision = async (accept) => {
    setDieselResponseLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002/ambulance/${selectedTransaction.referenceId}/resident-response`, {
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Close the dialog and show success message
      setOpenDieselDialog(false);
      setSnackbar({
        open: true,
        message: accept 
          ? 'You have agreed to cover the diesel cost' 
          : 'You have declined to cover the diesel cost',
        severity: 'success'
      });
      
      // Refresh transactions list
      fetchTransactions();
    } catch (error) {
      console.error('Error responding to diesel cost:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit your response. Please try again.',
        severity: 'error'
      });
    } finally {
      setDieselResponseLoading(false);
    }
  };

  const needsDieselResponse = (transaction) => {
    return (
      transaction.status === 'needs_approval' && 
      transaction.serviceType === 'ambulance_booking'
    );
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

  const getStatusChip = (status, serviceType) => {
    let color = 'default';
    let label = status;
  
    // Special case for infrastructure reports
    if (serviceType === 'infrastructure_report') {
      // Map transaction status back to Report status
      switch (status) {
        case 'pending':
          color = 'warning';
          label = 'Pending';
          break;
        case 'approved':
          color = 'primary';
          label = 'In Progress';
          break;
        case 'completed':
          color = 'success';
          label = 'Resolved';
          break;
        case 'cancelled':
          color = 'error';
          label = 'Cancelled';
          break;
        default:
          color = 'default';
      }
      return <Chip size="small" label={label} color={color} />;
    }
  
    // Regular transaction status handling
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
      case 'rejected': // Also handle 'rejected' status
        color = 'error';
        // Display 'Cancelled' for both 'cancelled' and 'rejected' statuses
        label = status === 'rejected' ? 'Cancelled' : status;
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
      case 'infrastructure_report':
        return 'Infrastructure Report';
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
    // Special case for infrastructure reports
    if (transaction.serviceType === 'infrastructure_report') {
      // Only allow cancellation if status is 'pending' 
      return transaction.status === 'pending';
    }
    
    // For other transaction types
    return ['pending', 'needs_approval', 'booked', 'approved'].includes(transaction.status)
      && transaction.status !== 'completed';
  };

  const filteredTransactions = filter === 'all' 
  ? transactions 
  : transactions.filter(transaction => {
      if (filter === 'active') {
        return ['pending', 'booked', 'needs_approval', 'approved'].includes(transaction.status);
      } else if (filter === 'ambulance') {
        return transaction.serviceType === 'ambulance_booking';
      } else if (filter === 'document') {
        return transaction.serviceType === 'document_request';
      } else if (filter === 'court') {
        return transaction.serviceType === 'court_reservation';
      } else if (filter === 'payment') {
        return transaction.serviceType === 'payment';
      } else if (filter === 'infrastructure') {
        return transaction.serviceType === 'infrastructure_report';
      } else if (filter === 'approved') {
        return transaction.status === 'approved' || transaction.status === 'booked';
      } else if (filter === 'booked') {
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
                        {getStatusChip(transaction.status, transaction.serviceType)}
                      </Typography>
                      {" — "}{formatDate(transaction.createdAt)}
                      {needsDieselResponse(transaction) && (
                        <Chip 
                          size="small" 
                          label="Action Required" 
                          color="secondary" 
                          sx={{ ml: 1 }}
                          variant="outlined"
                        />
                      )}
                      {transaction.serviceType === 'ambulance_booking' && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.patientName} • {transaction.details.destination}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="view" onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(transaction._id);
                  }}>
                    <VisibilityIcon />
                  </IconButton>
                  {needsDieselResponse(transaction) && (
                    <IconButton 
                      edge="end" 
                      aria-label="respond" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRespondToDiesel(transaction);
                      }} 
                      color="secondary"
                    >
                      <ReplyIcon />
                    </IconButton>
                  )}
                  {canCancel(transaction) && (
                    <IconButton 
                      edge="end" 
                      aria-label="cancel" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelRequest(transaction);
                      }} 
                      color="error"
                    >
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
            {selectedTransaction && needsDieselResponse(selectedTransaction) && (
              <Button 
                onClick={() => {
                  handleCloseDetails();
                  handleRespondToDiesel(selectedTransaction);
                }} 
                color="secondary"
                fullWidth={isMobile}
                variant="contained"
                sx={{ mr: 1 }}
              >
                Respond to Diesel Request
              </Button>
            )}
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

        {/* Diesel Cost Response Dialog */}
        <Dialog
          open={openDieselDialog}
          onClose={() => !dieselResponseLoading && setOpenDieselDialog(false)}
        >
          <DialogTitle>Diesel Cost Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The ambulance service requires you to cover the diesel cost for this trip. Do you agree to cover this cost?
            </DialogContentText>
            {selectedTransaction?.adminComment && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Admin Note:</strong> {selectedTransaction.adminComment}
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => handleDieselCostDecision(false)} 
              color="error"
              disabled={dieselResponseLoading}
            >
              Decline
            </Button>
            <Button 
              onClick={() => handleDieselCostDecision(true)} 
              color="primary" 
              variant="contained"
              disabled={dieselResponseLoading}
            >
              {dieselResponseLoading ? <CircularProgress size={24} /> : 'Accept'}
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
            <MenuItem value="infrastructure">Infrastructure Reports</MenuItem>
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
                <TableCell>
                  {getStatusChip(transaction.status, transaction.serviceType)}
                  {needsDieselResponse(transaction) && (
                    <Chip 
                      size="small" 
                      label="Action Required" 
                      color="secondary" 
                      sx={{ ml: 1, mt: 1 }}
                      variant="outlined"
                    />
                  )}
                </TableCell>
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
                  {transaction.serviceType === 'infrastructure_report' && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Issue:</strong> {transaction.details.issueType || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {transaction.details.location || 'N/A'}
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
                  {needsDieselResponse(transaction) && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleRespondToDiesel(transaction)}
                      sx={{ mr: 1 }}
                    >
                      Respond
                    </Button>
                  )}
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
              
              {/* Infrastructure Report Details */}
              {selectedTransaction?.serviceType === 'infrastructure_report' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Infrastructure Report Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  {/* From transaction.details */}
                  {selectedTransaction.details && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Issue Type:</strong> {selectedTransaction.details.issueType || 'N/A'}
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
                          <strong>Reported By:</strong> {selectedTransaction.referenceDetails.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Contact Number:</strong> {selectedTransaction.referenceDetails.contactNumber}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Date Observed:</strong> {formatDate(selectedTransaction.referenceDetails.dateObserved)}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Issue Type:</strong> {selectedTransaction.referenceDetails.issueType}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Location:</strong> {selectedTransaction.referenceDetails.location}
                        </Typography>
                        <Typography variant="body2">
                          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Nearest Landmark:</strong> {selectedTransaction.referenceDetails.nearestLandmark}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {selectedTransaction.referenceDetails.status}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Description:</strong> {selectedTransaction.referenceDetails.description}
                        </Typography>
                        {selectedTransaction.referenceDetails.additionalComments && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Additional Comments:</strong> {selectedTransaction.referenceDetails.additionalComments}
                          </Typography>
                        )}
                      </Grid>
                      
                      {/* Admin Comments Section */}
                      {selectedTransaction.referenceDetails.adminComments && (
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Admin Comments:</strong> {selectedTransaction.referenceDetails.adminComments}
                          </Typography>
                        </Grid>
                      )}
                      
                      {/* Resident Feedback Section */}
                      {selectedTransaction.referenceDetails.residentFeedback && 
                        (selectedTransaction.referenceDetails.residentFeedback.satisfied !== undefined || 
                        selectedTransaction.referenceDetails.residentFeedback.comments) && (
                        <Grid item xs={12}>
                          <Card sx={{ mt: 2, bgcolor: '#f8f9fa' }}>
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                Your Feedback:
                              </Typography>
                              {selectedTransaction.referenceDetails.residentFeedback.satisfied !== undefined && (
                                <Typography variant="body2">
                                  <strong>Satisfied:</strong> {selectedTransaction.referenceDetails.residentFeedback.satisfied ? 'Yes' : 'No'}
                                </Typography>
                              )}
                              {selectedTransaction.referenceDetails.residentFeedback.comments && (
                                <Typography variant="body2">
                                  <strong>Comments:</strong> {selectedTransaction.referenceDetails.residentFeedback.comments}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      
                      {/* Display attached media if available */}
                      {selectedTransaction.referenceDetails.mediaUrls && 
                      selectedTransaction.referenceDetails.mediaUrls.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Attached Media:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedTransaction.referenceDetails.mediaUrls.map((url, index) => (
                              <Box 
                                key={index}
                                component="a" 
                                href={`http://localhost:3002${url}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                  border: '1px solid #ddd',
                                  padding: '5px',
                                  borderRadius: '4px'
                                }}
                              >
                                <Typography variant="body2">View Attachment {index + 1}</Typography>
                              </Box>
                            ))}
                          </Box>
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
          {selectedTransaction && 
          selectedTransaction.serviceType === 'infrastructure_report' && 
          (
            // If using transaction status (lowercase)
            (selectedTransaction.status === 'completed' || 
            // Or if using report status (PascalCase) from referenceDetails
            (selectedTransaction.referenceDetails?.status === 'Resolved'))
          ) && 
          !selectedTransaction.referenceDetails?.residentFeedback && (
            <Button 
              onClick={() => {
                // Store the report ID before opening feedback dialog
                let reportId = null;
                if (selectedTransaction.referenceId) {
                  reportId = selectedTransaction.referenceId;
                } else if (selectedTransaction.details && selectedTransaction.details.reportId) {
                  reportId = selectedTransaction.details.reportId;
                } else if (selectedTransaction.referenceDetails && selectedTransaction.referenceDetails._id) {
                  reportId = selectedTransaction.referenceDetails._id;
                }
                
                if (reportId) {
                  setFeedbackReportId(reportId);
                  setOpenFeedbackDialog(true);
                } else {
                  setSnackbar({
                    open: true,
                    message: 'Cannot determine report ID for feedback',
                    severity: 'error'
                  });
                }
              }} 
              color="primary"
              variant="contained"
              sx={{ mr: 1 }}
            >
              Provide Feedback
            </Button>
          )}
          {selectedTransaction && needsDieselResponse(selectedTransaction) && (
            <Button 
              onClick={() => {
                handleCloseDetails();
                handleRespondToDiesel(selectedTransaction);
              }} 
              color="secondary"
              variant={isMobile ? "contained" : "outlined"}
              sx={{ mr: 1 }}
            >
              Respond to Diesel Request
            </Button>
          )}
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

      {/* Feedback Dialog for Infrastructure Reports */}
      <Dialog
        open={openFeedbackDialog}
        onClose={() => {
          setOpenFeedbackDialog(false);
          setFeedbackReportId(null); // Clear the ID when closing
        }}
      >
        <DialogTitle>Provide Your Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you satisfied with how your issue was resolved?
          </DialogContentText>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={feedbackSatisfied ? 'yes' : 'no'}
              onChange={(e) => setFeedbackSatisfied(e.target.value === 'yes')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes, I'm satisfied" />
              <FormControlLabel value="no" control={<Radio />} label="No, I'm not satisfied" />
            </RadioGroup>
          </FormControl>
          <TextField
            margin="dense"
            id="feedback-comments"
            label="Comments (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={feedbackComments}
            onChange={(e) => setFeedbackComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFeedbackDialog(false)}>Cancel</Button>
          <Button 
            onClick={submitFeedback} 
            color="primary"
            variant="contained"
            disabled={feedbackSubmitting}
          >
            {feedbackSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diesel Cost Response Dialog */}
      <Dialog
        open={openDieselDialog}
        onClose={() => !dieselResponseLoading && setOpenDieselDialog(false)}
      >
        <DialogTitle>Diesel Cost Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The ambulance service requires you to cover the diesel cost for this trip. Do you agree to cover this cost?
          </DialogContentText>
          {selectedTransaction?.adminComment && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Admin Note:</strong> {selectedTransaction.adminComment}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleDieselCostDecision(false)} 
            color="error"
            disabled={dieselResponseLoading}
          >
            Decline
          </Button>
          <Button 
            onClick={() => handleDieselCostDecision(true)} 
            color="primary" 
            variant="contained"
            disabled={dieselResponseLoading}
          >
            {dieselResponseLoading ? <CircularProgress size={24} /> : 'Accept'}
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
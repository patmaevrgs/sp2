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
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Divider,
  Tooltip,
  useMediaQuery,
  CardActions,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isToday, isTomorrow } from 'date-fns';

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
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transactions-tabpanel-${index}`}
      aria-labelledby={`transactions-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ResidentTransactions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Cancel states
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  
  useEffect(() => {
    // Get user ID from localStorage - use either userId or user (which also contains ID)
    const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchTransactions(storedUserId);
    }
  }, []);
  
  // Fetch all user transactions
  const fetchTransactions = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/ambulance?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
      // For now, we only have ambulance bookings as transactions
      const formattedTransactions = data.map(booking => ({
        ...booking,
        type: 'ambulance',
        transactionDate: booking.createdAt
      }));
      
      setTransactions(formattedTransactions);
      setFilteredTransactions(formattedTransactions);
      setError(null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters when filter states change
  useEffect(() => {
    if (transactions.length === 0) return;
    
    let filtered = [...transactions];
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === filterDate.getTime();
      });
    }
    
    // Apply tab filter
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Pending
        filtered = filtered.filter(transaction => 
          transaction.status === 'pending' || transaction.status === 'needs_approval'
        );
        break;
      case 2: // Active
        filtered = filtered.filter(transaction => transaction.status === 'booked');
        break;
      case 3: // Completed
        filtered = filtered.filter(transaction => transaction.status === 'completed');
        break;
      case 4: // Cancelled
        filtered = filtered.filter(transaction => transaction.status === 'cancelled');
        break;
      default:
        break;
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, statusFilter, dateFilter, tabValue]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFilter(null);
  };
  
  // Handle transaction cancellation
  const handleCancelTransaction = async () => {
    if (!selectedTransaction) return;
    
    setCancelLoading(true);
    setCancelError(null);
    
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      // For ambulance bookings
      if (selectedTransaction.type === 'ambulance') {
        const response = await fetch(`http://localhost:3002/ambulance/${selectedTransaction._id}/cancel`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            cancellationReason
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to cancel booking');
        }
        
        // Refresh transactions
        fetchTransactions(userId);
        setCancelSuccess(true);
        
        // Reset states
        setOpenCancelDialog(false);
        setSelectedTransaction(null);
        setCancellationReason('');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      setCancelError(error.message || 'Failed to cancel transaction');
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Handle opening cancel dialog
  const handleOpenCancelDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenCancelDialog(true);
  };
  
  // Handle opening details dialog
  const handleOpenDetailsDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDetailsDialog(true);
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
      case 'needs_approval': return 'Action Required';
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
  
  // Get transaction type name
  const getTransactionTypeName = (type) => {
    switch (type) {
      case 'ambulance': return 'Ambulance Booking';
      default: return type;
    }
  };
  
  // Get transaction type icon
  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'ambulance': return <DirectionsCarIcon />;
      default: return <ReceiptIcon />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ReceiptIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              My Transactions
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Filter Transactions
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="needs_approval">Action Required</MenuItem>
                    <MenuItem value="booked">Booked</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Filter by Date"
                  value={dateFilter}
                  onChange={setDateFilter}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size={isMobile ? "small" : "medium"} />
                  )}
                  clearable
                />
              </Grid>
              
              <Grid item xs={12} sm={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ height: isMobile ? 40 : 56 }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ mb: 2 }}
              >
                <Tab label="All Transactions" />
                <Tab label="Pending" />
                <Tab label="Active" />
                <Tab label="Completed" />
                <Tab label="Cancelled" />
              </Tabs>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {filteredTransactions.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No transactions found matching your filters.
                  </Alert>
                ) : (
                  <TabPanel value={tabValue} index={tabValue}>
                    <Grid container spacing={3}>
                      {filteredTransactions.map((transaction) => (
                        <Grid item xs={12} sm={6} md={4} key={transaction._id}>
                          <TransactionCard 
                            transaction={transaction}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatStatus={formatStatus}
                            getTransactionTypeName={getTransactionTypeName}
                            getTransactionTypeIcon={getTransactionTypeIcon}
                            onCancel={handleOpenCancelDialog}
                            onViewDetails={handleOpenDetailsDialog}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </TabPanel>
                )}
              </>
            )}
          </Box>
        </Paper>
        
        {/* Details Dialog */}
        <Dialog
          open={openDetailsDialog}
          onClose={() => {
            setOpenDetailsDialog(false);
            setSelectedTransaction(null);
          }}
          maxWidth="md"
          fullWidth
        >
          {selectedTransaction && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {selectedTransaction.type === 'ambulance' ? 'Ambulance Booking Details' : 'Transaction Details'}
                  </Typography>
                  <Chip
                    label={formatStatus(selectedTransaction.status)}
                    color={getStatusColor(selectedTransaction.status)}
                    icon={getStatusIcon(selectedTransaction.status)}
                    size="medium"
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                {selectedTransaction.type === 'ambulance' && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Patient Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">
                          <strong>Patient Name:</strong> {selectedTransaction.patientName}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Relation to Patient:</strong> {selectedTransaction.submitterRelation}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Contact Number:</strong> {selectedTransaction.contactNumber}
                        </Typography>
                      </Box>
                      
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Pickup Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">
                          <strong>Date:</strong> {format(new Date(selectedTransaction.pickupDate), 'MMMM d, yyyy')}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Time:</strong> {selectedTransaction.pickupTime}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Duration:</strong> {selectedTransaction.duration}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Pickup Address:</strong> {selectedTransaction.pickupAddress}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Destination:</strong> {selectedTransaction.destination}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Emergency Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" paragraph>
                          {selectedTransaction.emergencyDetails}
                        </Typography>
                      </Box>
                      
                      {selectedTransaction.additionalNote && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Additional Notes
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" paragraph>
                              {selectedTransaction.additionalNote}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {selectedTransaction.adminComment && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Admin Comments
                          </Typography>
                          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                            <Typography variant="body1">
                              {selectedTransaction.adminComment}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Diesel Cost Coverage:</strong> {selectedTransaction.dieselCost ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Created On:</strong> {format(new Date(selectedTransaction.createdAt), 'MMM d, yyyy h:mm a')}
                        </Typography>
                        {selectedTransaction.updatedAt && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Last Updated:</strong> {format(new Date(selectedTransaction.updatedAt), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetailsDialog(false)} color="primary">
                  Close
                </Button>
                
                {/* Only show cancel button if booking can be cancelled */}
                {(selectedTransaction.status === 'pending' || 
                  selectedTransaction.status === 'needs_approval' || 
                  selectedTransaction.status === 'booked') && (
                  <Button 
                    onClick={() => {
                      setOpenDetailsDialog(false);
                      handleOpenCancelDialog(selectedTransaction);
                    }} 
                    color="error" 
                    startIcon={<CancelIcon />}
                  >
                    Cancel Booking
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Cancellation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => {
            setOpenCancelDialog(false);
            setCancellationReason('');
            setSelectedTransaction(null);
          }}
        >
          <DialogTitle>Cancel Transaction</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedTransaction?.type === 'ambulance' ? (
                <>
                  Are you sure you want to cancel your ambulance booking for {selectedTransaction?.patientName} on {selectedTransaction && formatDate(selectedTransaction.pickupDate)} at {selectedTransaction?.pickupTime}?
                </>
              ) : (
                <>
                  Are you sure you want to cancel this transaction?
                </>
              )}
            </DialogContentText>
            
            {cancelError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {cancelError}
              </Alert>
            )}
            
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
                setSelectedTransaction(null);
              }} 
              color="primary"
            >
              No, Keep Transaction
            </Button>
            <Button 
              onClick={handleCancelTransaction} 
              color="error" 
              variant="contained"
              disabled={cancelLoading}
            >
              {cancelLoading ? <CircularProgress size={24} /> : 'Yes, Cancel Transaction'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Success Snackbar */}
        <Snackbar
          open={cancelSuccess}
          autoHideDuration={6000}
          onClose={() => setCancelSuccess(false)}
          message="Transaction cancelled successfully"
        />
      </Container>
    </LocalizationProvider>
  );
};

// Transaction Card Component
const TransactionCard = ({ 
  transaction, 
  formatDate,
  getStatusColor,
  getStatusIcon,
  formatStatus,
  getTransactionTypeName,
  getTransactionTypeIcon,
  onCancel,
  onViewDetails
}) => {
  const theme = useTheme();
  
  // Determine if transaction can be cancelled
  const canCancel = transaction.status === 'pending' || 
                    transaction.status === 'needs_approval' || 
                    transaction.status === 'booked';
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: `4px solid ${theme.palette[getStatusColor(transaction.status)].main}`
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            icon={getTransactionTypeIcon(transaction.type)}
            label={getTransactionTypeName(transaction.type)}
            size="small"
            color="info"
          />
          <Chip
            icon={getStatusIcon(transaction.status)}
            label={formatStatus(transaction.status)}
            size="small"
            color={getStatusColor(transaction.status)}
          />
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {transaction.type === 'ambulance' ? transaction.patientName : 'Transaction'}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        {transaction.type === 'ambulance' && (
          <>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {formatDate(transaction.pickupDate)} at {transaction.pickupTime}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Duration: {transaction.duration}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                To: {transaction.destination}
              </Typography>
            </Box>
          </>
        )}
        
        {transaction.status === 'needs_approval' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Action required: {transaction.adminComment}
            </Typography>
          </Alert>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Transaction date: {format(new Date(transaction.transactionDate), 'MMM d, yyyy h:mm a')}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={() => onViewDetails(transaction)}
        >
          View Details
        </Button>
        
        {canCancel && (
          <Button 
            size="small"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => onCancel(transaction)}
          >
            Cancel
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ResidentTransactions;
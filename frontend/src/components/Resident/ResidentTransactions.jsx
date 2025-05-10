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
  Link,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  FilePresent as FileIcon,
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
  
  const SERVICE_TYPES = {
    AMBULANCE: 'ambulance_booking',
    COURT: 'court_reservation',
    INFRASTRUCTURE: 'infrastructure_report',
    PROJECT_PROPOSAL: 'project_proposal',
    DOCUMENT: 'document_request',
    RESIDENT: 'resident_registration',
    OTHER: 'other'
  };
  
  const STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    BOOKED: 'booked',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    NEEDS_APPROVAL: 'needs_approval',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    CONSIDERED: 'considered',
    RESOLVED: 'resolved'
  };

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
  
  // Add this helper function below your state declarations
  const formatStatusText = (status) => {
  if (!status) return '';
  // Convert snake_case to Title Case
  return status.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
          console.log('Ambulance booking details:', referenceDetails); // Debug log
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
      else if (transaction.serviceType === 'document_request' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/documents/${transaction.referenceId}`);
        if (refResponse.ok) {
          const documentData = await refResponse.json();
          if (documentData.success && documentData.documentRequest) {
            referenceDetails = documentData.documentRequest;
          }
        }
      }
      else if (transaction.serviceType === 'project_proposal' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/proposals/${transaction.referenceId}`);
        if (refResponse.ok) {
          const proposalData = await refResponse.json();
          if (proposalData.success && proposalData.proposal) {
            referenceDetails = proposalData.proposal;
            
            // Store the original proposal status in the transaction details
            if (transaction.details && !transaction.details.proposalStatus) {
              transaction.details = {
                ...transaction.details,
                proposalStatus: proposalData.proposal.status
              };
            }
          }
        }
      }
      else if (transaction.serviceType === 'resident_registration' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/residents/${transaction.referenceId}`);
        if (refResponse.ok) {
          const residentData = await refResponse.json();
          if (residentData.success && residentData.data) {
            referenceDetails = residentData.data;
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

  // ServiceIdCell component for displaying service IDs in the table
  const ServiceIdCell = ({ transaction }) => {
    const [serviceId, setServiceId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      // Only fetch if we have a referenceId and the service type is one we can handle
      if (transaction.referenceId && 
          [SERVICE_TYPES.AMBULANCE, SERVICE_TYPES.COURT, SERVICE_TYPES.INFRASTRUCTURE, 
          SERVICE_TYPES.PROJECT_PROPOSAL, SERVICE_TYPES.DOCUMENT, SERVICE_TYPES.RESIDENT].includes(transaction.serviceType)) {
        
        setLoading(true);
        
        // Determine the correct endpoint based on service type
        let endpoint;
        switch(transaction.serviceType) {
          case SERVICE_TYPES.AMBULANCE:
            endpoint = `http://localhost:3002/ambulance/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.COURT:
            endpoint = `http://localhost:3002/court/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.INFRASTRUCTURE:
            endpoint = `http://localhost:3002/reports/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.PROJECT_PROPOSAL:
            endpoint = `http://localhost:3002/proposals/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.DOCUMENT:
            endpoint = `http://localhost:3002/documents/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.RESIDENT:
            endpoint = `http://localhost:3002/residents/${transaction.referenceId}`;
            break;
          default:
            endpoint = null;
        }
        
        if (endpoint) {
          fetch(endpoint)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              // For reports and other specialized services, the data structure might be different
              if (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && data && data.report) {
                if (data.report.serviceId) {
                  setServiceId(data.report.serviceId);
                }
              } else if (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && data && data.proposal) {
                if (data.proposal.serviceId) {
                  setServiceId(data.proposal.serviceId);
                }
              } else if (transaction.serviceType === SERVICE_TYPES.DOCUMENT && data && data.documentRequest) {
                if (data.documentRequest.serviceId) {
                  setServiceId(data.documentRequest.serviceId);
                }
              } else if (data && data.serviceId) {
                setServiceId(data.serviceId);
              }
              setLoading(false);
            })
            .catch(err => {
              console.error(`Error fetching service ID for ${transaction.serviceType}:`, err);
              setLoading(false);
            });
        }
      } else if (transaction.details && transaction.details.serviceId) {
        // If the service ID is already in the transaction details, use it directly
        setServiceId(transaction.details.serviceId);
      }
    }, [transaction]);

    // Don't show anything for service types we don't handle
    if (![SERVICE_TYPES.AMBULANCE, SERVICE_TYPES.COURT, SERVICE_TYPES.INFRASTRUCTURE,
          SERVICE_TYPES.PROJECT_PROPOSAL, SERVICE_TYPES.DOCUMENT].includes(transaction.serviceType)) {
      return <span>-</span>;
    }

    return (
      <>
        {loading ? (
          <CircularProgress size={16} />
        ) : (
          serviceId || 
          transaction.details?.serviceId || 
          (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.referenceDetails?.serviceId) ||
          (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.referenceDetails?.serviceId) ||
          (transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.referenceDetails?.serviceId) ||
          'N/A'
        )}
      </>
    );
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
      } else if (selectedTransaction.serviceType === 'project_proposal' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/proposals/${selectedTransaction.referenceId}/cancel`;
        method = 'PATCH';
      } else if (selectedTransaction.serviceType === 'document_request' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/documents/${selectedTransaction.referenceId}/cancel`;
        method = 'PATCH';
      } else if (selectedTransaction.serviceType === 'resident_registration' && selectedTransaction.referenceId) {
          cancelEndpoint = `http://localhost:3002/residents/${selectedTransaction.referenceId}/cancel`;
          method = 'PATCH';
      } else {
        throw new Error('Cannot cancel this type of transaction');
      }
      
      const response = await fetch(cancelEndpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  // Updated getStatusChip function to display correct status for document requests
  const getStatusChip = (status, serviceType, transaction) => {
    let color = 'default';
    let label = status;
    
    // Document Request status mapping
    if (serviceType === SERVICE_TYPES.DOCUMENT) {
      // Use reference details status if available
      if (transaction?.referenceDetails?.status) {
        const docStatus = transaction.referenceDetails.status;
        
        switch (docStatus) {
          case STATUS.PENDING:
            color = 'warning';
            label = 'Pending';
            break;
          case STATUS.IN_PROGRESS:
            color = 'primary';
            label = 'In Progress';
            break;
          case STATUS.COMPLETED:
            color = 'success';
            label = 'Completed';
            break;
          case STATUS.REJECTED:
            color = 'error';
            label = 'Rejected';
            break;
          case STATUS.CANCELLED:
            color = 'default';
            label = 'Cancelled';
            break;
          default:
            color = 'default';
            label = formatStatusText(docStatus);
        }
        
        return <Chip size="small" label={label} color={color} />;
      }
      
      // If reference details not available, map from transaction status
      switch (status) {
        case STATUS.PENDING:
          color = 'warning';
          label = 'Pending';
          break;
        case STATUS.APPROVED:
          color = 'primary';
          label = 'In Progress';
          break;
        case STATUS.COMPLETED:
          color = 'success';
          label = 'Completed';
          break;
        case STATUS.CANCELLED:
        case STATUS.REJECTED:
          color = 'error';
          label = 'Cancelled';
          break;
        default:
          color = 'default';
          label = formatStatusText(status);
      }
      
      return <Chip size="small" label={label} color={color} />;
    }
    
    // Project Proposal status mapping
    if (serviceType === SERVICE_TYPES.PROJECT_PROPOSAL) {
      switch (status) {
        case STATUS.PENDING:
          color = 'warning';
          label = 'Pending';
          break;
        case STATUS.APPROVED: // Maps to 'considered' in proposal terms
          color = 'primary';
          label = 'Considered';
          break;
        case STATUS.COMPLETED: // Maps to 'approved' in proposal terms
          color = 'success';
          label = 'Approved';
          break;
        case STATUS.CANCELLED: // Maps to 'rejected' in proposal terms
        case STATUS.REJECTED:
          color = 'error';
          label = 'Rejected';
          break;
        case STATUS.NEEDS_APPROVAL:
          color = 'info';
          label = 'In Review';
          break;
        default:
          color = 'default';
          label = formatStatusText(status);
      }
      
      return <Chip size="small" label={label} color={color} />;
    }
  
    // Infrastructure Report status mapping
    if (serviceType === SERVICE_TYPES.INFRASTRUCTURE) {
      // Map transaction status back to Report status
      switch (status) {
        case STATUS.PENDING:
          color = 'warning';
          label = 'Pending';
          break;
        case STATUS.APPROVED:
          color = 'primary';
          label = 'In Progress';
          break;
        case STATUS.COMPLETED:
          color = 'success';
          label = 'Resolved';
          break;
        case STATUS.CANCELLED:
        case STATUS.REJECTED:
          color = 'error';
          label = 'Cancelled';
          break;
        default:
          color = 'default';
          label = formatStatusText(status);
      }
      return <Chip size="small" label={label} color={color} />;
    }
  
    // Regular transaction status handling for other service types
    switch (status) {
      case STATUS.PENDING:
        color = 'warning';
        label = 'Pending';
        break;
      case STATUS.APPROVED:
      case STATUS.BOOKED:
        color = 'primary';
        label = 'Approved';
        break;
      case STATUS.COMPLETED:
        color = 'success';
        label = 'Completed';
        break;
      case STATUS.CANCELLED:
      case STATUS.REJECTED:
        color = 'error';
        label = 'Cancelled';
        break;
      case STATUS.NEEDS_APPROVAL:
        color = 'info';
        label = 'Needs Approval';
        break;
      default:
        color = 'default';
        label = formatStatusText(status);
    }
  
    return <span className="status-chip-wrapper">{<Chip size="small" label={label} color={color} />}</span>;
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case SERVICE_TYPES.AMBULANCE:
        return 'Ambulance Booking';
      case SERVICE_TYPES.COURT:
        return 'Court Reservation';
      case SERVICE_TYPES.INFRASTRUCTURE:
        return 'Infrastructure Report';
      case SERVICE_TYPES.PROJECT_PROPOSAL:
        return 'Project Proposal';
      case SERVICE_TYPES.DOCUMENT:
        return 'Document Request';
      case SERVICE_TYPES.RESIDENT:
        return 'Resident Registration';
      case SERVICE_TYPES.OTHER:
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

  // Function to check if a transaction can be cancelled
  const canCancel = (transaction) => {
    // For document requests
    if (transaction.serviceType === SERVICE_TYPES.DOCUMENT) {
      // If we have reference details with original status
      if (transaction.referenceDetails && transaction.referenceDetails.status) {
        // Only allow cancellation if status is 'pending'
        return transaction.referenceDetails.status === STATUS.PENDING;
      }
      // Otherwise use transaction status
      return transaction.status === STATUS.PENDING;
    }
    
    // Special case for project proposals
    if (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL) {
      // First check if referenceDetails has a status
      if (transaction.referenceDetails && transaction.referenceDetails.status) {
        const status = transaction.referenceDetails.status.toLowerCase();
        // If status contains "reject" or "cancel" or is "approved" or "completed", don't allow cancellation
        if (status.includes('reject') || status.includes('cancel') || 
            status === 'approved' || status === 'completed') {
          return false;
        }
      }
      
      // Then check details.proposalStatus
      if (transaction.details && transaction.details.proposalStatus) {
        const status = transaction.details.proposalStatus.toLowerCase();
        // If status contains "reject" or "cancel" or is "approved" or "completed", don't allow cancellation
        if (status.includes('reject') || status.includes('cancel') || 
            status === 'approved' || status === 'completed') {
          return false;
        }
      }
      
      // Finally check transaction status
      const status = transaction.status.toLowerCase();
      // If status contains "reject" or "cancel" or is "approved" or "completed", don't allow cancellation
      if (status.includes('reject') || status.includes('cancel') || 
          status === 'approved' || status === 'completed') {
        return false;
      }
      
      // If none of the above conditions were met, allow cancellation
      return true;
    }
    
    // Special case for infrastructure reports
    if (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE) {
      // Only allow cancellation if status is 'pending' 
      return transaction.status === STATUS.PENDING;
    }
    
    // Special case for resident registration
    if (transaction.serviceType === SERVICE_TYPES.RESIDENT) {
      // Only allow cancellation if status is 'pending'
      return transaction.status === STATUS.PENDING;
    }

    // For other transaction types
    return [STATUS.PENDING, STATUS.NEEDS_APPROVAL, STATUS.BOOKED, STATUS.APPROVED].includes(transaction.status)
      && transaction.status !== STATUS.COMPLETED;
  };

  const filteredTransactions = filter === 'all' 
  ? transactions 
  : transactions.filter(transaction => {
      if (filter === 'active') {
        return [STATUS.PENDING, STATUS.BOOKED, STATUS.NEEDS_APPROVAL, STATUS.APPROVED, STATUS.IN_PROGRESS].includes(transaction.status);
      } else if (filter === 'ambulance') {
        return transaction.serviceType === SERVICE_TYPES.AMBULANCE;
      } else if (filter === 'document') {
        return transaction.serviceType === SERVICE_TYPES.DOCUMENT;
      } else if (filter === 'court') {
        return transaction.serviceType === SERVICE_TYPES.COURT;
      } else if (filter === 'infrastructure') {
        return transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE;
      } else if (filter === 'project_proposal') {
        return transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL;
      } else if (filter === 'approved') {
        return [STATUS.APPROVED, STATUS.BOOKED].includes(transaction.status);
      } else if (filter === 'booked') {
        return [STATUS.BOOKED, STATUS.APPROVED].includes(transaction.status);
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

        {/* <Box sx={{ mb: 3 }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="filter-select-label">Filter</InputLabel>
            <Select
              labelId="filter-select-label"
              value={filter}
              label="Filter"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="ambulance">Ambulance Bookings</MenuItem>
              <MenuItem value="document">Document Requests</MenuItem>
              <MenuItem value="court">Court Reservations</MenuItem>
              <MenuItem value="court">Court Reservations</MenuItem>
              <MenuItem value="resident_registration">Resident Registration</MenuItem>
              <Divider />
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box> */}

        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredTransactions.map((transaction) => (
            <Paper key={transaction._id} sx={{ mb: 2, overflow: 'hidden' }}>
              <ListItem 
                component="div" 
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
                    <Box component="div">
                      <Box component="span" display="flex" alignItems="center">
                        <span>{getStatusChip(transaction.status, transaction.serviceType, transaction)}</span>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </Box>
                      {needsDieselResponse(transaction) && (
                        <Chip 
                          size="small" 
                          label="Action Required" 
                          color="secondary" 
                          sx={{ mt: 1 }}
                          variant="outlined"
                        />
                      )}
                      {/* Display consistent transaction details based on service type */}
                      {transaction.serviceType === SERVICE_TYPES.AMBULANCE && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.patientName || 'Patient N/A'} • {transaction.details.destination || 'Destination N/A'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.COURT && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {formatDate(transaction.details.reservationDate)} • {transaction.details.courtName || 'Court'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.issueType || 'Report'} • {transaction.details.location || 'Location N/A'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.projectTitle || 'Project Proposal'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {(() => {
                            const docType = transaction.details.documentType;
                            switch(docType) {
                              case 'barangay_id': return 'Barangay ID';
                              case 'barangay_clearance': return 'Barangay Clearance';
                              case 'business_clearance': return 'Business Clearance';
                              case 'certificate_of_indigency': return 'Certificate of Indigency';
                              default: return docType?.replace('_', ' ') || 'Document';
                            }
                          })()}
                        </Typography>
                      )}
                    </Box>
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
                  <Box component="div">
                    {getStatusChip(selectedTransaction.status)}
                  </Box>
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
            <MenuItem value="active">Active Transactions</MenuItem>
            <Divider />
            <MenuItem value="ambulance">Ambulance Bookings</MenuItem>
            <MenuItem value="court">Court Reservations</MenuItem>
            <MenuItem value="document">Document Requests</MenuItem>
            <MenuItem value="infrastructure">Infrastructure Reports</MenuItem>
            <MenuItem value="project_proposal">Project Proposals</MenuItem>
            <MenuItem value="resident_registration">Resident Registration</MenuItem>
            <Divider />
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
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
              <TableCell>Service ID</TableCell>
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
                <TableCell>
                  {transaction.serviceType === 'ambulance_booking' || transaction.serviceType === 'court_reservation' || transaction.serviceType === 'infrastructure_report' || transaction.serviceType === 'document_request' || transaction.serviceType === 'project_proposal'? (
                    <ServiceIdCell transaction={transaction} />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell component="div">
                  {getStatusChip(transaction.status, transaction.serviceType, transaction)}
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
                <TableCell component="div">
                  {/* Ambulance booking details */}
                  {transaction.serviceType === SERVICE_TYPES.AMBULANCE && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Patient:</strong> {transaction.details.patientName || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Destination:</strong> {transaction.details.destination || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Pickup Date:</strong> {formatDate(transaction.details.pickupDate)}
                      </Typography>
                    </>
                  )}
                  
                  {/* Court reservation details */}
                  {transaction.serviceType === SERVICE_TYPES.COURT && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Purpose:</strong> {transaction.details.purpose || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {formatDate(transaction.details.reservationDate)}
                      </Typography>
                    </>
                  )}
                  
                  {/* Infrastructure report details */}
                  {transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Issue:</strong> {transaction.details.issueType || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {transaction.details.location || 'N/A'}
                      </Typography>
                    </>
                  )}
                  
                  {/* Project proposal details */}
                  {transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Title:</strong> {transaction.details.projectTitle || 'N/A'}
                      </Typography>
                    </>
                  )}
                  
                  {/* Resident Registration details */}
                  {transaction.serviceType === SERVICE_TYPES.RESIDENT && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Name:</strong> {`${transaction.details.firstName} ${transaction.details.middleName ? transaction.details.middleName + ' ' : ''}${transaction.details.lastName}`}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {transaction.details.address || 'N/A'}
                      </Typography>
                    </>
                  )}
  
                  {/* Document request details */}
                  {transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.details && (
                    <>
                      <Typography variant="body2">
                        <strong>Type:</strong> {
                          (() => {
                            const docType = transaction.details.documentType;
                            switch(docType) {
                              case 'barangay_id': return 'Barangay ID';
                              case 'barangay_clearance': return 'Barangay Clearance';
                              case 'business_clearance': return 'Business Clearance';
                              case 'lot_ownership': return 'Lot Ownership';
                              case 'digging_permit': return 'Digging Permit';
                              case 'fencing_permit': return 'Fencing Permit';
                              case 'request_for_assistance': return 'Request for Assistance';
                              case 'certificate_of_indigency': return 'Certificate of Indigency';
                              case 'certificate_of_residency': return 'Certificate of Residency';
                              case 'no_objection_certificate': return 'No Objection Certificate';
                              default: return docType ? docType.replace('_', ' ') : 'N/A';
                            }
                          })()
                        }
                      </Typography>
                      <Typography variant="body2">
                        <strong>Purpose:</strong> {transaction.details.purpose || transaction.referenceDetails?.purpose || 'N/A'}
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
                  
                  {selectedTransaction.serviceType === 'ambulance_booking' && selectedTransaction.referenceDetails && (
                    <Typography variant="body2">
                      <strong>Service ID:</strong> {selectedTransaction.referenceDetails.serviceId || 'N/A'}
                    </Typography>
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
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Diesel Cost Required:</strong> {selectedTransaction.details.dieselCost ? 'Yes' : 'No'}
                        </Typography>
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
                  
                  {/* From referenceDetails - more comprehensive information */}
                  {selectedTransaction.referenceDetails && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Service ID:</strong> {selectedTransaction.referenceDetails.serviceId}
                        </Typography>
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
              
              {/* Document Request Details - Add Barangay Clearance section */}
              {selectedTransaction?.serviceType === 'document_request' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Document Request Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  {/* From transaction.details */}
                  {selectedTransaction.details && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Document Type:</strong> {
                            (() => {
                              const docType = selectedTransaction.details.documentType;
                              switch(docType) {
                                case 'barangay_id': return 'Barangay ID';
                                case 'barangay_clearance': return 'Barangay Clearance';
                                case 'business_clearance': return 'Business Clearance';
                                case 'lot_ownership': return 'Lot Ownership';
                                case 'digging_permit': return 'Digging Permit';
                                case 'fencing_permit': return 'Fencing Permit';
                                case 'request_for_assistance': return 'Request for Assistance';
                                case 'certificate_of_indigency': return 'Certificate of Indigency';
                                case 'certificate_of_residency': return 'Certificate of Residency';
                                case 'no_objection_certificate': return 'No Objection Certificate';
                                default: return docType;
                              }
                            })()
                          }
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {/* From referenceDetails - more comprehensive information */}
                  {selectedTransaction.referenceDetails && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Service ID:</strong> {selectedTransaction.referenceDetails.serviceId || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {
                            selectedTransaction.referenceDetails.documentType === 'digging_permit' && 
                            selectedTransaction.referenceDetails.formData && 
                            selectedTransaction.referenceDetails.formData.diggingPurpose
                              ? (() => {
                                  const purpose = selectedTransaction.referenceDetails.formData.diggingPurpose;
                                  switch(purpose) {
                                    case 'water_supply': return 'Water Supply Connection';
                                    case 'electrical': return 'Electrical Connection';
                                    case 'drainage': return 'Drainage System';
                                    case 'other': return 'Other';
                                    default: return purpose;
                                  }
                                })()
                              : selectedTransaction.referenceDetails.purpose
                          }
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {
                            (() => {
                              const status = selectedTransaction.referenceDetails.status;
                              switch(status) {
                                case 'pending': return 'Pending';
                                case 'in_progress': return 'In Progress';
                                case 'completed': return 'Completed';
                                case 'rejected': return 'Rejected';
                                case 'cancelled': return 'Cancelled';
                                default: return status.replace('_', ' ');
                              }
                            })()
                          }
                        </Typography>
                      </Grid>
                      
                      {/* Display different fields based on document type */}
                      {selectedTransaction.referenceDetails.documentType === 'certificate_of_residency' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Age:</strong> {selectedTransaction.referenceDetails.formData.age}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address} Barangay Maahas, Los Baños, Laguna
                            </Typography>
                            <Typography variant="body2">
                              <strong>Date of Birth:</strong> {
                                selectedTransaction.referenceDetails.formData.dateOfBirth ? 
                                format(new Date(selectedTransaction.referenceDetails.formData.dateOfBirth), 'MMM dd, yyyy') : 
                                'N/A'
                              }
                            </Typography>
                            <Typography variant="body2">
                              <strong>Place of Birth:</strong> {selectedTransaction.referenceDetails.formData.placeOfBirth}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Nationality:</strong> {selectedTransaction.referenceDetails.formData.nationality}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Civil Status:</strong> {selectedTransaction.referenceDetails.formData.civilStatus}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Years of Stay:</strong> {selectedTransaction.referenceDetails.formData.yearsOfStay}
                            </Typography>
                          </Grid>
                        </>
                      )}
                      
                      {/* Barangay Clearance Details */}
                      {selectedTransaction.referenceDetails.documentType === 'barangay_clearance' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Gender:</strong> {selectedTransaction.referenceDetails.formData.gender === 'male' ? 'Male' : 'Female'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna 4030
                            </Typography>
                          </Grid>
                        </>
                      )}
                      {/* Lot Ownership Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'lot_ownership' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>TD Number:</strong> {selectedTransaction.referenceDetails.formData.tdNumber}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Survey Number:</strong> {selectedTransaction.referenceDetails.formData.surveyNumber}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Lot Area:</strong> {selectedTransaction.referenceDetails.formData.lotArea} {
                                (() => {
                                  const areaUnit = selectedTransaction.referenceDetails.formData.areaUnit;
                                  switch(areaUnit) {
                                    case 'square_meters': return 'square meters';
                                    case 'square_feet': return 'square feet';
                                    case 'hectares': return 'hectares';
                                    default: return areaUnit;
                                  }
                                })()
                              }
                            </Typography>
                            <Typography variant="body2">
                              <strong>Property Location:</strong> {selectedTransaction.referenceDetails.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Owner Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Owner Address:</strong> {selectedTransaction.referenceDetails.formData.ownerAddress}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* Barangay ID Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'barangay_id' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>First Name:</strong> {selectedTransaction.referenceDetails.formData.firstName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Middle Name:</strong> {selectedTransaction.referenceDetails.formData.middleName || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Last Name:</strong> {selectedTransaction.referenceDetails.formData.lastName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Date of Birth:</strong> {selectedTransaction.referenceDetails.formData.birthDate}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Emergency Contact Name:</strong> {selectedTransaction.referenceDetails.formData.emergencyContactName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Emergency Contact Number:</strong> {selectedTransaction.referenceDetails.formData.emergencyContactNumber}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* Fencing Permit Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'fencing_permit' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Residential Address:</strong> {selectedTransaction.referenceDetails.formData.residentAddress}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Property Location:</strong> {selectedTransaction.referenceDetails.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Tax Declaration No.:</strong> {selectedTransaction.referenceDetails.formData.taxDeclarationNumber}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Property ID No.:</strong> {selectedTransaction.referenceDetails.formData.propertyIdentificationNumber}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Property Area:</strong> {selectedTransaction.referenceDetails.formData.propertyArea} {
                                (() => {
                                  const areaUnit = selectedTransaction.referenceDetails.formData.areaUnit;
                                  switch(areaUnit) {
                                    case 'square_meters': return 'square meters';
                                    case 'square_feet': return 'square feet';
                                    case 'hectares': return 'hectares';
                                    default: return areaUnit;
                                  }
                                })()
                              }
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* Digging Permit Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'digging_permit' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Company:</strong> {selectedTransaction.referenceDetails.formData.companyName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Application Details:</strong> {selectedTransaction.referenceDetails.formData.applicationDetails}
                            </Typography>
                          </Grid>
                        </>
                      )}
                      
                      {/* Business Clearance Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'business_clearance' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Business Name:</strong> {selectedTransaction.referenceDetails.formData.businessName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Business Address:</strong> {selectedTransaction.referenceDetails.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                            <Typography variant="body2">
                              <strong>Line of Business:</strong> {selectedTransaction.referenceDetails.formData.lineOfBusiness}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Business Status:</strong> {selectedTransaction.referenceDetails.formData.businessStatus}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Amount:</strong> ₱{selectedTransaction.referenceDetails.formData.amount}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* No Objection Certificate Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'no_objection_certificate' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Activity Type:</strong> {
                                (() => {
                                  const objectType = selectedTransaction.referenceDetails.formData.objectType;
                                  switch(objectType) {
                                    case 'tree_cutting': return 'Tree Cutting';
                                    case 'construction': return 'Construction';
                                    case 'event': return 'Event/Gathering';
                                    case 'business': return 'Business Operation';
                                    case 'other': return 'Other Activity';
                                    default: return objectType;
                                  }
                                })()
                              }
                            </Typography>
                            <Typography variant="body2">
                              <strong>Details:</strong> {selectedTransaction.referenceDetails.formData.objectDetails}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Quantity:</strong> {selectedTransaction.referenceDetails.formData.quantity}
                            </Typography>
                            {selectedTransaction.referenceDetails.formData.objectType === 'other' && (
                              <Typography variant="body2">
                                <strong>Additional Info:</strong> {selectedTransaction.referenceDetails.formData.additionalInfo}
                              </Typography>
                            )}
                          </Grid>
                        </>
                      )}

                      {/* Request for Assistance Details */}
                      {selectedTransaction.referenceDetails && selectedTransaction.referenceDetails.documentType === 'request_for_assistance' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna
                            </Typography>
                            <Typography variant="body2">
                              <strong>Years of Stay:</strong> {selectedTransaction.referenceDetails.formData.yearsOfStay}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Marginalized Group:</strong> {
                                (() => {
                                  const group = selectedTransaction.referenceDetails.formData.marginGroupType;
                                  switch(group) {
                                    case 'urban_poor': return 'Urban Poor';
                                    case 'senior_citizen': return 'Senior Citizen';
                                    case 'single_parent': return 'Single Parent';
                                    case 'pwd': return 'Person with Disability (PWD)';
                                    case 'indigenous': return 'Indigenous Person';
                                    case 'solo_parent': return 'Solo Parent';
                                    case 'other': return 'Other';
                                    default: return group;
                                  }
                                })()
                              }
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Request For:</strong> {selectedTransaction.referenceDetails.formData.isSelf ? 'Self' : 'Other Person'}
                            </Typography>
                            {!selectedTransaction.referenceDetails.formData.isSelf && (
                              <>
                                <Typography variant="body2">
                                  <strong>Beneficiary Name:</strong> {selectedTransaction.referenceDetails.formData.beneficiaryName}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Relationship:</strong> {selectedTransaction.referenceDetails.formData.beneficiaryRelation}
                                </Typography>
                              </>
                            )}
                            <Typography variant="body2">
                              <strong>Assistance Type:</strong> {
                                (() => {
                                  const type = selectedTransaction.referenceDetails.formData.assistanceType;
                                  switch(type) {
                                    case 'financial': return 'Financial Assistance';
                                    case 'medical': return 'Medical Assistance';
                                    case 'burial': return 'Burial Assistance';
                                    case 'educational': return 'Educational Assistance';
                                    case 'food': return 'Food Assistance';
                                    case 'housing': return 'Housing Assistance';
                                    case 'other': return selectedTransaction.referenceDetails.formData.otherAssistanceType || 'Other Assistance';
                                    default: return type;
                                  }
                                })()
                              }
                            </Typography>
                          </Grid>
                        </>
                      )}


                      {/* certificate of indigency details */}
                      {selectedTransaction.referenceDetails.documentType === 'certificate_of_indigency' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Full Name:</strong> {selectedTransaction.referenceDetails.formData.fullName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Age:</strong> {selectedTransaction.referenceDetails.formData.age} years old
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna 4030
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Certificate For:</strong> {selectedTransaction.referenceDetails.formData.isSelf ? 'Self' : 'Other Person'}
                            </Typography>
                            
                            {!selectedTransaction.referenceDetails.formData.isSelf ? (
                              <>
                                <Typography variant="body2">
                                  <strong>Recipient:</strong> {selectedTransaction.referenceDetails.formData.guardian}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Relationship:</strong> {selectedTransaction.referenceDetails.formData.guardianRelation}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2">
                                <strong>Recipient:</strong> Self (Same as applicant)
                              </Typography>
                            )}
                            
                            <Typography variant="body2">
                              <strong>Purpose:</strong> {selectedTransaction.referenceDetails.purpose}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Resident Registration Details in the dialog*/}
              {selectedTransaction?.serviceType === 'resident_registration' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Resident Registration Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  {/* From transaction.details */}
                  {selectedTransaction.details && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Service ID:</strong> {selectedTransaction.referenceDetails?.serviceId || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Name:</strong> {`${selectedTransaction.details.firstName} ${selectedTransaction.details.middleName ? selectedTransaction.details.middleName + ' ' : ''}${selectedTransaction.details.lastName}`}
                        </Typography>
                        <Typography variant="body2">
                          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Address:</strong> {selectedTransaction.details.address}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {/* From referenceDetails - more comprehensive information */}
                  {selectedTransaction.referenceDetails && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Contact:</strong> {selectedTransaction.referenceDetails.contactNumber || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Email:</strong> {selectedTransaction.referenceDetails.email || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Precinct Level:</strong> {selectedTransaction.referenceDetails.precinctLevel || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        {selectedTransaction.referenceDetails.types && selectedTransaction.referenceDetails.types.length > 0 && (
                          <Typography variant="body2">
                            <strong>Categories:</strong> {selectedTransaction.referenceDetails.types.join(', ')}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Voter:</strong> {selectedTransaction.referenceDetails.isVoter ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {selectedTransaction.referenceDetails.isVerified ? 'Verified' : 'Pending Verification'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </>
              )}

              {/* Project Proposal Details */}
              {selectedTransaction?.serviceType === 'project_proposal' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Project Proposal Information
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Proposal ID:</strong> {
                        selectedTransaction.referenceDetails?.serviceId || 
                        selectedTransaction.details?.serviceId || 
                        'N/A'
                      }
                    </Typography>
                  </Grid>

                  {/* From transaction.details */}
                  {selectedTransaction.details && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Project Title:</strong> {selectedTransaction.details.projectTitle || 'N/A'}
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
                          <strong>Submitter:</strong> {selectedTransaction.referenceDetails.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Contact:</strong> {selectedTransaction.referenceDetails.contactNumber}
                        </Typography>
                        <Typography variant="body2">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Email:</strong> {selectedTransaction.referenceDetails.email}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          <strong>Submitted:</strong> {formatDate(selectedTransaction.referenceDetails.createdAt)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Project Title:</strong> {selectedTransaction.referenceDetails.projectTitle}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {
                            (() => {
                              const status = selectedTransaction.referenceDetails.status;
                              switch(status) {
                                case 'pending': return 'Pending';
                                case 'in_review': return 'In Review';
                                case 'considered': return 'Considered';
                                case 'approved': return 'Approved';
                                case 'rejected': return 'Rejected';
                                default: return status.replace('_', ' ');
                              }
                            })()
                          }
                        </Typography>
                        {selectedTransaction.referenceDetails.documentPath && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <FileIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            <Link 
                              href={`http://localhost:3002${selectedTransaction.referenceDetails.documentPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Proposal Document
                            </Link>
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                          <strong>Project Description:</strong>
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                            {selectedTransaction.referenceDetails.description}
                          </Typography>
                        </Paper>
                      </Grid>
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
                          <strong>Report ID:</strong> {selectedTransaction.referenceDetails?.serviceId || 'N/A'}
                        </Typography>
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
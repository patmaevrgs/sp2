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
  TablePagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

function AdminRequestForms() {
  // State for document requests
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docxGenerating, setDocxGenerating] = useState(false);
  const [clearanceNumber, setClearanceNumber] = useState('');
  const [amountField, setAmountField] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering
  const [filter, setFilter] = useState({
    status: 'all',
    documentType: 'all',
    searchTerm: ''
  });
  
  // Selected request for viewing details
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  
  // Status update dialog
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Print preview dialog
  const [openPrintPreview, setOpenPrintPreview] = useState(false);
  
  // Tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Document type mapping
  const documentTypeMap = {
    barangay_id: 'Barangay ID',
    barangay_clearance: 'Barangay Clearance',
    business_clearance: 'Business Clearance',
    lot_ownership: 'Lot Ownership',
    digging_permit: 'Digging Permit',
    fencing_permit: 'Fencing Permit',
    request_for_assistance: 'Request for Assistance',
    certificate_of_indigency: 'Certificate of Indigency',
    certificate_of_residency: 'Certificate of Residency',
    no_objection_certificate: 'No Objection Certificate',
  };
  
  // Fetch all document requests
  useEffect(() => {
    fetchRequests();
  }, []);
  
  // Updated fetchRequests to properly handle the filtering
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/documents');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Filter out document requests that were cancelled by residents
        const filteredRequests = data.documentRequests.filter(req => {
          // Keep all non-cancelled requests
          if (req.status !== 'cancelled') {
            return true;
          }
          
          // If it's cancelled, check if it was cancelled by a resident
          if (req.adminComment && 
              (req.adminComment.includes('Cancelled by resident') || 
              req.adminComment.toLowerCase().includes('cancel'))) {
            return false; // Filter out resident-cancelled requests
          }
          
          return true; // Keep admin-cancelled requests
        });
        
        setRequests(filteredRequests);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to load document requests');
      }
    } catch (err) {
      console.error('Error fetching document requests:', err);
      setError('Failed to load document requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Set filter based on tab
    switch (newValue) {
      case 0: // All
        setFilter({ ...filter, status: 'all' });
        break;
      case 1: // Pending
        setFilter({ ...filter, status: 'pending' });
        break;
      case 2: // In Progress
        setFilter({ ...filter, status: 'in_progress' });
        break;
      case 3: // Completed
        setFilter({ ...filter, status: 'completed' });
        break;
      case 4: // Rejected
        setFilter({ ...filter, status: 'rejected' });
        break;
      default:
        setFilter({ ...filter, status: 'all' });
    }
    
    setPage(0); // Reset to first page when changing tabs
  };
  
  // Handle document type filter change
  const handleDocumentTypeFilterChange = (event) => {
    setFilter({ ...filter, documentType: event.target.value });
    setPage(0); // Reset to first page when changing filter
  };
  
  // Handle search
  const handleSearch = (event) => {
    setFilter({ ...filter, searchTerm: event.target.value });
    setPage(0); // Reset to first page when searching
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter requests based on current filter
  // Updated filteredRequests to exclude document requests cancelled by residents
  const filteredRequests = requests
    .filter(request => {
      // Filter out requests cancelled by residents
      // Check if it's cancelled AND the admin comment indicates it was cancelled by a resident
      if (request.status === 'cancelled' && 
          request.adminComment && 
          (request.adminComment.includes('Cancelled by resident') || 
          request.adminComment.toLowerCase().includes('cancel'))) {
        return false;
      }
      
      // Status filter
      if (filter.status !== 'all' && request.status !== filter.status) {
        return false;
      }
      
      // Document type filter
      if (filter.documentType !== 'all' && request.documentType !== filter.documentType) {
        return false;
      }
      
      // Search term filter (case insensitive)
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const fullName = request.formData.fullName ? request.formData.fullName.toLowerCase() : '';
        const purpose = request.purpose ? request.purpose.toLowerCase() : '';
        const serviceId = request.serviceId ? request.serviceId.toLowerCase() : '';
        
        // Search in name, purpose, or service ID
        return fullName.includes(searchLower) || 
              purpose.includes(searchLower) || 
              serviceId.includes(searchLower);
      }
      
      return true;
    });
    
  // View request details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDetails(true);
  };
  
  // Open update status dialog
  const handleOpenUpdateStatus = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setAdminComment(request.adminComment || '');
    setOpenUpdateStatus(true);
  };
  
  // Update request status
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    
    setStatusUpdateLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002/documents/${selectedRequest._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminComment: adminComment,
          userId: localStorage.getItem('user') // Admin ID
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }
      
      // Update the local state
      setRequests(prev => prev.map(req => 
        req._id === selectedRequest._id ? data.documentRequest : req
      ));
      
      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus.replace('_', ' ')}`,
        severity: 'success'
      });
      
      setOpenUpdateStatus(false);
      
      // If we just completed a document, show print dialog
      if (newStatus === 'completed') {
        setSelectedRequest(data.documentRequest);
        setOpenPrintPreview(true);
      }
      
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: `Failed to update status: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  
  // Open print preview
  const handlePrintPreview = (request) => {
    setSelectedRequest(request);
    setOpenPrintPreview(true);
  };
  
  // Generate and download DOCX document
  const handleGenerateDocument = async () => {
    if (!selectedRequest) return;
    
    // Validate clearance number for barangay clearance
    if (selectedRequest.documentType === 'barangay_clearance' && !clearanceNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a clearance number',
        severity: 'error'
      });
      return;
    }
    
    setDocxGenerating(true);
    
    try {
      // Prepare request body with additional clearance number for barangay clearance
      const requestBody = {
        documentType: selectedRequest.documentType,
        formData: selectedRequest.formData,
        purpose: selectedRequest.purpose
      };
      
      // Add clearance number for barangay clearance
      if (selectedRequest.documentType === 'barangay_clearance') {
        requestBody.clearanceNumber = clearanceNumber;
      }
      
      // Generate a DOCX document
      const response = await fetch('http://localhost:3002/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const a = document.createElement('a');
      
      // Set link properties
      a.href = url;
      a.download = `${selectedRequest.documentType}_${Date.now()}.docx`;
      
      // Append to the body
      document.body.appendChild(a);
      
      // Trigger the download
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: 'Document generated successfully. Downloading now...',
        severity: 'success'
      });
      
      // Reset clearance number after successful generation
      if (selectedRequest.documentType === 'barangay_clearance') {
        setClearanceNumber('');
      }
      
      // Close the print preview dialog after successful generation
      setOpenPrintPreview(false);
    } catch (error) {
      console.error('Error generating document:', error);
      setSnackbar({
        open: true,
        message: `Failed to generate document: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setDocxGenerating(false);
    }
  };

  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setNewStatus('rejected');
    setAdminComment(request.adminComment || '');
    setOpenUpdateStatus(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    let color = 'default';
    let label = status;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'Pending';
        break;
      case 'in_progress':
        color = 'primary';
        label = 'In Progress';
        break;
      case 'completed':
        color = 'success';
        label = 'Completed';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      case 'cancelled':
        color = 'default';
        label = 'Cancelled';
        break;
      default:
        color = 'default';
        label = status.replace('_', ' ');
    }
    
    return <Chip size="small" label={label} color={color} />;
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Get ordinal suffix for day of month
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Document Requests</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name or service ID"
              value={filter.searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchRequests}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Requests" />
            <Tab label="Pending" />
            <Tab label="In Progress" />
            <Tab label="Completed" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={filter.documentType}
              onChange={handleDocumentTypeFilterChange}
              label="Document Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              {Object.entries(documentTypeMap).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredRequests.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">No document requests found</Typography>
                <Typography variant="body2" color="textSecondary">
                  Try changing your filters or refresh the page
                </Typography>
              </Paper>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Requester</TableCell>
                      <TableCell>Date Requested</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>{request.serviceId}</TableCell>
                          <TableCell>{documentTypeMap[request.documentType]}</TableCell>
                          <TableCell>{request.formData.fullName}</TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell>
                            {request.documentType === 'digging_permit' && request.formData.diggingPurpose
                              ? (() => {
                                  const purpose = request.formData.diggingPurpose;
                                  switch(purpose) {
                                    case 'water_supply': return 'Water Supply Connection';
                                    case 'electrical': return 'Electrical Connection';
                                    case 'drainage': return 'Drainage System';
                                    case 'other': return 'Other';
                                    default: return purpose;
                                  }
                                })()
                              : (request.purpose.length > 30
                                  ? `${request.purpose.substring(0, 30)}...`
                                  : request.purpose)
                            }
                          </TableCell>
                          <TableCell>{getStatusChip(request.status)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {/* View Details Button */}
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(request)}
                              >
                                View
                              </Button>
                              
                              {/* Approve Button - Only for pending requests */}
                              {request.status === 'pending' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setNewStatus('in_progress');
                                    setAdminComment(request.adminComment || '');
                                    setOpenUpdateStatus(true);
                                  }}
                                >
                                  Approve
                                </Button>
                              )}
                              
                              {/* Complete Button - Only for in_progress requests */}
                              {request.status === 'in_progress' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setNewStatus('completed');
                                    setAdminComment(request.adminComment ? 
                                      `${request.adminComment}\nReady for pickup!` : 
                                      'Ready for pickup!');
                                    setOpenUpdateStatus(true);
                                  }}
                                >
                                  Complete
                                </Button>
                              )}
                              
                              {/* Reject Button - Only for pending and in_progress requests */}
                              {(request.status === 'pending' || request.status === 'in_progress') && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleRejectRequest(request)}
                                >
                                  Reject
                                </Button>
                              )}
                              
                              {/* Generate Document Button - Only for completed requests */}
                              {request.status === 'completed' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<PrintIcon />}
                                  onClick={() => handlePrintPreview(request)}
                                >
                                  Generate
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredRequests.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}
          </>
        )}
      </Paper>
      
      {/* Request Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Request Details
          <IconButton
            aria-label="close"
            onClick={() => setOpenDetails(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
        {selectedRequest && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {documentTypeMap[selectedRequest.documentType]}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2"><strong>Service ID:</strong> {selectedRequest.serviceId}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {
                (() => {
                  const status = selectedRequest.status;
                  switch(status) {
                    case 'pending': return 'Pending';
                    case 'in_progress': return 'In Progress';
                    case 'completed': return 'Completed';
                    case 'rejected': return 'Rejected';
                    case 'cancelled': return 'Cancelled';
                    default: return status.replace('_', ' ');
                  }
                })()
              }</Typography>
              <Typography variant="body2"><strong>Requested:</strong> {formatDate(selectedRequest.createdAt)}</Typography>
              <Typography variant="body2"><strong>Last Updated:</strong> {formatDate(selectedRequest.updatedAt)}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2"><strong>Purpose:</strong> {
                selectedRequest.documentType === 'digging_permit' && selectedRequest.formData.diggingPurpose
                  ? (() => {
                      const purpose = selectedRequest.formData.diggingPurpose;
                      switch(purpose) {
                        case 'water_supply': return 'Water Supply Connection';
                        case 'electrical': return 'Electrical Connection';
                        case 'drainage': return 'Drainage System';
                        case 'other': return 'Other';
                        default: return purpose;
                      }
                    })()
                  : selectedRequest.purpose
              }</Typography>
              {selectedRequest.processedBy && (
                <Typography variant="body2">
                  <strong>Processed By:</strong> {selectedRequest.processedBy.firstName} {selectedRequest.processedBy.lastName}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Requester Information</Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            
            {/* Certificate of Residency fields */}
            {selectedRequest.documentType === 'certificate_of_residency' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Age:</strong> {selectedRequest.formData.age}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.formData.address}</Typography>
                  <Typography variant="body2"><strong>Date of Birth:</strong> {formatDate(selectedRequest.formData.dateOfBirth)}</Typography>
                  <Typography variant="body2"><strong>Place of Birth:</strong> {selectedRequest.formData.placeOfBirth}</Typography>
                  <Typography variant="body2"><strong>Nationality:</strong> {selectedRequest.formData.nationality}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Civil Status:</strong> {selectedRequest.formData.civilStatus}</Typography>
                  <Typography variant="body2"><strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay}</Typography>
                  {selectedRequest.formData.motherName && (
                    <Typography variant="body2"><strong>Mother's Name:</strong> {selectedRequest.formData.motherName}</Typography>
                  )}
                  {selectedRequest.formData.fatherName && (
                    <Typography variant="body2"><strong>Father's Name:</strong> {selectedRequest.formData.fatherName}</Typography>
                  )}
                </Grid>
              </>
            )}
            
            {/* Barangay Clearance fields */}
            {selectedRequest.documentType === 'barangay_clearance' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Gender:</strong> {selectedRequest.formData.gender === 'male' ? 'Male' : 'Female'}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna 4030</Typography>
                </Grid>
              </>
            )}
            
            {/* Lot Ownership fields */}
            {selectedRequest && selectedRequest.documentType === 'lot_ownership' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>TD Number:</strong> {selectedRequest.formData.tdNumber}</Typography>
                  <Typography variant="body2"><strong>Survey Number:</strong> {selectedRequest.formData.surveyNumber}</Typography>
                  <Typography variant="body2"><strong>Lot Area:</strong> {selectedRequest.formData.lotArea} {
                    (() => {
                      switch(selectedRequest.formData.areaUnit) {
                        case 'square_meters': return 'square meters';
                        case 'square_feet': return 'square feet';
                        case 'hectares': return 'hectares';
                        default: return selectedRequest.formData.areaUnit;
                      }
                    })()
                  }</Typography>
                  <Typography variant="body2"><strong>Property Location:</strong> {selectedRequest.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Owner Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Owner Address:</strong> {selectedRequest.formData.ownerAddress}</Typography>
                </Grid>
              </>
            )}
            
            {/* Fencing Permit fields */}
            {selectedRequest && selectedRequest.documentType === 'fencing_permit' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Residential Address:</strong> {selectedRequest.formData.residentAddress}</Typography>
                  <Typography variant="body2"><strong>Property Location:</strong> {selectedRequest.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Tax Declaration No.:</strong> {selectedRequest.formData.taxDeclarationNumber}</Typography>
                  <Typography variant="body2"><strong>Property ID No.:</strong> {selectedRequest.formData.propertyIdentificationNumber}</Typography>
                  <Typography variant="body2"><strong>Property Area:</strong> {selectedRequest.formData.propertyArea} {
                    (() => {
                      switch(selectedRequest.formData.areaUnit) {
                        case 'square_meters': return 'square meters';
                        case 'square_feet': return 'square feet';
                        case 'hectares': return 'hectares';
                        default: return selectedRequest.formData.areaUnit;
                      }
                    })()
                  }</Typography>
                </Grid>
              </>
            )}

            {/* Digging Permit fields */}
            {selectedRequest && selectedRequest.documentType === 'digging_permit' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Company:</strong> {selectedRequest.formData.companyName}</Typography>
                  <Typography variant="body2"><strong>Application Details:</strong> {selectedRequest.formData.applicationDetails}</Typography>
                </Grid>
              </>
            )}

            {/* No Objection Certificate fields */}
            {selectedRequest && selectedRequest.documentType === 'no_objection_certificate' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Activity Type:</strong> {
                    (() => {
                      const objectType = selectedRequest.formData.objectType;
                      switch(objectType) {
                        case 'tree_cutting': return 'Tree Cutting';
                        case 'construction': return 'Construction';
                        case 'event': return 'Event/Gathering';
                        case 'business': return 'Business Operation';
                        case 'other': return 'Other Activity';
                        default: return objectType;
                      }
                    })()
                  }</Typography>
                  <Typography variant="body2"><strong>Details:</strong> {selectedRequest.formData.objectDetails}</Typography>
                  <Typography variant="body2"><strong>Quantity:</strong> {selectedRequest.formData.quantity}</Typography>
                  {selectedRequest.formData.objectType === 'other' && (
                    <Typography variant="body2"><strong>Additional Info:</strong> {selectedRequest.formData.additionalInfo}</Typography>
                  )}
                </Grid>
              </>
            )}

            {/* Business Clearance fields */}
            {selectedRequest && selectedRequest.documentType === 'business_clearance' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Business Name:</strong> {selectedRequest.formData.businessName}</Typography>
                  <Typography variant="body2"><strong>Business Address:</strong> {selectedRequest.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna</Typography>
                  <Typography variant="body2"><strong>Line of Business:</strong> {selectedRequest.formData.lineOfBusiness}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Business Status:</strong> {selectedRequest.formData.businessStatus}</Typography>
                  <Typography variant="body2"><strong>Amount:</strong> ₱{selectedRequest.formData.amount}</Typography>
                </Grid>
              </>
            )}
            
            {/* Request for Assistance fields */}
            {selectedRequest && selectedRequest.documentType === 'request_for_assistance' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna</Typography>
                  <Typography variant="body2"><strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay}</Typography>
                  <Typography variant="body2"><strong>Marginalized Group:</strong> {
                    (() => {
                      const group = selectedRequest.formData.marginGroupType;
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
                  }</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Request For:</strong> {selectedRequest.formData.isSelf ? 'Self' : 'Other Person'}</Typography>
                  {!selectedRequest.formData.isSelf && (
                    <>
                      <Typography variant="body2"><strong>Beneficiary Name:</strong> {selectedRequest.formData.beneficiaryName}</Typography>
                      <Typography variant="body2"><strong>Relationship:</strong> {selectedRequest.formData.beneficiaryRelation}</Typography>
                    </>
                  )}
                  <Typography variant="body2"><strong>Assistance Type:</strong> {
                    (() => {
                      const type = selectedRequest.formData.assistanceType;
                      switch(type) {
                        case 'financial': return 'Financial Assistance';
                        case 'medical': return 'Medical Assistance';
                        case 'burial': return 'Burial Assistance';
                        case 'educational': return 'Educational Assistance';
                        case 'food': return 'Food Assistance';
                        case 'housing': return 'Housing Assistance';
                        case 'other': return selectedRequest.formData.otherAssistanceType || 'Other Assistance';
                        default: return type;
                      }
                    })()
                  }</Typography>
                </Grid>
              </>
            )}

            {/* Certificate of Indigency fields */}
            {selectedRequest.documentType === 'certificate_of_indigency' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                  <Typography variant="body2"><strong>Age:</strong> {selectedRequest.formData.age}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {selectedRequest.formData.address}</Typography>
                  <Typography variant="body2"><strong>Certificate For:</strong> {selectedRequest.formData.isSelf ? 'Self' : 'Other Person'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {!selectedRequest.formData.isSelf ? (
                    <>
                      <Typography variant="body2"><strong>Recipient:</strong> {selectedRequest.formData.guardian}</Typography>
                      <Typography variant="body2"><strong>Relationship:</strong> {selectedRequest.formData.guardianRelation}</Typography>
                    </>
                  ) : (
                    <Typography variant="body2"><strong>Recipient:</strong> Self (Same as applicant)</Typography>
                  )}
                  <Typography variant="body2"><strong>Purpose:</strong> {selectedRequest.purpose}</Typography>
                </Grid>
              </>
            )}

            {selectedRequest.adminComment && (
              <Grid item xs={12}>
                <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Admin Comment:
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.adminComment}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
        </DialogContent>
        
        <DialogActions>
          {/* Approve Button - Only for pending requests */}
          {selectedRequest && selectedRequest.status === 'pending' && (
            <Button 
              onClick={() => {
                setOpenDetails(false);
                setSelectedRequest(selectedRequest);
                setNewStatus('in_progress');
                setAdminComment(selectedRequest.adminComment || '');
                setOpenUpdateStatus(true);
              }} 
              variant="contained"
              color="primary"
            >
              Approve
            </Button>
          )}
          
          {/* Complete Button - Only for in_progress requests */}
          {selectedRequest && selectedRequest.status === 'in_progress' && (
            <Button 
              onClick={() => {
                setOpenDetails(false);
                setSelectedRequest(selectedRequest);
                setNewStatus('completed');
                setAdminComment(selectedRequest.adminComment ? 
                  `${selectedRequest.adminComment}\nReady for pickup!` : 
                  'Ready for pickup!');
                setOpenUpdateStatus(true);
              }} 
              variant="contained"
              color="success"
            >
              Complete
            </Button>
          )}
          
          {/* Reject Button - For pending and in_progress requests */}
          {selectedRequest && (selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
            <Button 
              onClick={() => {
                setOpenDetails(false);
                handleRejectRequest(selectedRequest);
              }} 
              variant="contained"
              color="error"
            >
              Reject
            </Button>
          )}
          
          {/* Generate Document Button - Only for completed requests */}
          {selectedRequest && selectedRequest.status === 'completed' && (
            <Button 
              onClick={() => {
                setOpenDetails(false);
                handlePrintPreview(selectedRequest);
              }} 
              color="secondary"
              variant="contained"
              startIcon={<PrintIcon />}
            >
              Generate Document
            </Button>
          )}
          
          <Button onClick={() => setOpenDetails(false)} sx={{ ml: 1 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog
        open={openUpdateStatus}
        onClose={() => !statusUpdateLoading && setOpenUpdateStatus(false)}
      >
        <DialogTitle>Update Request Status</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            Update the status of this {selectedRequest && documentTypeMap[selectedRequest.documentType]} request.
          </DialogContentText>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            label="Admin Comment"
            fullWidth
            multiline
            rows={3}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Add a comment or note about this request"
          />
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setOpenUpdateStatus(false)}
            disabled={statusUpdateLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color="primary"
            variant="contained"
            disabled={statusUpdateLoading}
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Preview Dialog */}
      <Dialog
        open={openPrintPreview}
        onClose={() => setOpenPrintPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Preview
          <IconButton
            aria-label="close"
            onClick={() => setOpenPrintPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Click the "Download Document" button to generate a Microsoft Word document based on the resident's information.
            You can open, edit, and print the document after downloading.
          </Alert>
          
          <Box sx={{ border: '1px solid #ddd', p: 2 }}>
            {selectedRequest && (
              <>
                <Typography variant="h6" align="center" gutterBottom>
                  {documentTypeMap[selectedRequest.documentType]}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Clearance Number input field - Only for Barangay Clearance */}
                {selectedRequest.documentType === 'barangay_clearance' && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      required
                      fullWidth
                      label="Clearance Number"
                      value={clearanceNumber}
                      onChange={(e) => setClearanceNumber(e.target.value)}
                      placeholder="e.g., 2025-S-511"
                      helperText="Enter the Barangay Clearance number"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                )}
                
                <Typography variant="subtitle1" gutterBottom>
                  Document will include:
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    {/* Document type specific preview */}
                    {selectedRequest.documentType === 'certificate_of_residency' && (
                      <>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Age:</strong> {selectedRequest.formData.age} years old
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date of Birth:</strong> {formatDate(selectedRequest.formData.dateOfBirth)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Place of Birth:</strong> {selectedRequest.formData.placeOfBirth}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Nationality:</strong> {selectedRequest.formData.nationality}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Civil Status:</strong> {selectedRequest.formData.civilStatus}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay} years
                        </Typography>
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {selectedRequest.purpose}
                        </Typography>
                      </>
                    )}
                    
                    {selectedRequest.documentType === 'barangay_clearance' && (
                      <>
                        <Typography variant="body2">
                          <strong>Clearance Number:</strong> {clearanceNumber || '[Enter clearance number above]'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Gender:</strong> {selectedRequest.formData.gender === 'male' ? 'Male' : 'Female'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna 4030
                        </Typography>
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {selectedRequest.purpose}
                        </Typography>
                      </>
                    )}

                    {selectedRequest.documentType === 'certificate_of_indigency' && (
                      <>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Age:</strong> {selectedRequest.formData.age} years old
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        
                        <Typography variant="body2">
                          <strong>Certificate For:</strong> {selectedRequest.formData.isSelf ? 'Self' : 'Other Person'}
                        </Typography>
                        
                        {!selectedRequest.formData.isSelf ? (
                          <>
                            <Typography variant="body2">
                              <strong>Recipient:</strong> {selectedRequest.formData.guardian}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Relationship:</strong> {selectedRequest.formData.guardianRelation}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2">
                            <strong>Recipient:</strong> Self (Same as applicant)
                          </Typography>
                        )}
                        
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {selectedRequest.purpose}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          <strong>Document Format:</strong> This certificate will be generated in Filipino with proper formatting.
                        </Typography>
                      </>
                    )}
                    {selectedRequest && selectedRequest.documentType === 'lot_ownership' && (
                      <>
                        <Typography variant="body2">
                          <strong>TD Number:</strong> {selectedRequest.formData.tdNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Survey Number:</strong> {selectedRequest.formData.surveyNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Lot Area:</strong> {selectedRequest.formData.lotArea} {
                            (() => {
                              switch(selectedRequest.formData.areaUnit) {
                                case 'square_meters': return 'square meters';
                                case 'square_feet': return 'square feet';
                                case 'hectares': return 'hectares';
                                default: return selectedRequest.formData.areaUnit;
                              }
                            })()
                          }
                        </Typography>
                        <Typography variant="body2">
                          <strong>Property Location:</strong> {selectedRequest.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Owner Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Owner Address:</strong> {selectedRequest.formData.ownerAddress}
                        </Typography>
                      </>
                    )}
                    {selectedRequest && selectedRequest.documentType === 'fencing_permit' && (
                      <>
                        <Typography variant="body2">
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Residential Address:</strong> {selectedRequest.formData.residentAddress}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Property Location:</strong> {selectedRequest.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tax Declaration No.:</strong> {selectedRequest.formData.taxDeclarationNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Property ID No.:</strong> {selectedRequest.formData.propertyIdentificationNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Property Area:</strong> {selectedRequest.formData.propertyArea} {
                            (() => {
                              switch(selectedRequest.formData.areaUnit) {
                                case 'square_meters': return 'square meters';
                                case 'square_feet': return 'square feet';
                                case 'hectares': return 'hectares';
                                default: return selectedRequest.formData.areaUnit;
                              }
                            })()
                          }
                        </Typography>
                      </>
                    )}
                    {selectedRequest && selectedRequest.documentType === 'digging_permit' && (
                      <>
                        <Typography variant="body2">
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Digging Purpose:</strong> {
                            (() => {
                              const purpose = selectedRequest.formData.diggingPurpose;
                              switch(purpose) {
                                case 'water_supply': return 'Water Supply Connection';
                                case 'electrical': return 'Electrical Connection';
                                case 'drainage': return 'Drainage System';
                                case 'other': return 'Other';
                                default: return purpose;
                              }
                            })()
                          }
                        </Typography>
                        <Typography variant="body2">
                          <strong>Company:</strong> {selectedRequest.formData.companyName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Application Details:</strong> {selectedRequest.formData.applicationDetails}
                        </Typography>
                      </>
                    )}
                    {selectedRequest && selectedRequest.documentType === 'business_clearance' && (
                      <>
                        <Typography variant="body2">
                          <strong>Business Name:</strong> {selectedRequest.formData.businessName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Business Address:</strong> {selectedRequest.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Line of Business:</strong> {selectedRequest.formData.lineOfBusiness}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Business Status:</strong> {selectedRequest.formData.businessStatus}
                        </Typography>
                        
                        {/* Add amount field that admin can modify */}
                        <Box sx={{ my: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Fee Details:
                          </Typography>
                          <TextField
                            fullWidth
                            label="Amount (₱)"
                            value={amountField || selectedRequest.formData.amount}
                            onChange={(e) => setAmountField(e.target.value)}
                            placeholder="e.g., 300.00"
                            sx={{ mb: 1 }}
                            InputProps={{
                              startAdornment: <Typography variant="body1">₱</Typography>
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Default amount is ₱300.00. You can modify the amount if needed.
                          </Typography>
                        </Box>
                      </>
                    )}
                    {selectedRequest && selectedRequest.documentType === 'no_objection_certificate' && (
                      <>
                        <Typography variant="body2">
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Activity Type:</strong> {
                            (() => {
                              const objectType = selectedRequest.formData.objectType;
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
                          <strong>Details:</strong> {selectedRequest.formData.objectDetails}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Quantity:</strong> {selectedRequest.formData.quantity}
                        </Typography>
                        {selectedRequest.formData.objectType === 'other' && (
                          <Typography variant="body2">
                            <strong>Additional Info:</strong> {selectedRequest.formData.additionalInfo}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                          <strong>Certificate Text:</strong> {`This is to further certify that ${selectedRequest.formData.fullName}, ${selectedRequest.purpose}`}
                        </Typography>
                      </>
                    )}
                    {selectedRequest && selectedRequest.documentType === 'request_for_assistance' && (
                      <>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2">
                          <strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay} years
                        </Typography>
                        <Typography variant="body2">
                          <strong>Marginalized Group:</strong> {
                            (() => {
                              const group = selectedRequest.formData.marginGroupType;
                              switch(group) {
                                case 'urban_poor': return 'URBAN POOR';
                                case 'senior_citizen': return 'SENIOR CITIZEN';
                                case 'single_parent': return 'SINGLE PARENT';
                                case 'pwd': return 'PERSON WITH DISABILITY (PWD)';
                                case 'indigenous': return 'INDIGENOUS PERSON';
                                case 'solo_parent': return 'SOLO PARENT';
                                case 'other': return 'OTHER';
                                default: return group?.toUpperCase();
                              }
                            })()
                          }
                        </Typography>
                        <Typography variant="body2">
                          <strong>Assistance Type:</strong> {
                            (() => {
                              const type = selectedRequest.formData.assistanceType;
                              switch(type) {
                                case 'financial': return 'Financial Assistance';
                                case 'medical': return 'Medical Assistance';
                                case 'burial': return 'Burial Assistance';
                                case 'educational': return 'Educational Assistance';
                                case 'food': return 'Food Assistance';
                                case 'housing': return 'Housing Assistance';
                                case 'other': return selectedRequest.formData.otherAssistanceType || 'Other Assistance';
                                default: return type;
                              }
                            })()
                          }
                        </Typography>
                        {!selectedRequest.formData.isSelf && (
                          <>
                            <Typography variant="body2">
                              <strong>Beneficiary:</strong> {selectedRequest.formData.beneficiaryName} ({selectedRequest.formData.beneficiaryRelation})
                            </Typography>
                          </>
                        )}
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {selectedRequest.purpose}
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setOpenPrintPreview(false)}
            disabled={docxGenerating}
          >
            Close
          </Button>
          <Button
            onClick={handleGenerateDocument}
            color="primary"
            variant="contained"
            startIcon={docxGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
            disabled={docxGenerating || (selectedRequest?.documentType === 'barangay_clearance' && !clearanceNumber)}
          >
            {docxGenerating ? 'Generating...' : 'Download Document'}
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

export default AdminRequestForms;
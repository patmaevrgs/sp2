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
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

function AdminRequestForms() {
  // State for document requests
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    blotter_form: 'Blotter Form'
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
  
  // Print document
  const handlePrint = () => {
    const printContents = document.getElementById('print-content').innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reload the page to restore React functionality
    window.location.reload();
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
  
  // Generate certificate of residency
  const generateCertificateOfResidency = (request) => {
    if (!request || request.documentType !== 'certificate_of_residency') {
      return <Typography>Invalid document type</Typography>;
    }
    
    const { formData } = request;
    const currentDate = new Date();
    
    return (
      <Box id="print-content" sx={{ p: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5">REPUBLIC OF THE PHILIPPINES</Typography>
          <Typography variant="h6">PROVINCE OF LAGUNA</Typography>
          <Typography variant="h6">MUNICIPALITY OF LOS BAÑOS</Typography>
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>BARANGAY MAAHAS</Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ textDecoration: 'underline', fontWeight: 'bold' }}>
            CERTIFICATE OF RESIDENCY
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">TO WHOM IT MAY CONCERN:</Typography>
        </Box>
        
        <Box sx={{ mb: 4, pl: 4 }}>
          <Typography paragraph sx={{ textIndent: '2em' }}>
            This is to certify that the name stated below is a registered and legitimate resident of 
            Sitio Ibaba, Barangay Maahas, Los Baños, Laguna.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4, pl: 8 }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography sx={{ fontWeight: 'bold' }}>Name:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography>{formData.fullName?.toUpperCase()}</Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography sx={{ fontWeight: 'bold' }}>Age:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography>{formData.age} years old</Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography sx={{ fontWeight: 'bold' }}>Date of Birth:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography>{formatDate(formData.dateOfBirth)}</Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography sx={{ fontWeight: 'bold' }}>Place of Birth:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography>{formData.placeOfBirth}</Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography sx={{ fontWeight: 'bold' }}>Nationality:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography>{formData.nationality}</Typography>
            </Grid>
            
            <Grid item xs={3}>
              <Typography sx={{ fontWeight: 'bold' }}>Civil Status:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography>{formData.civilStatus}</Typography>
            </Grid>
            
            {formData.motherName && (
              <>
                <Grid item xs={3}>
                  <Typography sx={{ fontWeight: 'bold' }}>Mother:</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{formData.motherName}</Typography>
                </Grid>
              </>
            )}
            
            {formData.fatherName && (
              <>
                <Grid item xs={3}>
                  <Typography sx={{ fontWeight: 'bold' }}>Father:</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{formData.fatherName}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        
        <Box sx={{ mb: 4, pl: 4 }}>
          <Typography paragraph>
            No. Years of Stay at Barangay: {formData.yearsOfStay} years up to present.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4, pl: 4 }}>
          <Typography paragraph>
            This certification is being issued upon the request of {formData.fullName?.toUpperCase()}, 
            for {request.purpose}.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4, pl: 4 }}>
          <Typography paragraph>
            Signed this {currentDate.getDate()}{getOrdinalSuffix(currentDate.getDate())} day of {format(currentDate, 'MMMM, yyyy')}.
          </Typography>
        </Box>
        
        <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            HON. JUAN DELA CRUZ
          </Typography>
          <Typography>Barangay Captain</Typography>
        </Box>
      </Box>
    );
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
                            {request.purpose.length > 30
                              ? `${request.purpose.substring(0, 30)}...`
                              : request.purpose}
                          </TableCell>
                          <TableCell>{getStatusChip(request.status)}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(request)}
                              title="View Details"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            
                            {request.status !== 'completed' && request.status !== 'rejected' && (
                              <>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenUpdateStatus(request)}
                                  title="Update Status"
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                                
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRejectRequest(request)}
                                  title="Reject Request"
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                                
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleOpenUpdateStatus(request)}
                                  sx={{ ml: 1 }}
                                >
                                  Update Status
                                </Button>
                              </>
                            )}
                            
                            {request.status === 'completed' && (
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handlePrintPreview(request)}
                                title="Print Document"
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            )}
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
                <Typography variant="body2"><strong>Status:</strong> {selectedRequest.status}</Typography>
                <Typography variant="body2"><strong>Requested:</strong> {formatDate(selectedRequest.createdAt)}</Typography>
                <Typography variant="body2"><strong>Last Updated:</strong> {formatDate(selectedRequest.updatedAt)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2"><strong>Purpose:</strong> {selectedRequest.purpose}</Typography>
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
              
              {selectedRequest.documentType === 'certificate_of_residency' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Full Name:</strong> {selectedRequest.formData.fullName}</Typography>
                    <Typography variant="body2"><strong>Age:</strong> {selectedRequest.formData.age}</Typography>
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
          {selectedRequest && selectedRequest.status !== 'completed' && selectedRequest.status !== 'rejected' && (
            <Button 
              onClick={() => {
                setOpenDetails(false);
                handleOpenUpdateStatus(selectedRequest);
              }} 
              color="primary"
              variant="contained"
            >
              Update Status
            </Button>
          )}
          
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
              Print Document
            </Button>
          )}
          
          <Button onClick={() => setOpenDetails(false)}>
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
      
      {/* Print Preview Dialog */}
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
            This is a preview of the document that will be printed. Click the Print button to print or save as PDF.
          </Alert>
          
          <Box sx={{ border: '1px solid #ddd', p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
              [Preview of {selectedRequest && documentTypeMap[selectedRequest.documentType]}]
            </Typography>
            
            <Typography paragraph>
              The actual document will be generated based on the information provided by the resident.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setOpenPrintPreview(false)}
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            color="primary"
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Print
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
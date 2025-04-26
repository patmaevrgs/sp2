import React, { useState, useEffect } from 'react';
import {
  Box,
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
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Link,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

function AdminProposal() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch proposals data
  useEffect(() => {
    fetchProposals();
  }, [statusFilter, showArchived]);
  
  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      
      // If not showing archived, only fetch non-rejected proposals
      if (!showArchived) {
        queryParams.append('excludeStatus', 'rejected');
      }
      
      const response = await fetch(`http://localhost:3002/proposals?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.proposals);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch proposals');
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle viewing proposal details
  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setOpenDetailsDialog(true);
  };
  
  // Handle updating proposal status
  const handleUpdateStatus = (proposal) => {
    setSelectedProposal(proposal);
    setStatusValue(proposal.status);
    setAdminComment(proposal.adminComment || '');
    setOpenStatusDialog(true);
  };
  
  // Submit status update
  const submitStatusUpdate = async () => {
    if (!selectedProposal || !statusValue) return;
    
    setUpdateLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002/proposals/${selectedProposal._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusValue,
          adminComment: adminComment
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update proposal status');
      }
      
      // Update the proposals list with the updated proposal
      setProposals(proposals.map(proposal => 
        proposal._id === selectedProposal._id ? data.proposal : proposal
      ));
      
      setOpenStatusDialog(false);
      setSnackbar({
        open: true,
        message: 'Proposal status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update proposal status',
        severity: 'error'
      });
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Handle deleting a proposal
  const handleDeleteProposal = (proposal) => {
    setSelectedProposal(proposal);
    setOpenDeleteDialog(true);
  };
  
  // Confirm proposal deletion
  const confirmDeleteProposal = async () => {
    if (!selectedProposal) return;
    
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002/proposals/${selectedProposal._id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete proposal');
      }
      
      // Remove the deleted proposal from the list
      setProposals(proposals.filter(proposal => proposal._id !== selectedProposal._id));
      
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Proposal deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete proposal',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString || 'N/A';
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
      case 'in_review':
        color = 'info';
        label = 'In Review';
        break;
      case 'considered':
        color = 'primary';
        label = 'Considered';
        break;
      case 'approved':
        color = 'success';
        label = 'Approved';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      default:
        color = 'default';
        label = status.replace('_', ' ');
    }
    
    return <Chip size="small" label={label} color={color} />;
  };
  
  // Render loading state
  if (loading && proposals.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Project Proposals Management
      </Typography>
      
      {/* Filter and controls */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Filter by Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Proposals</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_review">In Review</MenuItem>
            <MenuItem value="considered">Considered</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={showArchived} 
                onChange={(e) => setShowArchived(e.target.checked)}
              />
            }
            label="Show Rejected"
          />
          
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchProposals}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Desktop view: Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Title</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No proposals found
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((proposal) => (
                  <TableRow key={proposal._id}>
                    <TableCell>{proposal.projectTitle}</TableCell>
                    <TableCell>{proposal.fullName}</TableCell>
                    <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                    <TableCell>{getStatusChip(proposal.status)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(proposal)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateStatus(proposal)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteProposal(proposal)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Mobile view: Cards */}
      {isMobile && (
        <Box>
          {proposals.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No proposals found
              </Typography>
            </Paper>
          ) : (
            proposals.map((proposal) => (
              <Card key={proposal._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {proposal.projectTitle}
                    </Typography>
                    {getStatusChip(proposal.status)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Submitted by: {proposal.fullName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {formatDate(proposal.createdAt)}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(proposal)}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdateStatus(proposal)}
                    >
                      Update
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteProposal(proposal)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
      
      {/* Proposal Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        {selectedProposal && (
          <>
            <DialogTitle>
              Project Proposal Details
              <IconButton
                aria-label="close"
                onClick={() => setOpenDetailsDialog(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {selectedProposal.projectTitle}
                  </Typography>
                  {getStatusChip(selectedProposal.status)}
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Submitter Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedProposal.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {selectedProposal.contactNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedProposal.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Submission Details
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date Submitted:</strong> {formatDate(selectedProposal.createdAt)}
                  </Typography>
                  {selectedProposal.updatedAt && selectedProposal.updatedAt !== selectedProposal.createdAt && (
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> {formatDate(selectedProposal.updatedAt)}
                    </Typography>
                  )}
                  {selectedProposal.processedBy && selectedProposal.processedBy.firstName && (
                    <Typography variant="body2">
                      <strong>Processed By:</strong> {selectedProposal.processedBy.firstName} {selectedProposal.processedBy.lastName}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {selectedProposal.description}
                    </Typography>
                  </Paper>
                </Grid>
                
                {selectedProposal.adminComment && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Admin Comments
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                        {selectedProposal.adminComment}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Plan Document
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<FileIcon />}
                    component="a"
                    href={`http://localhost:3002${selectedProposal.documentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document ({selectedProposal.documentFilename})
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleUpdateStatus(selectedProposal)} color="primary">
                Update Status
              </Button>
              <Button onClick={() => setOpenDetailsDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => !updateLoading && setOpenStatusDialog(false)}
        fullWidth
      >
        <DialogTitle>Update Proposal Status</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Update the status of "{selectedProposal?.projectTitle}" submitted by {selectedProposal?.fullName}.
          </DialogContentText>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={statusValue}
              label="Status"
              onChange={(e) => setStatusValue(e.target.value)}
              disabled={updateLoading}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="considered">Considered</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            label="Admin Comments"
            multiline
            rows={4}
            fullWidth
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            disabled={updateLoading}
            placeholder="Optional: Provide feedback, explanation, or additional information for the resident"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenStatusDialog(false)} 
            disabled={updateLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitStatusUpdate} 
            color="primary" 
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the proposal "{selectedProposal?.projectTitle}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteProposal} 
            color="error" 
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
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
  
export default AdminProposal;
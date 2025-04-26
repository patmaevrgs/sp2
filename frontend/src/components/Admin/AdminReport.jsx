import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Grid, Box, TextField, Button,
  Tab, Tabs, MenuItem, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, Snackbar, Alert, Chip,
  CardMedia, Card
} from '@mui/material';

function AdminReport() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    adminComments: ''
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch all reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on tab selection and search term
  useEffect(() => {
    if (!reports.length) return;
    
    let filtered = [...reports];
    
    // Filter by status based on tab
    if (tabValue === 1) {
      filtered = filtered.filter(report => report.status === 'Pending');
    } else if (tabValue === 2) {
      filtered = filtered.filter(report => report.status === 'In Progress');
    } else if (tabValue === 3) {
      filtered = filtered.filter(report => report.status === 'Resolved');
    } else if (tabValue === 4) {
      filtered = filtered.filter(report => report.status === 'Cancelled');
    }
    
    // Apply search filter if searchTerm exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.fullName.toLowerCase().includes(term) ||
        report.location.toLowerCase().includes(term) ||
        report.issueType.toLowerCase().includes(term) ||
        report.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, tabValue, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/reports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        setFilteredReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      handleAlert('Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    // Reset status update when opening details
    setStatusUpdate({
      status: report.status,
      adminComments: report.adminComments || ''
    });
  };

  const handleUpdateStatus = () => {
    setUpdateDialogOpen(true);
  };

  const handleStatusInputChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdate(prev => ({ ...prev, [name]: value }));
  };

  const submitStatusUpdate = async () => {
    try {
      // Get admin's name from localStorage
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      let adminName = '';
      
      if (firstName && lastName) {
        adminName = `${firstName} ${lastName}`;
      } else if (localStorage.getItem("fullName")) {
        adminName = localStorage.getItem("fullName");
      } else {
        adminName = localStorage.getItem("user") || "Unknown Admin";
      }
      
      const response = await fetch(
        `http://localhost:3002/reports/${selectedReport._id}/status`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...statusUpdate,
            adminName // Add admin name to the request
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Update the reports array with the updated report
        const updatedReports = reports.map(report => 
          report._id === selectedReport._id ? data.report : report
        );
        setReports(updatedReports);
        
        handleAlert('Report status updated successfully', 'success');
        
        // Close both dialogs
        setUpdateDialogOpen(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      handleAlert('Failed to update report status', 'error');
    }
  };

  const handleAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Resolved': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  // Render media galleries
  const renderMedia = (report) => {
    return (
      <>
        {report.mediaUrls && report.mediaUrls.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
              Media ({report.mediaUrls.length}):
            </Typography>
            <Grid container spacing={1}>
              {report.mediaUrls.map((url, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      image={`http://localhost:3002${url}`}
                      alt={`Report image ${index + 1}`}
                      sx={{ 
                        height: 150, 
                        objectFit: 'cover',
                        '&:hover': {
                          cursor: 'pointer',
                          opacity: 0.9
                        }
                      }}
                      onClick={() => window.open(`http://localhost:3002${url}`, '_blank')}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Infrastructure Reports Management
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report status tabs">
          <Tab label="All Reports" />
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Resolved" />
          <Tab label="Cancelled" />
        </Tabs>
        
        <TextField
          label="Search Reports"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 250 }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No reports found matching your criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReports.map((report) => (
            <Grid item xs={12} key={report._id}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3,
                  borderLeft: 6,
                  borderColor: getStatusColor(report.status) + '.main'
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2">
                        {report.issueType} 
                        <Chip 
                          label={report.status} 
                          color={getStatusColor(report.status)} 
                          size="small" 
                          sx={{ ml: 1 }} 
                        />
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Reported on {formatDate(report.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Location:</strong> {report.location} (Near {report.nearestLandmark})
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mt: 2 }} paragraph>
                      {report.description.length > 150 
                        ? `${report.description.substring(0, 150)}...` 
                        : report.description}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Reported by:</strong> {report.fullName} | <strong>Contact:</strong> {report.contactNumber}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {report.adminComments && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2">Admin Notes:</Typography>
                        <Typography variant="body2">
                          {report.adminComments}
                        </Typography>
                      </Box>
                    )}
                    
                    {report.residentFeedback && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: report.residentFeedback.satisfied ? 'success.light' : 'error.light', borderRadius: 1 }}>
                        <Typography variant="subtitle2">
                          Resident Feedback: {report.residentFeedback.satisfied ? '👍 Satisfied' : '👎 Not Satisfied'}
                        </Typography>
                        {report.residentFeedback.comments && (
                          <Typography variant="body2">
                            "{report.residentFeedback.comments}"
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleViewReport(report)}
                      >
                        View Details
                      </Button>
                      {report.status !== 'Cancelled' && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            handleViewReport(report);
                            handleUpdateStatus();
                          }}
                        >
                          Update Status
                        </Button>
                      )}
                    </Box>
                  </Grid>
                  
                  {renderMedia(report)}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Report Detail Dialog */}
      {selectedReport && !updateDialogOpen && (
        <Dialog 
          open={Boolean(selectedReport)} 
          onClose={() => setSelectedReport(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {selectedReport.issueType} - {selectedReport.status}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Reported By:</Typography>
                <Typography variant="body1" paragraph>{selectedReport.fullName}</Typography>
                
                <Typography variant="subtitle1">Contact:</Typography>
                <Typography variant="body1" paragraph>{selectedReport.contactNumber}</Typography>
                
                <Typography variant="subtitle1">Location:</Typography>
                <Typography variant="body1" paragraph>
                  {selectedReport.location}<br />
                  <em>Near {selectedReport.nearestLandmark}</em>
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Issue Type:</Typography>
                <Typography variant="body1" paragraph>{selectedReport.issueType}</Typography>
                
                <Typography variant="subtitle1">Date Observed:</Typography>
                <Typography variant="body1" paragraph>
                  {formatDate(selectedReport.dateObserved)}
                </Typography>
                
                <Typography variant="subtitle1">Report Submitted:</Typography>
                <Typography variant="body1" paragraph>
                  {formatDate(selectedReport.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1" paragraph>
                  {selectedReport.description}
                </Typography>
                
                {selectedReport.additionalComments && (
                  <>
                    <Typography variant="subtitle1">Additional Comments:</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedReport.additionalComments}
                    </Typography>
                  </>
                )}
              </Grid>
              
              {/* Media rendering for dialog */}
              {selectedReport.mediaUrls && selectedReport.mediaUrls.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Media:</Typography>
                  <Grid container spacing={2}>
                    {selectedReport.mediaUrls.map((url, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ height: '100%' }}>
                          <CardMedia
                            component="img"
                            image={`http://localhost:3002${url}`}
                            alt={`Attachment ${index + 1}`}
                            sx={{
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 1,
                              '&:hover': {
                                cursor: 'pointer',
                                opacity: 0.9
                              }
                            }}
                            onClick={() => window.open(`http://localhost:3002${url}`, '_blank')}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
              
              {selectedReport.adminComments && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1">Admin Notes:</Typography>
                    <Typography variant="body1">{selectedReport.adminComments}</Typography>
                  </Paper>
                </Grid>
              )}
              
              {selectedReport.residentFeedback && (
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      bgcolor: selectedReport.residentFeedback.satisfied ? 'success.light' : 'error.light'
                    }}
                  >
                    <Typography variant="subtitle1">
                      Resident Feedback: {selectedReport.residentFeedback.satisfied ? 'Satisfied' : 'Not Satisfied'}
                    </Typography>
                    {selectedReport.residentFeedback.comments && (
                      <Typography variant="body1">
                        "{selectedReport.residentFeedback.comments}"
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedReport(null)}>Close</Button>
            {selectedReport.status !== 'Cancelled' && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleUpdateStatus();
                }}
              >
                Update Status
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
      
      {/* Status Update Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false);
          setSelectedReport(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={statusUpdate.status}
              onChange={handleStatusInputChange}
              sx={{ mb: 3 }}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Admin Comments"
              name="adminComments"
              value={statusUpdate.adminComments}
              onChange={handleStatusInputChange}
              multiline
              rows={4}
              placeholder="Add notes about the status update or resolution details..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setUpdateDialogOpen(false);
              setSelectedReport(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={submitStatusUpdate}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert/Snackbar for notifications */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminReport;
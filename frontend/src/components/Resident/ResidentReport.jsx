import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, MenuItem, 
  Grid, Paper, CircularProgress, Snackbar, Alert, CardMedia, Card, 
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { useDropzone } from 'react-dropzone';

function ResidentReport() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [userReports, setUserReports] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    location: '',
    nearestLandmark: '',
    issueType: '',
    dateObserved: '',
    description: '',
    additionalComments: '',
  });
  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);

  // Fetch user's reports on component mount
  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      // Get user ID from local storage
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');

      if (!userId) {
        handleAlert('User ID not found', 'error');
        return;
      }

      const response = await fetch(`http://localhost:3002/reports/user?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();

      if (data.success) {
        setUserReports(data.reports);
      } else {
        handleAlert(data.message || 'Failed to fetch your reports', 'error');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file uploads with react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Handle accepted files
      const processedFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setFiles(processedFiles);

      // Handle rejected files
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map(e => {
          switch(e.code) {
            case 'file-too-large':
              return `${file.name} is too large (max 10MB)`;
            case 'file-invalid-type':
              return `${file.name} is not a supported file type`;
            default:
              return `${file.name} could not be uploaded`;
          }
        });
        return errorMessages;
      }).flat();
      
      setFileErrors(errors);
    }
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user ID from local storage
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');

      const formDataToSubmit = new FormData();
      
      // Add user ID to form data
      formDataToSubmit.append('userId', userId);

      // Add other form fields
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      
      // Add files to FormData
      files.forEach((file) => {
        formDataToSubmit.append('media', file);
      });

      const response = await fetch('http://localhost:3002/reports', {
        method: 'POST',
        body: formDataToSubmit
      });

      const data = await response.json();

      if (data.success) {
        handleAlert(data.message || 'Report submitted successfully!', 'success');
        resetForm();
        fetchUserReports();
      } else {
        handleAlert(data.message || 'Failed to submit report', 'error');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback for a report
  const submitFeedback = async (reportId, satisfied, comments) => {
    try {
      const response = await fetch(`http://localhost:3002/reports/${reportId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ satisfied, comments })
      });

      const data = await response.json();

      if (data.success) {
        handleAlert('Feedback submitted successfully!', 'success');
        fetchUserReports();
      } else {
        handleAlert(data.message || 'Failed to submit feedback', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      fullName: '',
      contactNumber: '',
      location: '',
      nearestLandmark: '',
      issueType: '',
      dateObserved: '',
      description: '',
      additionalComments: '',
    });
    setFiles([]);
    setFileErrors([]);
  };

  // Handle alert messages
  const handleAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Render file previews
  const thumbs = files.map(file => (
    <Box
      key={file.name}
      sx={{
        display: 'inline-flex',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        marginBottom: 1,
        marginRight: 1,
        width: 100,
        height: 100,
        padding: 0.5,
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ display: 'flex', minWidth: 0, overflow: 'hidden' }}>
        <img
          src={file.preview}
          style={{
            display: 'block',
            width: 'auto',
            height: '100%'
          }}
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
          alt="preview"
        />
      </Box>
    </Box>
  ));

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const issueTypes = [
    'Road Damage',
    'Street Light Issue',
    'Drainage Problem',
    'Waste Management',
    'Water Supply',
    'Electrical Issue',
    'Public Safety',
    'Others'
  ];

  // Add this method to your existing ResidentReport component
  const cancelReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:3002/reports/${reportId}/cancel`, {
        method: 'PUT', // or 'PATCH' depending on your backend route
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        handleAlert('Report cancelled successfully!', 'success');
        fetchUserReports(); // Refresh the list of reports
      } else {
        handleAlert(data.message || 'Failed to cancel report', 'error');
      }
    } catch (error) {
      console.error('Error cancelling report:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    }
  };

  // Helper function to render media galleries
  const renderMedia = (report) => {
    return (
      <>
        {/* Images Gallery */}
        {report.mediaUrls && report.mediaUrls.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={1}>
              {report.mediaUrls.map((imgPath, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      image={`http://localhost:3002${imgPath}`}
                      alt={`Report image ${index + 1}`}
                      sx={{ 
                        height: 200, 
                        objectFit: 'cover',
                        '&:hover': {
                          cursor: 'pointer',
                          opacity: 0.9
                        }
                      }}
                      onClick={() => window.open(`http://localhost:3002${imgPath}`, '_blank')}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component= "h1" gutterBottom sx={{ mb: 4 }}>
        Report Infrastructure Issue
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location of Issue"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nearest Landmark"
                name="nearestLandmark"
                value={formData.nearestLandmark}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Issue Type"
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {issueTypes.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Observation"
                name="dateObserved"
                type="date"
                value={formData.dateObserved}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description of the Issue"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Comments/Suggestions (Optional)"
                name="additionalComments"
                value={formData.additionalComments}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Photos/Videos (Max 5 files)
              </Typography>
              <Box 
                {...getRootProps()} 
                sx={{
                  border: '2px dashed #eeeeee',
                  borderRadius: 2,
                  p: 2,
                  mt: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <input {...getInputProps()} name="media" />
                <Typography>
                  Drag and drop files here, or click to select files
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Supported formats: JPEG, PNG, MP4, MOV (Max size: 10MB per file)
                </Typography>
              </Box>
              
              {/* File error messages */}
              {fileErrors.length > 0 && (
                <Box sx={{ mt: 2, color: 'error.main' }}>
                  {fileErrors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error">
                      {error}
                    </Typography>
                  ))}
                </Box>
              )}
              
              {/* File previews */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                {thumbs}
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Report'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* My Reports Section */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
        My Reports
      </Typography>
      
      {userReports.length === 0 ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You haven't submitted any reports yet.
          </Typography>
        </Paper>
      ) : (
        userReports.map((report) => (
          <Paper 
            key={report._id} 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderLeft: 6, 
              borderColor: 
                report.status === 'Pending' ? 'warning.main' : 
                report.status === 'In Progress' ? 'info.main' : 
                'success.main'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6">{report.issueType}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Submitted on {formatDate(report.createdAt)}
                </Typography>
                <Typography variant="body1" paragraph>
                  {report.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {report.location} (Near {report.nearestLandmark})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 
                    report.status === 'Pending' ? 'warning.light' : 
                    report.status === 'In Progress' ? 'info.light' : 
                    'success.light',
                  borderRadius: 1,
                  mb: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="subtitle1">
                    Status: <strong>{report.status}</strong>
                  </Typography>
                </Box>
                
                {report.adminComments && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Admin Response:</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{report.adminComments}"
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
            
            {/* Render media if available */}
            {renderMedia(report)}
            
            {report.status === 'Pending' && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 2 
              }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => {
                    const confirmCancel = window.confirm('Are you sure you want to cancel this report?');
                    if (confirmCancel) {
                      cancelReport(report._id);
                    }
                  }}
                >
                  Cancel Report
                </Button>
              </Box>
            )}
            {/* Feedback section for resolved issues */}
            {report.status === 'Resolved' && !report.residentFeedback && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Provide Feedback
                </Typography>
                <Box component="form" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const satisfied = formData.get('satisfied') === 'true';
                  const comments = formData.get('feedbackComments');
                  submitFeedback(report._id, satisfied, comments);
                }}>
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Are you satisfied with the resolution?</FormLabel>
                    <RadioGroup row name="satisfied">
                      <FormControlLabel value="true" control={<Radio />} label="Yes" />
                      <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                  <TextField
                    fullWidth
                    name="feedbackComments"
                    label="Comments"
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                  <Button type="submit" variant="contained" size="small">
                    Submit Feedback
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Display feedback if already provided */}
            {report.residentFeedback && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Your Feedback: {report.residentFeedback.satisfied ? '👍 Satisfied' : '👎 Not Satisfied'}
                </Typography>
                {report.residentFeedback.comments && (
                  <Typography variant="body2">
                    "{report.residentFeedback.comments}"
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        ))
      )}

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

export default ResidentReport;
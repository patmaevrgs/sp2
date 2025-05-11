import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, MenuItem, 
  Grid, Paper, CircularProgress, Snackbar, Alert, CardMedia, Card, 
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
// Add these imports to the top of your file
import LocationIcon from '@mui/icons-material/LocationOn';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import CommentIcon from '@mui/icons-material/Comment';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import InputAdornment from '@mui/material/InputAdornment';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

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
  <Box sx={{ width: '100%' }}>
    <Typography variant="h4" gutterBottom>
      Report Infrastructure Issue
    </Typography>
    
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
      {/* Form Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        pb: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <ReportProblemOutlinedIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
        <Typography 
          variant="subtitle1" 
          sx={{ fontWeight: 600 }}
        >
          Infrastructure Issue Report Form
        </Typography>
      </Box>
      
      {/* Form Introduction */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Use this form to report any infrastructure issues in Barangay Maahas such as road damage, 
          street light problems, or drainage issues. Include photos to help our maintenance team address the problem quickly.
        </Typography>
      </Alert>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Reporter Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
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
                size="small"
                placeholder="e.g., 09XX-XXX-XXXX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Issue Location Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location of Issue"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                placeholder="e.g., Jade Street corner Ruby Street"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
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
                size="small"
                placeholder="e.g., In front of Maahas Elementary School"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Issue Information
          </Typography>
          <Grid container spacing={2}>
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
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
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
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  ),
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
                rows={3}
                variant="outlined"
                size="small"
                placeholder="Provide a detailed description of the issue including its severity and impact..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: '-36px' }}>
                      <DescriptionIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
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
                size="small"
                placeholder="Any additional information that might help our maintenance team..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: '-24px' }}>
                      <CommentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Upload Evidence
          </Typography>
          <Box 
            {...getRootProps()} 
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(0, 0, 0, 0.03)'
              }
            }}
          >
            <input {...getInputProps()} name="media" />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <AddPhotoAlternateIcon color="primary" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="body2">
                Drag and drop files here, or click to select files
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                Supported formats: JPEG, PNG, MP4, MOV (Max 5 files, 10MB each)
              </Typography>
            </Box>
          </Box>
          {/* File error messages */}
          {fileErrors.length > 0 && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1 }}>
              {fileErrors.map((error, index) => (
                <Typography key={index} variant="caption" color="error" display="block" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                  {error}
                </Typography>
              ))}
            </Box>
          )}
          
          {/* File previews */}
          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                {files.length} file(s) selected:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {thumbs}
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Important Information */}
        <Paper 
          variant="outlined" 
          sx={{ p: 2, bgcolor: 'background.default', mb: 3, borderRadius: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InfoIcon color="primary" sx={{ mr: 1.5, mt: 0.2, fontSize: 20 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'primary.main' }}>
                Important Information
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1 }}>
                Your report will be reviewed by the Barangay Maahas maintenance team. You can track the 
                status of your report in the Transactions page.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                The more details and clearer photos you provide, the faster we can address the issue.
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        {/* Alert messages */}
        {alert.open && (
          <Alert 
            severity={alert.severity} 
            onClose={closeAlert}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        )}
        
        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={resetForm}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Box>
      </Box>
    </Paper>

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
  </Box>
);
}
export default ResidentReport;
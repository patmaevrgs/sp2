import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

function RequestID() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    birthDate: null,
    emergencyContactName: '',
    emergencyContactNumber: ''
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Get user information from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setFormData(prevData => ({
        ...prevData,
        firstName: userInfo.firstName || '',
        middleName: userInfo.middleName || '',
        lastName: userInfo.lastName || '',
        address: userInfo.address || '',
        birthDate: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth) : null
      }));
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    setFormErrors({
      ...formErrors,
      [name]: ''
    });

    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormErrors({
      ...formErrors,
      birthDate: ''
    });

    setFormData({
      ...formData,
      birthDate: date
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.birthDate) errors.birthDate = 'Date of birth is required';
    if (!formData.emergencyContactName) errors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactNumber) errors.emergencyContactNumber = 'Emergency contact number is required';
    
    // Validate phone number format
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (formData.emergencyContactNumber && !phoneRegex.test(formData.emergencyContactNumber)) {
      errors.emergencyContactNumber = 'Please enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('user');
      
      // Format birth date
      const formattedBirthDate = formData.birthDate ? format(new Date(formData.birthDate), 'MMM. dd, yyyy') : '';
      
      const requestData = {
        userId,
        documentType: 'barangay_id',
        formData: {
          firstName: formData.firstName.toUpperCase(),
          middleName: formData.middleName ? formData.middleName.toUpperCase() : '',
          lastName: formData.lastName.toUpperCase(),
          address: formData.address,
          birthDate: formattedBirthDate,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactNumber: formData.emergencyContactNumber
        },
        purpose: 'Barangay Identification Card'
      };
      
      const response = await fetch('http://localhost:3002/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Reset form after success
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          address: '',
          birthDate: null,
          emergencyContactName: '',
          emergencyContactNumber: ''
        });
        
        // Redirect to transactions page after 2 seconds
        setTimeout(() => {
          navigate('/resident/transactions');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit Barangay ID request');
      }
    } catch (err) {
      console.error('Error submitting Barangay ID request:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Barangay ID Request
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Fill out this form to request your Barangay ID. Please ensure all information is accurate and matches your official identification documents.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important Note:</strong> Please bring a physical copy of your 1x1 ID picture when picking up your Barangay ID. 
            The picture will be attached to your ID before lamination. You will also need to sign your ID in person at the Barangay Hall.
          </Typography>
        </Alert>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                helperText="(Optional)"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address in Maahas"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address || "Enter your address in Maahas (Barangay Maahas, Los Baños, Laguna will be automatically added)"}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!formErrors.birthDate}
                      helperText={formErrors.birthDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Emergency Contact Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                error={!!formErrors.emergencyContactName}
                helperText={formErrors.emergencyContactName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Number"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
                error={!!formErrors.emergencyContactNumber}
                helperText={formErrors.emergencyContactNumber || "e.g., 09123456789 or +639123456789"}
                required
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Alert severity="info">
                By submitting this form, you certify that the information provided is true and correct. The Barangay ID will be processed and you will be notified when it's ready for pickup.
              </Alert>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Request'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your Barangay ID request has been submitted successfully! Redirecting to transactions page...
        </Alert>
      </Snackbar>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default RequestID;
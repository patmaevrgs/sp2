import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RequestClearance() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    address: '',
    purpose: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Submission state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Gender options
  const genderOptions = ['Male', 'Female'];
  
  // Purpose options
  const purposeOptions = [
    'LOCAL EMPLOYMENT',
    'BANK REQUIREMENT',
    'POLICE CLEARANCE',
    'NBI CLEARANCE',
    'SCHOLARSHIP',
    'SCHOOL REQUIREMENT',
    'TRAVEL REQUIREMENT',
    'BUSINESS PERMIT',
    'LOAN APPLICATION',
    'OTHER'
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field being updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = ['fullName', 'gender', 'address', 'purpose'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // If purpose is OTHER, check if custom purpose is provided
    if (formData.purpose === 'OTHER' && !formData.customPurpose) {
      newErrors.customPurpose = 'Please specify the purpose';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // If purpose is OTHER and we have a custom purpose, use that instead
      const finalPurpose = formData.purpose === 'OTHER' && formData.customPurpose
        ? formData.customPurpose
        : formData.purpose;
      
      // Create submission data
      const submissionData = {
        userId,
        documentType: 'barangay_clearance',
        formData: {
          ...formData,
          fullName: formData.fullName.toUpperCase(), // Ensure name is in uppercase
          gender: formData.gender.toLowerCase() // lowercase for controller logic
        },
        purpose: finalPurpose
      };
      
      // Remove customPurpose from formData if it exists
      if (submissionData.formData.customPurpose) {
        delete submissionData.formData.customPurpose;
      }
      
      const response = await fetch('http://localhost:3002/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }
      
      setSnackbar({
        open: true,
        message: 'Barangay Clearance request submitted successfully!',
        severity: 'success'
      });
      
      // Redirect to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setSnackbar({
        open: true,
        message: `Failed to submit request: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Barangay Clearance Request
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName || "Enter your full name (will be converted to uppercase)"}
                  variant="outlined"
                />
              </Grid>
              
              {/* Gender */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.gender}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.gender && (
                    <FormHelperText>{errors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Address */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="address"
                  name="address"
                  label="Address Details"
                  placeholder="e.g., Purok 4"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address || "Enter only your specific address details (no need to include Barangay Maahas, Los Baños, Laguna)"}
                  variant="outlined"
                />
              </Grid>
              
              {/* Purpose */}
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.purpose}>
                  <InputLabel id="purpose-label">Purpose</InputLabel>
                  <Select
                    labelId="purpose-label"
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    label="Purpose"
                  >
                    {purposeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.purpose && (
                    <FormHelperText>{errors.purpose}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Custom Purpose - Only shown if 'OTHER' is selected */}
              {formData.purpose === 'OTHER' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="customPurpose"
                    name="customPurpose"
                    label="Specify Purpose"
                    value={formData.customPurpose || ''}
                    onChange={handleChange}
                    error={!!errors.customPurpose}
                    helperText={errors.customPurpose || "Please specify the purpose for your clearance request"}
                    variant="outlined"
                  />
                </Grid>
              )}
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Information Box */}
        <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: '#f9f9f9' }}>
          <Typography variant="h6" gutterBottom>
            About Barangay Clearance
          </Typography>
          <Typography variant="body2" paragraph>
            A Barangay Clearance is an official document certifying that you have no pending criminal/civil/administrative case charged against you and are of good moral character and reputation.
          </Typography>
          <Typography variant="body2" paragraph>
            This document is commonly used for:
          </Typography>
          <ul>
            <li>Local employment requirements</li>
            <li>Business permit applications</li>
            <li>Police clearance requirements</li>
            <li>NBI clearance requirements</li>
            <li>Bank transactions</li>
            <li>Scholarship applications</li>
          </ul>
          <Typography variant="body2">
            Once your request is submitted, the Barangay staff will review your application. You will be notified when your clearance is ready for pickup.
          </Typography>
        </Paper>
      </Container>
      
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
    </>
  );
}
  
export default RequestClearance;
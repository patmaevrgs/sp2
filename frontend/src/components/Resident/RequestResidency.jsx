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

function RequestResidency() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Filipino',
    civilStatus: '',
    motherName: '',
    fatherName: '',
    yearsOfStay: '',
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
  
  // Civil status options
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'];
  
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
    const requiredFields = [
      'fullName', 'age', 'dateOfBirth', 'placeOfBirth', 
      'nationality', 'civilStatus', 'yearsOfStay', 'purpose'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Age validation - must be a positive number
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) <= 0)) {
      newErrors.age = 'Age must be a positive number';
    }
    
    // Years of stay validation - must be a positive number
    if (formData.yearsOfStay && (isNaN(formData.yearsOfStay) || parseInt(formData.yearsOfStay) < 0)) {
      newErrors.yearsOfStay = 'Years of stay must be a positive number';
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
      const response = await fetch('http://localhost:3002/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          documentType: 'certificate_of_residency',
          formData,
          purpose: formData.purpose
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }
      
      setSnackbar({
        open: true,
        message: 'Certificate of Residency request submitted successfully!',
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
            Certificate of Residency Request
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
                  helperText={errors.fullName}
                  variant="outlined"
                />
              </Grid>
              
              {/* Age */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="age"
                  name="age"
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={!!errors.age}
                  helperText={errors.age}
                  InputProps={{ inputProps: { min: 1 } }}
                  variant="outlined"
                />
              </Grid>
              
              {/* Date of Birth */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              
              {/* Place of Birth */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="placeOfBirth"
                  name="placeOfBirth"
                  label="Place of Birth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  error={!!errors.placeOfBirth}
                  helperText={errors.placeOfBirth}
                  variant="outlined"
                />
              </Grid>
              
              {/* Nationality */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="nationality"
                  name="nationality"
                  label="Nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  error={!!errors.nationality}
                  helperText={errors.nationality}
                  variant="outlined"
                />
              </Grid>
              
              {/* Civil Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.civilStatus}>
                  <InputLabel id="civilStatus-label">Civil Status</InputLabel>
                  <Select
                    labelId="civilStatus-label"
                    id="civilStatus"
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    label="Civil Status"
                  >
                    {civilStatusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.civilStatus && (
                    <FormHelperText>{errors.civilStatus}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Years of Stay */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="yearsOfStay"
                  name="yearsOfStay"
                  label="Years of Stay at Barangay"
                  type="number"
                  value={formData.yearsOfStay}
                  onChange={handleChange}
                  error={!!errors.yearsOfStay}
                  helperText={errors.yearsOfStay}
                  InputProps={{ inputProps: { min: 0 } }}
                  variant="outlined"
                />
              </Grid>
              
              {/* Mother's Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="motherName"
                  name="motherName"
                  label="Mother's Name (Optional)"
                  value={formData.motherName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              {/* Father's Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="fatherName"
                  name="fatherName"
                  label="Father's Name (Optional)"
                  value={formData.fatherName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              {/* Purpose */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="purpose"
                  name="purpose"
                  label="Purpose of Request"
                  value={formData.purpose}
                  onChange={handleChange}
                  error={!!errors.purpose}
                  helperText={errors.purpose}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              
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
            About Certificate of Residency
          </Typography>
          <Typography variant="body2" paragraph>
            A Certificate of Residency is an official document issued by the Barangay to certify that you are a legitimate resident within its jurisdiction.
          </Typography>
          <Typography variant="body2" paragraph>
            This document is commonly used for:
          </Typography>
          <ul>
            <li>Scholarship applications</li>
            <li>Employment requirements</li>
            <li>School enrollment</li>
            <li>Loan applications</li>
            <li>Legal proceedings</li>
          </ul>
          <Typography variant="body2">
            Once your request is submitted, the Barangay staff will review your application. You will be notified when your certificate is ready for pickup.
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
  
export default RequestResidency;
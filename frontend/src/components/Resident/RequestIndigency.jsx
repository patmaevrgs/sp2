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
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RequestIndigency() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    address: '',
    isSelf: false, // New property to track if certificate is for self
    guardian: '', // Will be auto-filled with fullName if isSelf is true
    guardianRelation: '', // Will be set to "SARILI (SELF)" if isSelf is true
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
  
  // Guardian relation options
  const relationOptions = ['Ama (Father)', 'Ina (Mother)', 'Asawa (Spouse)', 'Kapatid (Sibling)', 'Anak (Child)', 'Iba pa (Other)'];
  
  // Purpose options
  const purposeOptions = [
    'MEDICAL ASSISTANCE',
    'EDUCATIONAL ASSISTANCE',
    'BURIAL ASSISTANCE',
    'FINANCIAL ASSISTANCE',
    'HOSPITAL REQUIREMENTS',
    'OTHER'
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for fullName field when isSelf is true
    if (name === 'fullName' && formData.isSelf) {
      setFormData({
        ...formData,
        [name]: value,
        guardian: value // Auto-update guardian when fullName changes and isSelf is true
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
    
    // Required fields validation - always required
    const alwaysRequiredFields = ['fullName', 'age', 'address', 'purpose'];
    
    alwaysRequiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Guardian fields only required if not for self
    if (!formData.isSelf) {
      if (!formData.guardian) {
        newErrors.guardian = 'This field is required';
      }
      if (!formData.guardianRelation) {
        newErrors.guardianRelation = 'This field is required';
      }
    }
    
    // Age validation - must be a positive number
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) <= 0)) {
      newErrors.age = 'Age must be a positive number';
    }
    
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
        documentType: 'certificate_of_indigency',
        formData: {
          ...formData,
          fullName: formData.fullName.toUpperCase(), // Ensure name is in uppercase
          // Make sure guardian is updated if this is a self-application
          guardian: formData.isSelf ? formData.fullName.toUpperCase() : formData.guardian.toUpperCase(),
          guardianRelation: formData.isSelf ? 'SARILI (SELF)' : formData.guardianRelation
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
        message: 'Certificate of Indigency request submitted successfully!',
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
            Certificate of Indigency Request
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
              
              {/* Recipient Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Recipient Information
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Who will be using this certificate? (If for yourself, select "Self")
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Self or Other Selection */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    name="isSelf"
                    value={formData.isSelf ? 'self' : 'other'}
                    onChange={(e) => {
                      const isSelf = e.target.value === 'self';
                      setFormData({
                        ...formData,
                        isSelf: isSelf,
                        // If self is selected, pre-fill guardian with full name and clear errors
                        guardian: isSelf ? formData.fullName : '',
                        guardianRelation: isSelf ? 'SARILI (SELF)' : '',
                      });
                      // Clear any errors for these fields
                      if (errors.guardian || errors.guardianRelation) {
                        setErrors({
                          ...errors,
                          guardian: '',
                          guardianRelation: ''
                        });
                      }
                    }}
                  >
                    <FormControlLabel value="self" control={<Radio />} label="Self (For my own use)" />
                    <FormControlLabel value="other" control={<Radio />} label="Other Person" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Guardian fields - shown only if "Other" is selected */}
              {formData.isSelf !== true && (
                <>
                  {/* Guardian Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="guardian"
                      name="guardian"
                      label="Recipient Name"
                      value={formData.guardian}
                      onChange={handleChange}
                      error={!!errors.guardian}
                      helperText={errors.guardian || "Enter the full name of the person who will use this certificate"}
                      variant="outlined"
                    />
                  </Grid>
                  
                  {/* Relationship to Guardian */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!errors.guardianRelation}>
                      <InputLabel id="relation-label">Relationship to Recipient</InputLabel>
                      <Select
                        labelId="relation-label"
                        id="guardianRelation"
                        name="guardianRelation"
                        value={formData.guardianRelation}
                        onChange={handleChange}
                        label="Relationship to Recipient"
                      >
                        {relationOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.guardianRelation && (
                        <FormHelperText>{errors.guardianRelation}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </>
              )}
              
              {/* Purpose */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Purpose Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
                    helperText={errors.customPurpose || "Please specify the purpose for your certificate request"}
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
            About Certificate of Indigency
          </Typography>
          <Typography variant="body2" paragraph>
            A Certificate of Indigency is an official document certifying that you or your family are classified as indigent (low-income) residents of the barangay and may not have sufficient means to pay for certain services or fees.
          </Typography>
          <Typography variant="body2" paragraph>
            This document is commonly used for:
          </Typography>
          <ul>
            <li>Medical assistance</li>
            <li>Educational assistance</li>
            <li>Burial assistance</li>
            <li>Financial assistance from government agencies</li>
            <li>Fee waivers at hospitals and other institutions</li>
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
  
export default RequestIndigency;
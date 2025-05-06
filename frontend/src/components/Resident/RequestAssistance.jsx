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
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RequestAssistance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    yearsOfStay: '',
    marginGroupType: 'urban_poor',
    isSelf: true,
    beneficiaryName: '',
    beneficiaryRelation: '',
    assistanceType: 'financial',
    otherAssistanceType: '',
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Get user information from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setFormData(prevData => ({
        ...prevData,
        fullName: `${userInfo.firstName} ${userInfo.middleName ? userInfo.middleName + ' ' : ''}${userInfo.lastName}`,
        address: userInfo.address || '',
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

    // If beneficiary is self, automatically set beneficiary name to full name
    if (name === 'isSelf' && value === 'true') {
      setFormData(prevData => ({
        ...prevData,
        beneficiaryName: prevData.fullName,
        beneficiaryRelation: 'self',
        [name]: value === 'true'
      }));
    } else if (name === 'isSelf' && value === 'false') {
      setFormData(prevData => ({
        ...prevData,
        beneficiaryName: '',
        beneficiaryRelation: '',
        [name]: value === 'true'
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.yearsOfStay) errors.yearsOfStay = 'Years of residency is required';
    if (!formData.marginGroupType) errors.marginGroupType = 'Please select a marginalized group';
    
    if (!formData.isSelf) {
      if (!formData.beneficiaryName) errors.beneficiaryName = 'Beneficiary name is required';
      if (!formData.beneficiaryRelation) errors.beneficiaryRelation = 'Relationship to beneficiary is required';
    }
    
    if (!formData.assistanceType) errors.assistanceType = 'Type of assistance is required';
    if (formData.assistanceType === 'other' && !formData.otherAssistanceType) {
      errors.otherAssistanceType = 'Please specify the type of assistance';
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
    
    // Prepare purpose string based on assistance type
    let purpose;
    if (formData.assistanceType === 'other') {
      purpose = `requesting for ${formData.otherAssistanceType} assistance`;
    } else if (formData.assistanceType === 'financial') {
      purpose = 'requesting for financial assistance';
    } else if (formData.assistanceType === 'medical') {
      purpose = 'requesting for medical assistance';
    } else if (formData.assistanceType === 'burial') {
      purpose = 'requesting for burial assistance';
    } else {
      purpose = `requesting for ${formData.assistanceType} assistance`;
    }
    
    // Format beneficiary data
    let beneficiaryInfo = '';
    if (!formData.isSelf) {
      beneficiaryInfo = `${formData.beneficiaryName} (${formData.beneficiaryRelation})`;
    } else {
      beneficiaryInfo = 'himself/herself';
    }
    
    // Complete purpose with beneficiary info
    purpose = `${purpose} from the Municipal Government of Los Baños for ${beneficiaryInfo}`;
    
    // Convert isSelf from string to boolean if necessary
    const isSelfBoolean = 
      typeof formData.isSelf === 'string' 
      ? formData.isSelf === 'true' 
      : !!formData.isSelf;
    
    const requestData = {
      userId,
      documentType: 'request_for_assistance',
      formData: {
        ...formData,
        // Ensure boolean for isSelf
        isSelf: isSelfBoolean
      },
      purpose
    };
    
    console.log('Sending request data:', JSON.stringify(requestData));
    
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
        fullName: '',
        address: '',
        yearsOfStay: '',
        marginGroupType: 'urban_poor',
        isSelf: true,
        beneficiaryName: '',
        beneficiaryRelation: '',
        assistanceType: 'financial',
        otherAssistanceType: '',
      });
      
      // Redirect to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);
    } else {
      throw new Error(data.message || 'Failed to submit request');
    }
  } catch (err) {
    console.error('Error submitting request for assistance:', err);
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

  // Marginalized groups options
  const marginalizedGroups = [
    { value: 'urban_poor', label: 'Urban Poor' },
    { value: 'senior_citizen', label: 'Senior Citizen' },
    { value: 'single_parent', label: 'Single Parent' },
    { value: 'pwd', label: 'Person with Disability (PWD)' },
    { value: 'other', label: 'Other' }
  ];

  // Assistance types
  const assistanceTypes = [
    { value: 'financial', label: 'Financial Assistance' },
    { value: 'medical', label: 'Medical Assistance' },
    { value: 'burial', label: 'Burial Assistance' },
    { value: 'educational', label: 'Educational Assistance' },
    { value: 'food', label: 'Food Assistance' },
    { value: 'housing', label: 'Housing Assistance' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Request for Assistance
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Fill out this form to request financial, medical, burial, or other assistance from the Barangay.
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address (Sitio/Purok, etc.)"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address || "Barangay Maahas, Los Baños, Laguna will be automatically added"}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Residency"
                name="yearsOfStay"
                type="number"
                value={formData.yearsOfStay}
                onChange={handleInputChange}
                error={!!formErrors.yearsOfStay}
                helperText={formErrors.yearsOfStay}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.marginGroupType} required>
                <InputLabel>Marginalized Group</InputLabel>
                <Select
                  name="marginGroupType"
                  value={formData.marginGroupType}
                  label="Marginalized Group"
                  onChange={handleInputChange}
                >
                  {marginalizedGroups.map((group) => (
                    <MenuItem key={group.value} value={group.value}>
                      {group.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.marginGroupType && (
                  <FormHelperText>{formErrors.marginGroupType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Assistance Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assistance Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">Request for:</FormLabel>
                <RadioGroup
                  row
                  name="isSelf"
                  value={formData.isSelf.toString()}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Myself" />
                  <FormControlLabel value="false" control={<Radio />} label="Someone else" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {!formData.isSelf && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Beneficiary Name"
                    name="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={handleInputChange}
                    error={!!formErrors.beneficiaryName}
                    helperText={formErrors.beneficiaryName}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Relationship to Beneficiary"
                    name="beneficiaryRelation"
                    value={formData.beneficiaryRelation}
                    onChange={handleInputChange}
                    error={!!formErrors.beneficiaryRelation}
                    helperText={formErrors.beneficiaryRelation || "e.g., Son, Daughter, Parent, Sibling"}
                    required
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.assistanceType} required>
                <InputLabel>Type of Assistance</InputLabel>
                <Select
                  name="assistanceType"
                  value={formData.assistanceType}
                  label="Type of Assistance"
                  onChange={handleInputChange}
                >
                  {assistanceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.assistanceType && (
                  <FormHelperText>{formErrors.assistanceType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {formData.assistanceType === 'other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specify Other Assistance Type"
                  name="otherAssistanceType"
                  value={formData.otherAssistanceType}
                  onChange={handleInputChange}
                  error={!!formErrors.otherAssistanceType}
                  helperText={formErrors.otherAssistanceType}
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Alert severity="info">
                By submitting this form, you certify that the information provided is true and correct. False information may lead to rejection of your request and may be subject to penalties under applicable laws.
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
          Your request for assistance has been submitted successfully! Redirecting to transactions page...
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

export default RequestAssistance;
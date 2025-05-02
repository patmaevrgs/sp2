import React, { useState } from 'react';
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
  MenuItem,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RequestDigging() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Personal details
    fullName: '',
    address: '',
    
    // Digging details
    diggingPurpose: 'water_supply',
    companyName: '',
    applicationDetails: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create purpose string based on selection
    let purposeText = '';
    let applicationText = '';
    
    if (formData.diggingPurpose === 'water_supply') {
      purposeText = `to dig across the road for their water supply as required by the ${formData.companyName}`;
      applicationText = `in connection with ${formData.applicationDetails}`;
    } else if (formData.diggingPurpose === 'electrical') {
      purposeText = `to dig across the road for electrical connections as required by the ${formData.companyName}`;
      applicationText = `in connection with ${formData.applicationDetails}`;
    } else if (formData.diggingPurpose === 'drainage') {
      purposeText = `to dig for drainage system installation as required by the ${formData.companyName}`;
      applicationText = `in connection with ${formData.applicationDetails}`;
    } else {
      purposeText = formData.diggingPurpose;
      applicationText = `in connection with ${formData.applicationDetails}`;
    }

    try {
      const response = await fetch('http://localhost:3002/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentType: 'digging_permit',
          formData: {
            fullName: formData.fullName,
            address: formData.address,
            diggingPurpose: formData.diggingPurpose,
            companyName: formData.companyName,
            applicationDetails: formData.applicationDetails,
            purposeText: purposeText,
            applicationText: applicationText
          },
          purpose: purposeText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit digging permit request');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Your digging permit request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        fullName: '',
        address: '',
        diggingPurpose: 'water_supply',
        companyName: '',
        applicationDetails: '',
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting digging permit request:', error);
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
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Request Digging Permit
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              About This Document
            </Typography>
            <Typography variant="body2">
              This permit allows you to dig across roads or public areas within the barangay for 
              utility connections, drainage systems, or other approved purposes.
            </Typography>
          </CardContent>
        </Card>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., AIZEL M. RAMOS"
                    helperText="Your complete name with middle initial if applicable (preferably in UPPERCASE)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., Purok 1"
                    helperText="Your specific location within Barangay Maahas, Los Baños, Laguna"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Digging Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Digging Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="digging-purpose-label">Digging Purpose</InputLabel>
                    <Select
                      labelId="digging-purpose-label"
                      name="diggingPurpose"
                      value={formData.diggingPurpose}
                      onChange={handleChange}
                      label="Digging Purpose"
                    >
                      <MenuItem value="water_supply">Water Supply Connection</MenuItem>
                      <MenuItem value="electrical">Electrical Connection</MenuItem>
                      <MenuItem value="drainage">Drainage System</MenuItem>
                      <MenuItem value="other">Other (Please specify in application details)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., Laguna Aquatech Resources Corporation (LARC)"
                    helperText="Name of the company requiring or overseeing the digging work"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Connection Details"
                    name="applicationDetails" // keeping the same field name in the state
                    value={formData.applicationDetails}
                    onChange={handleChange}
                    placeholder="e.g., LARC Application"
                    helperText="Briefly identify what this permit is for (e.g., LARC Application, Meralco Electric Line)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Submit Button */}
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Request'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
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

export default RequestDigging;
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

function RequestFencing() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Requester details
    fullName: '',
    residentAddress: '',
    
    // Property details
    propertyLocation: '',
    taxDeclarationNumber: '',
    propertyIdentificationNumber: '',
    propertyArea: '',
    areaUnit: 'square_meters',
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

    try {
      const response = await fetch('http://localhost:3002/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentType: 'fencing_permit',
          formData: {
            fullName: formData.fullName,
            residentAddress: formData.residentAddress,
            propertyLocation: formData.propertyLocation,
            taxDeclarationNumber: formData.taxDeclarationNumber,
            propertyIdentificationNumber: formData.propertyIdentificationNumber,
            propertyArea: formData.propertyArea,
            areaUnit: formData.areaUnit
          },
          purpose: 'installation of Fence'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit fencing permit request');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Your fencing permit request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        fullName: '',
        residentAddress: '',
        propertyLocation: '',
        taxDeclarationNumber: '',
        propertyIdentificationNumber: '',
        propertyArea: '',
        areaUnit: 'square_meters',
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting fencing permit request:', error);
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
          Request Fencing Permit
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              About This Document
            </Typography>
            <Typography variant="body2">
              This permit allows you to install a fence on your property within the barangay. 
              The document verifies your ownership of the property and grants permission for fence installation.
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
                    placeholder="e.g., Mylen S. Billena"
                    helperText="Your complete name with middle initial if applicable"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Residential Address"
                    name="residentAddress"
                    value={formData.residentAddress}
                    onChange={handleChange}
                    placeholder="e.g., 1848 Hillside Village, Tuntungin, Los Baños, Laguna"
                    helperText="Your current residential address"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Property Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Property Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Property Location in Barangay Maahas"
                    name="propertyLocation"
                    value={formData.propertyLocation}
                    onChange={handleChange}
                    placeholder="e.g., Anestville, Purok 4"
                    helperText="Specific location within Barangay Maahas, Los Baños, Laguna"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Tax Declaration Number"
                    name="taxDeclarationNumber"
                    value={formData.taxDeclarationNumber}
                    onChange={handleChange}
                    placeholder="e.g., 11-0008-05359"
                    helperText="Tax Declaration Number of the property"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Property Identification Number"
                    name="propertyIdentificationNumber"
                    value={formData.propertyIdentificationNumber}
                    onChange={handleChange}
                    placeholder="e.g., 923-11-0008-016-20"
                    helperText="PIN of the property"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Property Area"
                    name="propertyArea"
                    type="number"
                    value={formData.propertyArea}
                    onChange={handleChange}
                    placeholder="e.g., 170"
                    helperText="Size of the property"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="area-unit-label">Area Unit</InputLabel>
                    <Select
                      labelId="area-unit-label"
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleChange}
                      label="Area Unit"
                    >
                      <MenuItem value="square_meters">Square Meters</MenuItem>
                      <MenuItem value="square_feet">Square Feet</MenuItem>
                      <MenuItem value="hectares">Hectares</MenuItem>
                    </Select>
                  </FormControl>
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

export default RequestFencing;
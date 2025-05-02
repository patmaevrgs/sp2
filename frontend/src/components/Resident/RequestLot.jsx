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

function RequestLot() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Property details
    tdNumber: '',
    surveyNumber: '',
    lotArea: '',
    areaUnit: 'square_meters',
    lotLocation: '',

    // Owner details
    fullName: '',
    ownerAddress: '',
    
    // Additional details
    purpose: '',
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
          documentType: 'lot_ownership',
          formData: {
            tdNumber: formData.tdNumber,
            surveyNumber: formData.surveyNumber,
            lotArea: formData.lotArea,
            areaUnit: formData.areaUnit,
            lotLocation: formData.lotLocation,
            fullName: formData.fullName,
            ownerAddress: formData.ownerAddress
          },
          purpose: formData.purpose
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit lot ownership request');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Your lot ownership certification request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        tdNumber: '',
        surveyNumber: '',
        lotArea: '',
        areaUnit: 'square_meters',
        lotLocation: '',
        fullName: '',
        ownerAddress: '',
        purpose: ''
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting lot ownership request:', error);
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
          Request Lot Ownership Certification
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              About This Document
            </Typography>
            <Typography variant="body2">
              This certification verifies lot ownership details based on records presented to the Barangay. 
              The document will certify that the specified lot is registered in the name provided and is 
              free from legal impediments or tenancy issues.
            </Typography>
          </CardContent>
        </Card>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Property Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="TD Number"
                name="tdNumber"
                value={formData.tdNumber}
                onChange={handleChange}
                placeholder="e.g., 11 0008 0454"
                helperText="Tax Declaration Number"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Survey Number"
                name="surveyNumber"
                value={formData.surveyNumber}
                onChange={handleChange}
                placeholder="e.g., 4975(CAD-450)"
                helperText="Property Survey Number"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Lot Area"
                name="lotArea"
                type="number"
                value={formData.lotArea}
                onChange={handleChange}
                placeholder="e.g., 79"
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
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Property Location"
                name="lotLocation"
                value={formData.lotLocation}
                onChange={handleChange}
                placeholder="e.g., Purok 4"
                helperText="Location within Barangay Maahas, Los Baños, Laguna"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Owner Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Owner Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g., JUAN M. DELA CRUZ"
                helperText="Full name of the registered owner (preferably in UPPERCASE)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Owner Address"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleChange}
                placeholder="e.g., Brgy. Anos, Los Baños, Laguna"
                helperText="Complete address of the registered owner"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Purpose
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="e.g., For bank loan application"
                helperText="Please specify the purpose for requesting this certification"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
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
            </Grid>
          </Grid>
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

export default RequestLot;
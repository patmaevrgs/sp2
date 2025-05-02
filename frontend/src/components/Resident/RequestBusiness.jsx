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

function RequestBusiness() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Business details
    businessName: '',
    businessAddress: '',
    lineOfBusiness: '',
    businessStatus: 'NEW' // Default to NEW, admin can change to RENEW if needed
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
          documentType: 'business_clearance',
          formData: {
            businessName: formData.businessName.toUpperCase(),
            businessAddress: formData.businessAddress.toUpperCase(),
            lineOfBusiness: formData.lineOfBusiness.toUpperCase(),
            businessStatus: formData.businessStatus,
            // Default amount that admin can change later
            amount: '300.00'
          },
          purpose: 'Business Permit Application'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit business clearance request');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Your business clearance request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        businessName: '',
        businessAddress: '',
        lineOfBusiness: '',
        businessStatus: 'NEW'
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting business clearance request:', error);
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
          Request Business Clearance
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              About This Document
            </Typography>
            <Typography variant="body2">
              This clearance certifies that your business establishment conforms to the requirements 
              for operating within the Barangay. This document is required for business permit applications
              and renewals with the Municipal Business Permits and Licensing Office.
            </Typography>
          </CardContent>
        </Card>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Business Information Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Business Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g., ALPEREY ICE CREAM DISTRIBUTION"
                    helperText="Enter the complete registered name of your business (will be converted to uppercase)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Business Address"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="e.g., PUROK 1"
                    helperText="Specific location within Barangay Maahas, Los Baños, Laguna (will be converted to uppercase)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Line of Business"
                    name="lineOfBusiness"
                    value={formData.lineOfBusiness}
                    onChange={handleChange}
                    placeholder="e.g., ICE CREAM DISTRIBUTION"
                    helperText="Type of business or primary products/services (will be converted to uppercase)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="business-status-label">Business Status</InputLabel>
                    <Select
                      labelId="business-status-label"
                      name="businessStatus"
                      value={formData.businessStatus}
                      onChange={handleChange}
                      label="Business Status"
                    >
                      <MenuItem value="NEW">NEW</MenuItem>
                      <MenuItem value="RENEW">RENEW</MenuItem>
                    </Select>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      Select NEW if this is a new business, or RENEW if you're renewing an existing business clearance
                    </Typography>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Fee Information */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Fee Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                The standard fee for Business Clearance is ₱300.00. 
                Payment will be processed upon approval of your request.
              </Typography>
              
              <Typography variant="body2">
                Note: The barangay administration may adjust the final amount based on business 
                category, size, or other factors as per local regulations.
              </Typography>
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

export default RequestBusiness;
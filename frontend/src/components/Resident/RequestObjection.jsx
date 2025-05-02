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

function RequestObjection() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Personal details
    fullName: '',
    address: '',
    
    // Certificate details
    objectType: 'tree_cutting',
    objectDetails: '',
    quantity: '',
    additionalInfo: ''
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
          documentType: 'no_objection_certificate',
          formData: {
            fullName: formData.fullName.toUpperCase(),
            address: formData.address,
            objectType: formData.objectType,
            objectDetails: formData.objectDetails,
            quantity: formData.quantity,
            additionalInfo: formData.additionalInfo
          },
          purpose: getFormattedPurpose()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit No Objection Certificate request');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Your No Objection Certificate request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        fullName: '',
        address: '',
        objectType: 'tree_cutting',
        objectDetails: '',
        quantity: '',
        additionalInfo: ''
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting No Objection Certificate request:', error);
      setSnackbar({
        open: true,
        message: `Failed to submit request: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get formatted purpose text based on object type
  const getFormattedPurpose = () => {
    switch (formData.objectType) {
      case 'tree_cutting':
        return `will cut ${formData.quantity} ${formData.objectDetails}. This office has no objection for the said cutting of the tree as part of requirements of PENRO Los Baños, Laguna.`;
      case 'construction':
        return `will conduct construction of ${formData.objectDetails}${formData.quantity ? ' (' + formData.quantity + ')' : ''}. This office has no objection for the said construction as part of local permitting requirements.`;
      case 'event':
        return `will organize ${formData.objectDetails}${formData.quantity ? ' for ' + formData.quantity + ' participants' : ''}. This office has no objection for the said event as part of permit application requirements.`;
      case 'business':
        return `will operate ${formData.objectDetails}${formData.quantity ? ' with capacity of ' + formData.quantity : ''}. This office has no objection for the said business operation as part of permit application requirements.`;
      case 'other':
        return formData.additionalInfo || 'will proceed with the stated activity. This office has no objection as part of local permitting requirements.';
      default:
        return 'will proceed with the stated activity. This office has no objection as part of local permitting requirements.';
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
          Request No Objection Certificate
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              About This Document
            </Typography>
            <Typography variant="body2">
              This certificate confirms that the Barangay has no objection to a specific activity or action 
              you plan to undertake within its jurisdiction. This is commonly required for tree cutting permits, 
              construction approvals, event permits, or business operations within the Barangay.
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
                    placeholder="e.g., Raulito M. Calizo"
                    helperText="Your complete name with middle initial if applicable (will be converted to uppercase)"
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
                    placeholder="e.g., Sitio Ibaba"
                    helperText="Your specific location within Barangay Maahas, Los Baños, Laguna"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Certificate Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Certificate Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="object-type-label">Type of Activity</InputLabel>
                    <Select
                      labelId="object-type-label"
                      name="objectType"
                      value={formData.objectType}
                      onChange={handleChange}
                      label="Type of Activity"
                    >
                      <MenuItem value="tree_cutting">Tree Cutting</MenuItem>
                      <MenuItem value="construction">Construction</MenuItem>
                      <MenuItem value="event">Event/Gathering</MenuItem>
                      <MenuItem value="business">Business Operation</MenuItem>
                      <MenuItem value="other">Other Activity</MenuItem>
                    </Select>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      Select the type of activity for which you need the No Objection Certificate
                    </Typography>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label={formData.objectType === 'tree_cutting' ? "Tree Type/Species" : "Details of Activity"}
                    name="objectDetails"
                    value={formData.objectDetails}
                    onChange={handleChange}
                    placeholder={formData.objectType === 'tree_cutting' ? "e.g., Mahogany Tree" : "e.g., Residential Building"}
                    helperText={formData.objectType === 'tree_cutting' ? "Specify the type of tree to be cut" : "Provide specific details about the activity"}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label={formData.objectType === 'tree_cutting' ? "Number of Trees" : "Quantity/Size/Capacity"}
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder={formData.objectType === 'tree_cutting' ? "e.g., 1" : "e.g., 150 sqm"}
                    helperText={formData.objectType === 'tree_cutting' ? "Number of trees to be cut" : "Relevant quantity, size, or capacity information"}
                  />
                </Grid>
                
                {formData.objectType === 'other' && (
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Additional Information"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="e.g., will install solar panels on the roof of my house..."
                      helperText="Please provide a detailed description of the activity requiring a No Objection Certificate"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          
          {/* Preview Section */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f9f9f9' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Certificate Preview
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                {`This is to further certify that ${formData.fullName ? formData.fullName.toUpperCase() : '[YOUR NAME]'}, ${getFormattedPurpose()}`}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                This is how your certificate will be formatted. Please review the details before submitting.
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

export default RequestObjection;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

// Resident type options
const residentTypes = ['Minor', '18-30', 'Illiterate', 'PWD', 'Senior Citizen', 'Indigent'];

function ResidentRegistration() {
  // State variables
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    precinctLevel: '',
    contactNumber: '',
    email: '',
    types: [],
    isVoter: false
  });
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [successDialog, setSuccessDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check for duplicates on name changes
    if (name === 'firstName' || name === 'lastName') {
      checkForDuplicates({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle types selection change
  const handleTypesChange = (e) => {
    setFormData({
      ...formData,
      types: e.target.value
    });
  };

  const checkForDuplicates = async (data) => {
    if (!data.firstName || !data.lastName) return;
    
    try {
      const response = await fetch(`http://localhost:3002/residents/check-duplicate?firstName=${encodeURIComponent(data.firstName)}&lastName=${encodeURIComponent(data.lastName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Add this for cookies
      });
  
      const result = await response.json();
      
      if (result.success && result.hasDuplicates) {
        setDuplicateWarning(result.duplicates);
      } else {
        setDuplicateWarning(null);
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }
  };

  // Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.address) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3002/residents/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // This is important for sending cookies
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
      
      if (data.success) {
        setSuccessDialog(true);
        // Reset form
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          address: '',
          precinctLevel: '',
          contactNumber: '',
          email: '',
          types: [],
          isVoter: false
        });
        setDuplicateWarning(null);
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting registration request',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Barangay Maahas Resident Registration
        </Typography>
        
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
          Register your information in the Barangay Maahas resident database to ensure fast access to services 
          and stay updated on future community benefits and programs.
        </Typography>

        {duplicateWarning && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You may already be registered in our database. Please check with the barangay office if you're unsure.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Complete Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                variant="outlined"
                placeholder="House #, Street, Barangay Maahas, Los Baños, Laguna"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precinct Level (if known)"
                name="precinctLevel"
                value={formData.precinctLevel}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="types-select-label">Resident Categories</InputLabel>
                <Select
                  labelId="types-select-label"
                  multiple
                  value={formData.types}
                  onChange={handleTypesChange}
                  input={<OutlinedInput label="Resident Categories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {residentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isVoter}
                    onChange={handleCheckboxChange}
                    name="isVoter"
                    color="primary"
                  />
                }
                label="I am a registered voter in Barangay Maahas"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  mt: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem'
                }}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
          Registration Submitted Successfully
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your registration request has been submitted to the Barangay Maahas administration.
            Your information will be reviewed and verified by a barangay staff member.
            You will be able to access all services once your registration is approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ResidentRegistration;
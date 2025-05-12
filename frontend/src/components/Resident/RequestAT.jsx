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
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import AlertTitle from '@mui/material/AlertTitle';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';

function RequestAssistance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
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
    
    // Open confirmation dialog instead of submitting directly
    setOpenConfirmDialog(true);
  };

  // Add a new function for confirmation submission
  const confirmSubmit = async () => {
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
        // Close confirmation dialog
        setOpenConfirmDialog(false);
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
  <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Request for Assistance
      </Typography>
      <Box sx={{ mb: 4 }} />
      
      {/* Main Form Paper */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
        {/* Form Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <VolunteerActivismIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Assistance Request Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting assistance from the Barangay and Municipal Government of Los Baños. Depending on your 
            situation and eligibility, you may qualify for financial, medical, burial, educational, or other forms of assistance.
            All requests are subject to verification and approval by the appropriate authorities.
          </Typography>
        </Alert>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
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
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
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
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
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
                  helperText={formErrors.yearsOfStay || "How long you have lived in Barangay Maahas"}
                  inputProps={{ min: 0 }}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={!!formErrors.marginGroupType} 
                  required
                  size="small"
                >
                  <InputLabel id="marginalized-group-label">Marginalized Group</InputLabel>
                  <Select
                    labelId="marginalized-group-label"
                    name="marginGroupType"
                    value={formData.marginGroupType}
                    label="Marginalized Group"
                    onChange={handleInputChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <GroupIcon fontSize="small" />
                      </InputAdornment>
                    }
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
                  {!formErrors.marginGroupType && (
                    <FormHelperText>Select the category that best describes your situation</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          {/* Assistance Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Assistance Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1 
                }}>
                  <PersonPinCircleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <FormLabel 
                    component="legend" 
                    required 
                    sx={{ 
                      color: 'text.primary', 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: 'text.primary'
                      }
                    }}
                  >
                    Request for:
                  </FormLabel>
                </Box>
                <RadioGroup
                  row
                  name="isSelf"
                  value={formData.isSelf.toString()}
                  onChange={handleInputChange}
                  sx={{ ml: 4 }}
                >
                  <FormControlLabel value="true" control={<Radio size="small" />} label="Myself" />
                  <FormControlLabel value="false" control={<Radio size="small" />} label="Someone else" />
                </RadioGroup>
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
                      helperText={formErrors.beneficiaryName || "Full name of the person who will receive assistance"}
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
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
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FamilyRestroomIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={!!formErrors.assistanceType} 
                  required
                  size="small"
                >
                  <InputLabel id="assistance-type-label">Type of Assistance</InputLabel>
                  <Select
                    labelId="assistance-type-label"
                    name="assistanceType"
                    value={formData.assistanceType}
                    label="Type of Assistance"
                    onChange={handleInputChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <HelpIcon fontSize="small" />
                      </InputAdornment>
                    }
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
                  {!formErrors.assistanceType && (
                    <FormHelperText>Select the type of assistance you are requesting</FormHelperText>
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
                    helperText={formErrors.otherAssistanceType || "Please describe the specific assistance you need"}
                    required
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoreHorizIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          
          {/* Required Documents */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Required Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start', fontWeight: 500 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 20, mt: 0.3 }} />
                Please bring the following documents when following up on your request:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 0, mt: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Valid ID (original and photocopy)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Barangay Residency Certificate
                </Typography>
                
                {formData.assistanceType === 'financial' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Certificate of Indigency
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Supporting documents showing financial need
                    </Typography>
                  </>
                )}
                
                {formData.assistanceType === 'medical' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Medical certificate or prescription (dated within the last 3 months)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Hospital bills or quotation for medical procedures
                    </Typography>
                  </>
                )}
                
                {formData.assistanceType === 'burial' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Death certificate
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Funeral home bill or quotation
                    </Typography>
                  </>
                )}
                
                {formData.assistanceType === 'educational' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Proof of enrollment or admission
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      School assessment or tuition fee structure
                    </Typography>
                  </>
                )}
                
                <Typography component="li" variant="body2">
                  Authorization letter (if the requestor is not the beneficiary)
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Terms & Conditions */}
          <Alert 
            severity="warning" 
            variant="outlined" 
            sx={{ mb: 3 }}
          >
            <AlertTitle>Important</AlertTitle>
            <Typography variant="body2">
              By submitting this form, you confirm that:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, fontSize: '0.8rem' }}>
              <Typography component="li" variant="body2">
                All information provided is accurate and complete to the best of your knowledge
              </Typography>
              <Typography component="li" variant="body2">
                You understand that providing false information may lead to rejection of your request and may be subject to penalties under applicable laws
              </Typography>
              <Typography component="li" variant="body2">
                You will provide all required documents when requested to verify your eligibility
              </Typography>
              <Typography component="li" variant="body2">
                You consent to the verification of the information provided in this form
              </Typography>
            </Box>
          </Alert>
          
          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => {
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
                setFormErrors({});
              }}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* About Assistance Programs */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <InfoIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            About Assistance Programs
          </Typography>
        </Box>
        
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <DescriptionIcon color="primary" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Available Assistance Programs
                </Typography>
                <Typography variant="body2" paragraph>
                  The Barangay and Municipal Government offer various forms of assistance to qualified residents who are in need.
                </Typography>
                <Typography variant="body2">
                  Assistance programs include:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Financial Assistance - Emergency cash assistance for valid urgent needs</Typography>
                  <Typography component="li" variant="body2">Medical Assistance - Help with medical bills, medicines, and treatments</Typography>
                  <Typography component="li" variant="body2">Burial Assistance - Financial support for funeral expenses</Typography>
                  <Typography component="li" variant="body2">Educational Assistance - Help with tuition fees and school supplies</Typography>
                  <Typography component="li" variant="body2">Food Assistance - Food packs during emergencies or for indigent families</Typography>
                  <Typography component="li" variant="body2">Housing Assistance - Help with repairs or temporary shelter</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              mt: 0, 
              p: 0, 
              bgcolor: 'info.lighter', 
              borderRadius: 1, 
              display: 'flex', 
              alignItems: 'flex-start' 
            }}>
              <AccessTimeIcon color="info" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2">
                  Processing Time
                </Typography>
                <Typography variant="body2">
                  The processing time for assistance requests varies depending on the type of assistance and available resources. 
                  Generally, urgent requests are processed within 3-5 working days, while non-urgent requests may take up to 2 weeks.
                  You will be notified of the status of your request through the contact information you provided.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {/* Frequently Asked Questions */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <HelpIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Frequently Asked Questions
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Who is eligible for assistance?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Eligibility depends on the type of assistance being requested. Generally, priority is given to residents who belong 
                  to marginalized sectors such as senior citizens, persons with disabilities, single parents, and low-income families. 
                  Residency in Barangay Maahas is a basic requirement, and you may be asked to provide proof of residency.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How much financial assistance can I receive?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The amount of financial assistance varies depending on the nature of your need, your financial situation, and the 
                  available budget of the Barangay and Municipal Government. The social welfare officer will assess your case and 
                  determine the appropriate amount based on established guidelines.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can I apply for multiple types of assistance?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, you can apply for different types of assistance if you have multiple needs. However, each request will be 
                  evaluated separately, and approval will depend on your eligibility for each type of assistance and the available 
                  resources. There may also be limitations on how frequently you can receive certain types of assistance.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What happens after I submit my request?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  After submitting your request, it will be reviewed by the Barangay staff and forwarded to the appropriate 
                  department or agency. You may be contacted for additional information or documents. A social welfare officer 
                  may conduct a home visit to verify your situation. Once your request is approved, you will be notified about 
                  when and where to claim the assistance.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VolunteerActivismIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Assistance Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Request for Assistance:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Personal Information</Typography>
                <Typography variant="body2">Name: {formData.fullName}</Typography>
                <Typography variant="body2">Address: {formData.address}, Barangay Maahas, Los Baños, Laguna</Typography>
                <Typography variant="body2">Years of Residency: {formData.yearsOfStay}</Typography>
                <Typography variant="body2">
                  Marginalized Group: {
                    marginalizedGroups.find(group => group.value === formData.marginGroupType)?.label || formData.marginGroupType
                  }
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Assistance Details</Typography>
                <Typography variant="body2">
                  Requesting for: {formData.isSelf ? 'Myself' : `${formData.beneficiaryName} (${formData.beneficiaryRelation})`}
                </Typography>
                <Typography variant="body2">
                  Assistance Type: {
                    formData.assistanceType === 'other' 
                      ? formData.otherAssistanceType 
                      : assistanceTypes.find(type => type.value === formData.assistanceType)?.label || formData.assistanceType
                  }
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Important Reminders:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <Typography component="li" variant="body2">
                All information provided must be accurate and truthful
              </Typography>
              <Typography component="li" variant="body2">
                You will need to bring supporting documents when following up on your request
              </Typography>
              <Typography component="li" variant="body2">
                The approval of your request is subject to verification and availability of resources
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenConfirmDialog(false)} 
            variant="outlined"
            size="small"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmSubmit} 
            color="primary" 
            variant="contained"
            size="small"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Confirm & Submit
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </Box>
  </Container>
);
}

export default RequestAssistance;
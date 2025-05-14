import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  TextField,
  Divider,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Facebook as FacebookIcon,
  Send as SendIcon,
  ContactMail as ContactMailIcon,
  ContactPhone as ContactPhoneIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';

function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitStatus('loading');
      
      try {
        const response = await fetch('http://localhost:3002/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmitStatus('success');
          setSnackbarOpen(true);
          
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          });
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setSubmitStatus('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Simple Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ContactPhoneIcon sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
          Contact Barangay Maahas
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 3,
            maxWidth: '90%',
          }}
        >
          Get in touch with Barangay Maahas through any of our contact channels. We're here to assist you with your inquiries and concerns.
        </Typography>
      </Box>

      {/* Contact Information and Form Grid */}
      <Grid container spacing={3}>
        {/* Contact Information Column */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 1, 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                pb: 1,
                mb: 3,
                fontSize: '1.1rem'
              }}
            >
              <ContactPhoneIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              Contact Information
            </Typography>

            {/* Contact Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Phone */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    color: 'primary.main', 
                    width: 36, 
                    height: 36, 
                    mr: 2 
                  }}
                >
                  <PhoneIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>
                    Phone
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href="tel:+6349-536-XXXX"
                    sx={{ 
                      display: 'block',
                      color: 'primary.main', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    (049) 536-XXXX
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href="tel:+639XXXXXXXXX"
                    sx={{ 
                      display: 'block',
                      color: 'primary.main', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    +63 9XX XXX XXXX (Mobile)
                  </Typography>
                </Box>
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    color: 'primary.main', 
                    width: 36, 
                    height: 36, 
                    mr: 2 
                  }}
                >
                  <EmailIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>
                    Email
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href="mailto:brgy.maahas@gmail.com"
                    sx={{ 
                      display: 'block',
                      color: 'primary.main', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    brgy.maahas@gmail.com
                  </Typography>
                </Box>
              </Box>

              {/* Address */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    color: 'primary.main', 
                    width: 36, 
                    height: 36, 
                    mr: 2 
                  }}
                >
                  <LocationOnIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>
                    Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    Barangay Maahas Hall,<br />
                    Brgy. Maahas, Los Baños<br />
                    Laguna 4030, Philippines
                  </Typography>
                </Box>
              </Box>

              {/* Office Hours */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    color: 'primary.main', 
                    width: 36, 
                    height: 36, 
                    mr: 2 
                  }}
                >
                  <AccessTimeIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>
                    Office Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    Monday - Friday: 8:00 AM - 5:00 PM<br />
                    Saturday: 8:00 AM - 12:00 PM<br />
                    Sunday & Holidays: Closed
                  </Typography>
                </Box>
              </Box>

              {/* Social Media */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    color: 'primary.main', 
                    width: 36, 
                    height: 36, 
                    mr: 2 
                  }}
                >
                  <FacebookIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>
                    Social Media
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href="https://www.facebook.com/barangaymaahas" 
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <FacebookIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Barangay Maahas Official
                  </Typography>
                </Box>
              </Box>
              
              {/* Emergency Contacts */}
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha('#f44336', 0.1), 
                    color: 'error.main', 
                    width: 36, 
                    height: 36, 
                    mr: 2 
                  }}
                >
                  <ErrorOutlineIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem', color: 'error.main' }}>
                    Emergency Contacts
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                    For emergencies requiring immediate assistance:
                  </Typography>
                  
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PhoneIcon fontSize="inherit" sx={{ mr: 0.5, color: 'error.main' }} />
                    Barangay Emergency: 
                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      +63 9XX XXX XXXX
                    </Box>
                  </Typography>
                  
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PhoneIcon fontSize="inherit" sx={{ mr: 0.5, color: 'error.main' }} />
                    Police Station: 
                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      (049) XXX-XXXX
                    </Box>
                  </Typography>
                  
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="inherit" sx={{ mr: 0.5, color: 'error.main' }} />
                    Fire Station: 
                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      (049) XXX-XXXX
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Form Column */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                pb: 1,
                mb: 3,
                fontSize: '1.1rem'
              }}
            >
              <ContactMailIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              Send Us a Message
            </Typography>
            
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
                fontSize: '0.85rem',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'flex-start'
              }}
            >
              <EmailIcon color="info" sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
              <Typography variant="body2">
                Your message will be sent to the Barangay Maahas email address. A copy will be forwarded to <b>pivargas2@up.edu.ph</b> for proper monitoring and handling.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth 
                    required
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mb: 2 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth 
                    required
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ mb: 2 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Phone Number (Optional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth 
                    variant="outlined"
                    sx={{ mb: 2 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    fullWidth 
                    required
                    variant="outlined"
                    error={!!errors.subject}
                    helperText={errors.subject}
                    sx={{ mb: 2 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    fullWidth 
                    required
                    variant="outlined"
                    multiline
                    rows={6}
                    error={!!errors.message}
                    helperText={errors.message}
                    sx={{ mb: 3 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitStatus === 'loading'}
                    startIcon={submitStatus === 'loading' ? <CircularProgress size={16} /> : <SendIcon />}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 500,
                      textTransform: 'none',
                      py: 1
                    }}
                    size="medium"
                  >
                    {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            
            <Box 
              sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                All fields marked with * are required
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                Response time: Usually within 1-2 business days
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for form submission feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={submitStatus === 'success' ? 'success' : 'error'} 
          sx={{ width: '100%' }}
        >
          {submitStatus === 'success' ? 
            "Your message has been sent successfully! We'll get back to you soon." :
            "Failed to send message. Please try again later."
          }
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Contact;
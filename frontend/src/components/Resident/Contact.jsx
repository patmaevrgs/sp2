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
  ContactPhone as ContactPhoneIcon
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import ExploreIcon from '@mui/icons-material/Explore';
import ErrorIcon from '@mui/icons-material/Error';


function Contact() {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate form submission
      setSubmitStatus('loading');
      
      setTimeout(() => {
        // Simulate successful submission
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
      }, 1500);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          border: '1px solid rgb(209, 208, 208)',
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: 'text.primary',
              lineHeight: 1.3,
            }}
          >
            Contact Barangay Maahas
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              lineHeight: 1.6,
              mb: 4,
              fontSize: '0.95rem',
            }}
          >
            Have questions about our services? Need assistance with a specific matter? Get in touch with Barangay Maahas through any of our contact channels. We're here to help!
          </Typography>
        </Box>
      </Paper>

      {/* Contact Information and Form Grid */}
      <Grid container spacing={4}>
        {/* Contact Information Column */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 1, height: '100%' }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: 'primary.grey',
                pb: 1,
                mb: 3
              }}
            >
              <ContactPhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              Contact Information
            </Typography>

            {/* Contact Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Phone */}
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PhoneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
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
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      +63 9XX XXX XXXX (Mobile)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Email */}
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <EmailIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
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
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      brgy.maahas@gmail.com
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Address */}
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <LocationOnIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Address
                    </Typography>
                    <Typography variant="body2">
                      Barangay Maahas Hall,<br />
                      Brgy. Maahas, Los Baños<br />
                      Laguna 4030, Philippines
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      component="a"
                      href="https://www.google.com/maps/dir/?api=1&destination=Barangay+Maahas+Los+Banos+Laguna"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        mt: 1,
                        textTransform: 'none',
                        p: 0
                      }}
                    >
                      Get Directions
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Office Hours
                    </Typography>
                    <Typography variant="body2">
                      Monday - Friday: 8:00 AM - 5:00 PM<br />
                      Saturday: 8:00 AM - 12:00 PM<br />
                      Sunday & Holidays: Closed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <FacebookIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
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
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      <FacebookIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Barangay Maahas Official
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Form Column */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 1 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: 'primary.grey',
                pb: 1,
                mb: 3
              }}
            >
              <ContactMailIcon sx={{ mr: 1, color: 'primary.main' }} />
              Send Us a Message
            </Typography>

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
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={submitStatus === 'loading'}
                    startIcon={submitStatus === 'loading' ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 500,
                      textTransform: 'none',
                      py: 1.5
                    }}
                  >
                    {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Map Section */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 1 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '2px solid',
            borderColor: 'primary.grey',
            pb: 1,
            mb: 3
          }}
        >
          <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
          Barangay Location
        </Typography>
        
        <Box sx={{ width: '100%', height: '400px', mt: 2 }}>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://maps.google.com/maps?q=14.1766,121.2566&z=15&output=embed"
            title="Barangay Maahas Map"
          ></iframe>
        </Box>
        
        <Box 
          sx={{ 
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2">
            <LocationOnIcon color="primary" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            Coordinates: 14.1766, 121.2566
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<ExploreIcon />}
            component="a"
            href="https://www.google.com/maps/dir/?api=1&destination=14.1766,121.2566"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              textTransform: 'none'
            }}
          >
            Get Directions
          </Button>
        </Box>
      </Paper>

      {/* Emergency Contact Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 4, 
          mb: 4,
          borderRadius: 1,
          backgroundColor: alpha('#f44336', 0.05),
          borderLeft: '4px solid',
          borderColor: 'error.main'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
          Emergency Contact Information
        </Typography>
        <Typography variant="body2" paragraph>
          For emergencies requiring immediate assistance, please contact:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon color="error" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Barangay Emergency Hotline:
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              component="a" 
              href="tel:+639XXXXXXXXX"
              sx={{ 
                ml: 3, 
                display: 'block',
                color: 'error.main', 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              +63 9XX XXX XXXX
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon color="error" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Police Station:
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              component="a" 
              href="tel:+63049XXXXXX"
              sx={{ 
                ml: 3, 
                display: 'block',
                color: 'error.main', 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              (049) XXX-XXXX
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon color="error" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Fire Station:
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              component="a" 
              href="tel:+63049XXXXXX"
              sx={{ 
                ml: 3, 
                display: 'block',
                color: 'error.main', 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              (049) XXX-XXXX
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar for form submission feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Your message has been sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Contact;
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Explore as ExploreIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  ImportContacts as ImportContactsIcon,
  HowToReg as HowToRegIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  LocalHospital as LocalHospitalIcon,
  SportsBasketball as SportsCenterIcon,
  Construction as ConstructionIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

function Services() {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
            Barangay Maahas Services
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
            Welcome to the Barangay Maahas Services Portal. Our digital hub provides convenient access to various barangay services. Browse through the available services below and learn how to avail them.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              variant="contained"
              component={RouterLink}
              to="/signin"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                py: 1,
              }}
            >
              Login to Access Services
            </Button>

            <Button
              variant="outlined"
              component={RouterLink}
              to="/signup"
              sx={{
                color: 'primary.main',
                borderColor: 'primary.main',
                fontWeight: 500,
                textTransform: 'none',
                py: 1,
              }}
            >
              Register as Resident
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Services Overview Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '3px solid',
          borderColor: 'primary.grey',
          pb: 1,
          mb: 3
        }}
      >
        <ExploreIcon sx={{ mr: 1, color: 'primary.main' }} />
        Available Services
      </Typography>

      {/* Login Reminder Banner */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          display: 'flex',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Residents-Only Services
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: { xs: 2, sm: 0 } }}>
            Most services require resident verification. Please log in or register to access the full range of services offered by Barangay Maahas.
          </Typography>
        </Box>
        <Button
          variant="contained"
          component={RouterLink}
          to="/signin"
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            py: 1,
            px: 3,
          }}
        >
          Sign In
        </Button>
      </Paper>
      {/* Service Categories */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Document Request Forms */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 1,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <ImportContactsIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Document Request Forms
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Request official documents from the barangay office. Available documents include:
            </Typography>
            <List dense sx={{ mb: 2 }}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Barangay Clearance" 
                  secondary="Required for employment, scholarship applications, etc."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Certificate of Residency" 
                  secondary="Proof that you are a resident of Barangay Maahas"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Business Permit" 
                  secondary="For establishing businesses within the barangay"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Certificate of Indigency" 
                  secondary="For availing government assistance programs"
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={RouterLink}
                to="/signin"
                variant="outlined"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Request Documents
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Ambulance Booking */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 1,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
                <LocalHospitalIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Ambulance Booking
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Barangay Maahas provides an ambulance service for emergency medical transport. This service is available 24/7 for residents.
            </Typography>
            <List dense sx={{ mb: 2 }}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Emergency Transport" 
                  secondary="For urgent medical situations requiring immediate transport"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Scheduled Medical Transport" 
                  secondary="For non-emergency medical appointments (subject to availability)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Priority for Residents" 
                  secondary="Verified residents receive priority service"
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/signin"
                variant="outlined"
                color="error"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Book Ambulance
              </Button>
              <Button
                component="a"
                href="tel:+63XXXXXXXXXX"
                variant="contained"
                color="error"
                startIcon={<PhoneIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Emergency Call
              </Button>
            </Box>
          </Paper>
        </Grid>
        {/* Court Reservation */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 1,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                <SportsCenterIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Court Reservation
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Reserve the barangay basketball court or multi-purpose court for community events, sports activities, or private gatherings.
            </Typography>
            <List dense sx={{ mb: 2 }}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Basketball Court" 
                  secondary="Regulation-sized covered court available for sports events"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Multi-purpose Area" 
                  secondary="Can be used for community gatherings, celebrations, etc."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Reservation Calendar" 
                  secondary="Check availability and schedule in advance"
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={RouterLink}
                to="/signin"
                variant="outlined"
                color="success"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Reserve Court
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Infrastructure Report */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 1,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                <ConstructionIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Infrastructure Report
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Report infrastructure issues within the barangay such as damaged roads, broken street lights, drainage problems, and more.
            </Typography>
            <List dense sx={{ mb: 2 }}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Road Damage" 
                  secondary="Report potholes, cracks, or other road-related issues"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Lighting Issues" 
                  secondary="Report broken street lights or areas needing illumination"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Drainage Problems" 
                  secondary="Report clogged drains, flooding areas, or water system issues"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArrowForwardIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Other Concerns" 
                  secondary="Report any public infrastructure that needs attention"
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={RouterLink}
                to="/signin"
                variant="outlined"
                color="warning"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Submit Report
              </Button>
            </Box>
          </Paper>
        </Grid>
        {/* Project Proposal */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 1,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                <LightbulbIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Project Proposal
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Submit proposals for community projects that can benefit Barangay Maahas. Residents can suggest improvements, community programs, or initiatives they'd like to see implemented.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ArrowForwardIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Community Development Projects" 
                      secondary="Proposals for improving community spaces or facilities"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ArrowForwardIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Environmental Initiatives" 
                      secondary="Proposals for tree planting, waste management, etc."
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ArrowForwardIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Social Programs" 
                      secondary="Proposals for education, health, or community welfare"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ArrowForwardIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Youth and Sports" 
                      secondary="Proposals for youth development or sports activities"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}>
                All proposals will be reviewed by the Barangay Council. Approved projects may receive support and resources for implementation.
              </Typography>
              <Button
                component={RouterLink}
                to="/signin"
                variant="outlined"
                sx={{ 
                  color: '#9c27b0',
                  borderColor: '#9c27b0',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#9c27b0',
                    backgroundColor: alpha('#9c27b0', 0.04)
                  }
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Submit Proposal
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Service Process Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '3px solid',
          borderColor: 'primary.grey',
          pb: 1,
          mb: 3
        }}
      >
        <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
        How to Access Services
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Service Request Process
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 50, 
                height: 50, 
                mb: 2 
              }}>
                <HowToRegIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Step 1: Register
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign up as a verified resident of Barangay Maahas
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 50, 
                height: 50, 
                mb: 2 
              }}>
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Step 2: Submit Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out and submit the appropriate service form
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 50, 
                height: 50, 
                mb: 2 
              }}>
                <VisibilityIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Step 3: Track Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor your request status through your account
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 50, 
                height: 50, 
                mb: 2 
              }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Step 4: Service Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive notification when your request is processed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {/* FAQ Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '3px solid',
          borderColor: 'primary.grey',
          pb: 1,
          mb: 3
        }}
      >
        <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
        Frequently Asked Questions
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 1 }}>
        <Accordion sx={{ mb: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              How long does it take to process document requests?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Document requests are typically processed within 1-3 business days, depending on the type of document and current volume of requests. Once processed, you will receive a notification through the system and can pick up your document at the Barangay Hall.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ mb: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Is there a fee for barangay services?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Most barangay documents have minimal processing fees as mandated by local ordinances. The exact fee will be indicated when you submit your request. Some services like ambulance booking for emergencies are provided free of charge to residents, while court reservations may have usage fees depending on the purpose and duration.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ mb: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              How can I verify my residency status?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              To verify your residency status, you need to register on the system and provide proof of residence such as utility bills, property documents, or rental agreements with your name and address within Barangay Maahas. The barangay staff will verify your documents before activating your account for full service access.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ mb: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Can non-residents use barangay services?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              While the services are primarily for residents of Barangay Maahas, certain services may be available to non-residents depending on the situation and service requested. For example, emergency ambulance services might be provided based on proximity and availability, but residents will receive priority.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            component={RouterLink}
            to="/faqs"
            variant="text"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            View All FAQs
          </Button>
        </Box>
      </Paper>

      {/* Contact Information */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Need Additional Help?
        </Typography>
        <Typography variant="body2" paragraph>
          If you have questions about services not covered above, please contact the Barangay Maahas office:
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mt: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            component="a"
            href="tel:+63XXXXXXXXXX"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Call Barangay Office
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            component="a"
            href="mailto:brgy.maahas@gmail.com"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Email Us
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            component={RouterLink}
            to="/contact"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Contact Page
          </Button>
        </Box>
      </Paper>

      {/* Registration Call to Action */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 1,
          background: 'linear-gradient(to right, #2196f3, #3f51b5)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Register as a Barangay Maahas Resident
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
          Join our digital community to access all services, receive important announcements, and participate in barangay programs. Your registration ensures you don't miss out on government benefits and assistance programs.
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/signup"
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            fontWeight: 600,
            textTransform: 'none',
            py: 1,
            px: 4,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
          size="large"
        >
          Register Now
        </Button>
      </Paper>
    </Container>
  );
}

export default Services;
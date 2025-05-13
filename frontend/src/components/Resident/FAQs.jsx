import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputBase,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import ConstructionIcon from '@mui/icons-material/Construction';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsIcon from '@mui/icons-material/Sports'; // or another valid one above
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';


function FAQs() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sample FAQ categories
  const categories = [
    { id: 'all', label: 'All FAQs', icon: <HelpIcon fontSize="small" /> },
    { id: 'documents', label: 'Document Requests', icon: <AssignmentIcon fontSize="small" /> },
    { id: 'ambulance', label: 'Ambulance Services', icon: <LocalHospitalIcon fontSize="small" /> },
    { id: 'court', label: 'Court Reservation', icon: <SportsIcon fontSize="small" /> },
    { id: 'infrastructure', label: 'Infrastructure Reports', icon: <ConstructionIcon fontSize="small" /> },
    { id: 'proposals', label: 'Project Proposals', icon: <LightbulbIcon fontSize="small" /> },
    { id: 'account', label: 'Account & Registration', icon: <PersonIcon fontSize="small" /> },
  ];

  // Sample FAQ data
  const faqData = [
    {
      id: 1,
      question: 'How do I register as a resident of Barangay Maahas?',
      answer: 'To register as a resident, you need to create an account on the B-Hub website and provide proof of residency such as a valid ID with your address, utility bills, or property documents. The barangay staff will verify your documents before approving your account.',
      category: 'account'
    },
    {
      id: 2,
      question: 'What documents can I request from the barangay?',
      answer: 'You can request various documents including Barangay Clearance, Certificate of Residency, Business Permit, Certificate of Indigency, Barangay ID, and more. Each document may have different requirements which will be specified when you make the request.',
      category: 'documents'
    },
    {
      id: 3,
      question: 'How long does it take to process document requests?',
      answer: 'Document requests are typically processed within 1-3 business days, depending on the type of document and current volume of requests. Once processed, you will receive a notification and can pick up your document at the Barangay Hall.',
      category: 'documents'
    },
    {
      id: 4,
      question: 'Is there a fee for barangay services?',
      answer: 'Most barangay documents have minimal processing fees as mandated by local ordinances. The exact fee will be indicated when you submit your request. Some services like ambulance booking for emergencies are provided free of charge to residents.',
      category: 'documents'
    },
    {
      id: 5,
      question: 'How can I book the barangay ambulance?',
      answer: 'Registered residents can book the ambulance service through the B-Hub portal. For emergencies, you can make an immediate request, or you can schedule a non-emergency medical transport in advance. The service is prioritized based on medical urgency.',
      category: 'ambulance'
    },
    {
      id: 6,
      question: 'What is the coverage area of the barangay ambulance?',
      answer: 'The barangay ambulance primarily serves residents within Barangay Maahas. However, it can transport patients to hospitals in Los Baños and neighboring municipalities depending on the medical situation and availability.',
      category: 'ambulance'
    },
    {
      id: 7,
      question: 'How do I reserve the barangay basketball court?',
      answer: 'Residents can reserve the basketball court through the B-Hub platform by selecting available dates and times. Reservations can be made up to 2 weeks in advance, and are subject to approval based on existing schedules and community activities.',
      category: 'court'
    },
    {
      id: 8,
      question: 'Can I report broken street lights or damaged roads?',
      answer: 'Yes, registered residents can submit infrastructure reports through the B-Hub platform. These reports are reviewed by the barangay and forwarded to the appropriate municipal department for action. You can track the status of your report through your account.',
      category: 'infrastructure'
    },
    {
      id: 9,
      question: 'What types of project proposals can I submit?',
      answer: 'Residents can submit proposals for community improvement projects, environmental initiatives, educational programs, health services, sports activities, and cultural events. Proposals should include objectives, target beneficiaries, and required resources.',
      category: 'proposals'
    },
    {
      id: 10,
      question: 'How are project proposals reviewed and approved?',
      answer: 'Project proposals are reviewed by the Barangay Council during their regular sessions. Criteria for approval include community benefit, feasibility, budget requirements, and alignment with barangay development plans. Proposers may be invited to present their ideas.',
      category: 'proposals'
    },
    {
      id: 11,
      question: 'What information do I need to provide when registering?',
      answer: 'When registering, you need to provide your full name, address within Barangay Maahas, contact information, valid ID, and proof of residency. Optional information includes household members, emergency contacts, and special needs for emergency situations.',
      category: 'account'
    },
    {
      id: 12,
      question: 'Can non-residents access barangay services?',
      answer: 'While most services are prioritized for residents, non-residents may access certain services with limitations. For example, document requests might require additional verification, and facility reservations may have different rates or availability constraints.',
      category: 'account'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter FAQs based on search term and active category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

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
            Frequently Asked Questions
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
            Find answers to common questions about Barangay Maahas services, procedures, and requirements. If you can't find what you're looking for, please contact the barangay office for assistance.
          </Typography>

          {/* Search Bar */}
          <Paper
            component="form"
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              maxWidth: 600,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search FAQs"
              inputProps={{ 'aria-label': 'search faqs' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <IconButton 
                sx={{ p: '10px' }} 
                aria-label="clear"
                onClick={() => setSearchTerm('')}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Paper>
        </Box>
      </Paper>

      {/* Categories and FAQs */}
      <Grid container spacing={3}>
        {/* Categories on larger screens */}
        <Grid 
          item 
          xs={12} 
          md={3}
          sx={{
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 1
            }}
          >
            <Typography 
              variant="subtitle1" 
              component="h2" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                pb: 1,
                borderBottom: '2px solid',
                borderColor: 'primary.grey',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
              Categories
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  startIcon={category.icon}
                  onClick={() => setActiveCategory(category.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    backgroundColor: activeCategory === category.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: activeCategory === category.id ? 'primary.main' : 'text.primary',
                    fontWeight: activeCategory === category.id ? 600 : 400,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Categories chips for mobile */}
        <Grid 
          item 
          xs={12}
          sx={{
            display: { xs: 'block', md: 'none' }
          }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3,
              borderRadius: 1
            }}
          >
            <Typography 
              variant="subtitle1" 
              component="h2" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
              Categories
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  onClick={() => setActiveCategory(category.id)}
                  color={activeCategory === category.id ? 'primary' : 'default'}
                  variant={activeCategory === category.id ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* FAQs Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, borderRadius: 1 }}>
            {/* Display active category title */}
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
              {activeCategory === 'all' ? (
                <>
                  <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
                  All Frequently Asked Questions
                </>
              ) : (
                <>
                  {categories.find(cat => cat.id === activeCategory)?.icon}
                  <Box component="span" sx={{ ml: 1 }}>
                    {categories.find(cat => cat.id === activeCategory)?.label}
                  </Box>
                </>
              )}
              {searchTerm && (
                <Box component="span" sx={{ ml: 2, fontSize: '1rem', fontWeight: 'normal' }}>
                  (Search results for: "{searchTerm}")
                </Box>
              )}
            </Typography>

            {/* No results message */}
            {filteredFAQs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  No matching FAQs found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or category selection
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  sx={{ mt: 2 }}
                >
                  Reset Filters
                </Button>
              </Box>
            )}

            {/* FAQ Accordions */}
            {filteredFAQs.map((faq) => (
              <Accordion 
                key={faq.id}
                sx={{ 
                  mb: 1, 
                  boxShadow: 'none', 
                  '&:before': { display: 'none' },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '4px !important',
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Still Have Questions Section */}
          <Paper 
            sx={{ 
              p: 3, 
              mt: 3, 
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Still Have Questions?
            </Typography>
            <Typography variant="body1" paragraph>
              If you couldn't find the answer to your question, please feel free to contact us directly.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/contact"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  py: 1,
                }}
              >
                Contact Us
              </Button>
              <Button
                variant="outlined"
                component="a"
                href="tel:+63XXXXXXXXXX"
                sx={{
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  fontWeight: 500,
                  textTransform: 'none',
                  py: 1,
                }}
              >
                Call Barangay Office
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default FAQs;
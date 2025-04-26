import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Help as HelpIcon
} from '@mui/icons-material';

function ResidentProposal() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    else if (!/^\d{10,11}$/.test(contactNumber.replace(/[^0-9]/g, ''))) {
      errors.contactNumber = 'Please enter a valid contact number';
    }
    
    if (!email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!projectTitle.trim()) errors.projectTitle = 'Project title is required';
    if (!description.trim()) errors.description = 'Project description is required';
    if (!file) errors.file = 'Project plan document is required';
    else {
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx'].includes(fileExt)) {
        errors.file = 'Only PDF or DOCX files are allowed';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // Clear any previous file error
      setFormErrors({
        ...formErrors,
        file: null
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('user');
      if (!userId) {
        throw new Error('You must be logged in to submit a proposal');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('userId', userId); // Add the user ID to the form data
      formData.append('fullName', fullName);
      formData.append('contactNumber', contactNumber);
      formData.append('email', email);
      formData.append('projectTitle', projectTitle);
      formData.append('description', description);
      formData.append('document', file);
      
      // Submit the proposal
      const response = await fetch('http://localhost:3002/proposals', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error submitting proposal');
      }
      
      // Reset form on success
      setFullName('');
      setContactNumber('');
      setEmail('');
      setProjectTitle('');
      setDescription('');
      setFile(null);
      setFileName('');
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your project proposal has been submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit your proposal. Please try again.',
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Project Proposal Submission
      </Typography>
      
      <Grid container spacing={4}>
        {/* Project Proposal Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Submit a Project Proposal
            </Typography>
            <Typography variant="body1" paragraph>
              Help improve Barangay Maahas by submitting your project proposals. Fill out the form below with the key details of your idea.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="contactNumber"
                    label="Contact Number"
                    name="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    error={!!formErrors.contactNumber}
                    helperText={formErrors.contactNumber}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="projectTitle"
                    label="Project Title"
                    name="projectTitle"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    error={!!formErrors.projectTitle}
                    helperText={formErrors.projectTitle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="description"
                    label="Project Description"
                    name="description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ p: 1.5, borderStyle: 'dashed' }}
                  >
                    Upload Project Plan Document
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {fileName && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {fileName}
                    </Typography>
                  )}
                  {formErrors.file && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {formErrors.file}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Please upload a PDF or DOCX file that contains all essential details about your proposal.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit Proposal'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {/* Submission Guidelines */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Submission Guidelines
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Clearly outline your proposal's purpose, objectives, and expected results for Barangay Maahas."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Add relevant details like budget estimate, project location, or timeline if applicable."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Upload your document in PDF or DOCX format, ensuring it is complete and well-organized."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Include any research, reference materials, or example projects that support your proposal."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Explain how your project benefits residents and addresses community needs."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* FAQs and Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Project Proposal Status
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                After submission, your proposal will undergo review by the Barangay Maahas administration. You can track the status of your submission in the Transactions page.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Review usually takes 7-14 days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  You'll receive updates via email
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* FAQs */}
          <Typography variant="h6" gutterBottom>
            Frequently Asked Questions
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>What kind of projects can I propose?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                You can propose various types of projects that benefit the community, such as:
                <ul>
                  <li>Infrastructure improvements (e.g., road repairs, drainage systems)</li>
                  <li>Community services and programs (e.g., health initiatives, educational workshops)</li>
                  <li>Environmental projects (e.g., waste management, tree planting)</li>
                  <li>Social and cultural events (e.g., community festivals, youth programs)</li>
                  <li>Public safety measures (e.g., streetlights, emergency response)</li>
                </ul>
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>How long does it take to process a proposal?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                The initial review process typically takes 7-14 business days. Complex proposals may require additional time for thorough evaluation. After initial review, proposals may be moved to different stages (in review, considered, approved, or rejected) depending on their feasibility and alignment with barangay priorities.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>What happens after I submit my proposal?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                After submission, your proposal will go through the following stages:
                <ol>
                  <li><strong>Initial Review:</strong> Basic verification of completeness</li>
                  <li><strong>Detailed Evaluation:</strong> Assessment of feasibility, budget, and impact</li>
                  <li><strong>Committee Review:</strong> Presentation to relevant barangay committees</li>
                  <li><strong>Feedback:</strong> You may be contacted for clarification or revisions</li>
                  <li><strong>Decision:</strong> Final approval, consideration for future implementation, or rejection with feedback</li>
                </ol>
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Do I need a detailed budget for my proposal?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                While a detailed budget is not strictly required for initial submission, proposals with well-researched cost estimates are more likely to receive serious consideration. You should include at least a general budget range and key cost components. If your proposal advances to later stages, you may be asked to provide more detailed financial information.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Can I submit multiple proposals?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Yes, you can submit multiple project proposals. However, we recommend focusing on quality rather than quantity. Each proposal should be well-thought-out and address distinct community needs. Consider submitting your strongest ideas first and waiting for feedback before submitting additional proposals.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      
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
  
export default ResidentProposal;
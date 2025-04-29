import React, { useState, useEffect } from 'react';
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
  useTheme,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Help as HelpIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  FilePresent as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';

function ResidentProposal() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [userId] = useState(localStorage.getItem('user'));
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // My Proposals state
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [openProposalDetails, setOpenProposalDetails] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // UI state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Load user's proposals
  useEffect(() => {
    if (userId) {
      fetchProposals();
    }
  }, [userId]);
  
  const fetchProposals = async () => {
    if (!userId) return;
    
    setProposalsLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/proposals?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.proposals || []);
      } else {
        throw new Error(data.message || 'Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load your proposals',
        severity: 'error'
      });
    } finally {
      setProposalsLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
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
      
      // Refresh proposals list
      fetchProposals();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your project proposal has been submitted successfully!',
        severity: 'success'
      });
      
      // Switch to My Proposals tab
      setTabValue(1);
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
  
  // View proposal details
  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setOpenProposalDetails(true);
  };
  
  // Cancel proposal
  const handleCancelProposal = (proposal) => {
    setSelectedProposal(proposal);
    setOpenCancelDialog(true);
  };
  
  // Confirm cancellation
  const confirmCancellation = async () => {
    if (!selectedProposal) return;
    
    setCancelLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002/proposals/${selectedProposal._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          cancellationReason
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel proposal');
      }
      
      // Close the dialog
      setOpenCancelDialog(false);
      setOpenProposalDetails(false);
      setCancellationReason('');
      
      // Refresh proposals list
      fetchProposals();
      
      setSnackbar({
        open: true,
        message: 'Your proposal has been cancelled successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error cancelling proposal:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to cancel your proposal',
        severity: 'error'
      });
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status chip for proposal
  const getStatusChip = (status) => {
    let color = 'default';
    let label = status;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'Pending';
        break;
      case 'in_review':
        color = 'info';
        label = 'In Review';
        break;
      case 'considered':
        color = 'primary';
        label = 'Considered';
        break;
      case 'approved':
        color = 'success';
        label = 'Approved';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      default:
        color = 'default';
        label = status.replace('_', ' ');
    }
    
    return <Chip size="small" label={label} color={color} />;
  };
  
  // Check if a proposal can be cancelled
  const canCancelProposal = (proposal) => {
    return !['approved', 'rejected'].includes(proposal.status);
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
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
        Project Proposal
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered={!isMobile}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
        >
          <Tab label="Submit Proposal" />
          <Tab label="My Proposals" />
        </Tabs>
      </Box>
      
      {/* Submit Proposal Tab */}
      {tabValue === 0 && (
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
      )}
      
      {/* My Proposals Tab */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">My Submitted Proposals</Typography>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchProposals}
              disabled={proposalsLoading}
            >
              Refresh
            </Button>
          </Box>
          
          {proposalsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : proposals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No proposals submitted yet
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Start by submitting your first project proposal using the form in the "Submit Proposal" tab.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => setTabValue(0)}
              >
                Submit a Proposal
              </Button>
            </Paper>
          ) : (
            <>
              {/* Desktop view: Table */}
              {!isMobile && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project Title</TableCell>
                        <TableCell>Service ID</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow key={proposal._id}>
                          <TableCell>{proposal.projectTitle}</TableCell>
                          <TableCell>{proposal.serviceId}</TableCell>
                          <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                          <TableCell>{getStatusChip(proposal.status)}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewProposal(proposal)}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                            {canCancelProposal(proposal) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelProposal(proposal)}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Mobile view: Cards */}
              {isMobile && (
                <Box>
                  {proposals.map((proposal) => (
                    <Card key={proposal._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {proposal.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Submitted: {formatDate(proposal.createdAt)}
                          </Typography>
                          {getStatusChip(proposal.status)}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewProposal(proposal)}
                          >
                            View
                          </Button>
                          {canCancelProposal(proposal) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleCancelProposal(proposal)}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      )}
      
      {/* Proposal Details Dialog */}
      <Dialog
        open={openProposalDetails}
        onClose={() => setOpenProposalDetails(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedProposal && (
          <>
            <DialogTitle>
              Project Proposal Details
              <IconButton
                aria-label="close"
                onClick={() => setOpenProposalDetails(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {selectedProposal.projectTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Service ID: {selectedProposal.serviceId || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getStatusChip(selectedProposal.status)}
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Submitter Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Name:</strong> {selectedProposal.fullName}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Contact Number:</strong> {selectedProposal.contactNumber}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Email:</strong> {selectedProposal.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Submission Details
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Date Submitted:</strong> {formatDate(selectedProposal.createdAt)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Last Updated:</strong> {formatDate(selectedProposal.updatedAt)}
                  </Typography>
                  {selectedProposal.status === 'in_review' && (
                    <Typography variant="body2" color="info.main" gutterBottom>
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Your proposal is being reviewed by the barangay committee
                    </Typography>
                  )}
                  {selectedProposal.status === 'considered' && (
                    <Typography variant="body2" color="primary.main" gutterBottom>
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Your proposal is being considered for implementation
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Project Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {selectedProposal.description}
                    </Typography>
                  </Paper>
                </Grid>
                
                {selectedProposal.adminComment && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Admin Comments
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                        {selectedProposal.adminComment}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Proposal Document
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<FileIcon />}
                    component="a"
                    href={`http://localhost:3002${selectedProposal.documentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document ({selectedProposal.documentFilename})
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Status Timeline
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">
                        <strong>Pending:</strong> Proposal submitted on {formatDate(selectedProposal.createdAt)}
                      </Typography>
                    </Box>
                    
                    {(selectedProposal.status === 'in_review' || 
                     selectedProposal.status === 'considered' || 
                     selectedProposal.status === 'approved' || 
                     selectedProposal.status === 'rejected') && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'info.main',
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">
                          <strong>In Review:</strong> Proposal under evaluation by the barangay
                        </Typography>
                      </Box>
                    )}
                    
                    {(selectedProposal.status === 'considered' || 
                     selectedProposal.status === 'approved' || 
                     selectedProposal.status === 'rejected') && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">
                          <strong>Considered:</strong> Proposal being considered for implementation
                        </Typography>
                      </Box>
                    )}
                    
                    {(selectedProposal.status === 'approved') && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">
                          <strong>Approved:</strong> Proposal has been approved for implementation
                        </Typography>
                      </Box>
                    )}
                    
                    {(selectedProposal.status === 'rejected') && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">
                          <strong>Rejected:</strong> Proposal has been declined
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {canCancelProposal(selectedProposal) && (
                <Button 
                  onClick={() => {
                    setOpenProposalDetails(false);
                    handleCancelProposal(selectedProposal);
                  }} 
                  color="error"
                  variant="contained"
                  sx={{ mr: 1 }}
                >
                  Cancel Proposal
                </Button>
              )}
              <Button onClick={() => setOpenProposalDetails(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Cancel Proposal Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => !cancelLoading && setOpenCancelDialog(false)}
      >
        <DialogTitle>Cancel Proposal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your proposal "{selectedProposal?.projectTitle}"? This action cannot be undone.
          </DialogContentText>
          <TextField
            margin="dense"
            id="cancellation-reason"
            label="Reason for cancellation (optional)"
            fullWidth
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            disabled={cancelLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} disabled={cancelLoading}>
            No, Keep Proposal
          </Button>
          <Button 
            onClick={confirmCancellation} 
            color="error" 
            disabled={cancelLoading}
          >
            {cancelLoading ? <CircularProgress size={24} /> : 'Yes, Cancel Proposal'}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
  
export default ResidentProposal;
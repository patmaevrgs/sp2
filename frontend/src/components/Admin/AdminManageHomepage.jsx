import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Photo as PhotoIcon
} from '@mui/icons-material';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`homepage-tabpanel-${index}`}
      aria-labelledby={`homepage-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminManageHomepage() {
  const [tabValue, setTabValue] = useState(0);
  const [homepageContent, setHomepageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Welcome Section State
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  
  // About Section State
  const [aboutText, setAboutText] = useState('');
  
  // Summary Data State
  const [summaryData, setSummaryData] = useState({
    type: '',
    islandGroup: '',
    region: '',
    province: '',
    municipality: '',
    postalCode: '',
    population: '',
    majorIsland: '',
    coordinates: '',
    elevation: ''
  });
  
  // Carousel Images State
  const [carouselImages, setCarouselImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [carouselCaptions, setCarouselCaptions] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  
  // Emergency Hotlines State
  const [emergencyHotlines, setEmergencyHotlines] = useState([]);
  const [newHotline, setNewHotline] = useState({ name: '', numbers: [''] });
  const [editingHotlineIndex, setEditingHotlineIndex] = useState(-1);
  
  // Map Coordinates State
  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 14.1766,
    longitude: 121.2566
  });
  
    // Officials State
    const [officials, setOfficials] = useState([]);
    const [newOfficial, setNewOfficial] = useState({ name: '', position: '', imageUrl: '' });
    const [editingOfficialIndex, setEditingOfficialIndex] = useState(-1);
    const [selectedOfficialImage, setSelectedOfficialImage] = useState(null);
    const [officialImagePreview, setOfficialImagePreview] = useState('');
    const [footerData, setFooterData] = useState({
        title: '',
        description: '',
        address: '',
        phone: '',
        email: ''
      });

  
  useEffect(() => {
    fetchHomepageContent();
  }, []);
  
  const fetchHomepageContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/homepage');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHomepageContent(data);
      
      // Set welcome section state
      setWelcomeTitle(data.welcomeTitle || '');
      setWelcomeText(data.welcomeText || '');
      
      // Set about section state
      setAboutText(data.aboutText || '');
      
      // Set summary data state
      setSummaryData(data.summaryData || {
        type: '',
        islandGroup: '',
        region: '',
        province: '',
        municipality: '',
        postalCode: '',
        population: '',
        majorIsland: '',
        coordinates: '',
        elevation: ''
      });
      
      // Set carousel images state
      setCarouselImages(data.carouselImages || []);
      
      // Set emergency hotlines state
      setEmergencyHotlines(data.emergencyHotlines || []);
      
      // Set map coordinates state
      setMapCoordinates(data.mapCoordinates || {
        latitude: 14.1766,
        longitude: 121.2566
      });
      
      // Set officials state
      setOfficials(data.officials || []);

      setFooterData(data.footerData || {
        title: 'BARANGAY MAAHAS',
        description: 'Your one-stop hub for essential barangay services and information. Stay updated with announcements, request forms, and connect with your local community.',
        address: 'Los Baños, Laguna, Philippines',
        phone: '+63 (049) 536-XXXX',
        email: 'contact@barangaymaahas.gov.ph'
      });
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      showAlert('Error fetching homepage content. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };
  
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  // ======== Welcome Section Handlers ========
  const saveWelcomeSection = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch('http://localhost:3002/homepage/welcome', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          welcomeTitle,
          welcomeText,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('Welcome section updated successfully!');
    } catch (error) {
      console.error('Error updating welcome section:', error);
      showAlert('Error updating welcome section. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Footer Data Handlers ========
const handleFooterDataChange = (e) => {
  const { name, value } = e.target;
  setFooterData(prev => ({
    ...prev,
    [name]: value
  }));
};

const saveFooterData = async () => {
  try {
    setSaving(true);
    const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
    
    const response = await fetch('http://localhost:3002/homepage/footer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        footerData,
        adminName
      }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    setHomepageContent(data);
    showAlert('Footer information updated successfully!');
  } catch (error) {
    console.error('Error updating footer information:', error);
    showAlert('Error updating footer information. Please try again.', 'error');
  } finally {
    setSaving(false);
  }
};

  // ======== About Section Handlers ========
  const saveAboutSection = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch('http://localhost:3002/homepage/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aboutText,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('About section updated successfully!');
    } catch (error) {
      console.error('Error updating about section:', error);
      showAlert('Error updating about section. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Summary Data Handlers ========
  const handleSummaryDataChange = (e) => {
    const { name, value } = e.target;
    setSummaryData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSummaryData = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch('http://localhost:3002/homepage/summary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryData,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('Summary data updated successfully!');
    } catch (error) {
      console.error('Error updating summary data:', error);
      showAlert('Error updating summary data. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Carousel Images Handlers ========
  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Create preview URLs
      const newFilePreviewUrls = files.map(file => URL.createObjectURL(file));
      setFilePreviewUrls(newFilePreviewUrls);
      
      // Initialize captions array
      setCarouselCaptions(Array(files.length).fill(''));
    }
  };
  
  const handleCaptionChange = (index, value) => {
    const newCaptions = [...carouselCaptions];
    newCaptions[index] = value;
    setCarouselCaptions(newCaptions);
  };
  
  const uploadCarouselImages = async (action = 'append') => {
    if (selectedFiles.length === 0) {
      showAlert('Please select files to upload', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      formData.append('captions', JSON.stringify(carouselCaptions));
      formData.append('adminName', adminName);
      formData.append('action', action);
      
      const response = await fetch('http://localhost:3002/homepage/carousel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      setCarouselImages(data.carouselImages || []);
      
      // Reset file selection state
      setSelectedFiles([]);
      setFilePreviewUrls([]);
      setCarouselCaptions([]);
      
      showAlert(`Carousel images ${action === 'replace' ? 'replaced' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error uploading carousel images:', error);
      showAlert('Error uploading carousel images. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteImageClick = (image) => {
    setImageToDelete(image);
    setOpenDeleteDialog(true);
  };
  
  const deleteCarouselImage = async () => {
    if (!imageToDelete) return;
    
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch('http://localhost:3002/homepage/carousel', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: imageToDelete._id,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      setCarouselImages(data.carouselImages || []);
      showAlert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting carousel image:', error);
      showAlert('Error deleting carousel image. Please try again.', 'error');
    } finally {
      setSaving(false);
      setOpenDeleteDialog(false);
      setImageToDelete(null);
    }
  };
  
  // ======== Emergency Hotlines Handlers ========
  const handleHotlineChange = (e, index) => {
    const { name, value } = e.target;
    const updatedHotline = { ...newHotline };
    
    if (name === 'numbers') {
      updatedHotline.numbers[index] = value;
    } else {
      updatedHotline[name] = value;
    }
    
    setNewHotline(updatedHotline);
  };

  const saveHotlinesToBackend = async (hotlinesToSave) => {
    try {
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      console.log("Saving hotlines to backend:", hotlinesToSave);
      
      const response = await fetch('http://localhost:3002/homepage/hotlines', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyHotlines: hotlinesToSave,
          adminName
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Save hotlines response:", data);
      setHomepageContent(data);
      
      return true;
    } catch (error) {
      console.error('Error saving hotlines to backend:', error);
      throw error;
    }
  };
  
  const addHotlineNumber = () => {
    setNewHotline({
      ...newHotline,
      numbers: [...newHotline.numbers, '']
    });
  };
  
  const removeHotlineNumber = (index) => {
    const updatedNumbers = newHotline.numbers.filter((_, i) => i !== index);
    setNewHotline({
      ...newHotline,
      numbers: updatedNumbers
    });
  };
  
  const addHotline = async () => {
    if (!newHotline.name || newHotline.numbers.some(num => !num)) {
      showAlert('Please fill in all hotline fields', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      
      let updatedHotlines;
      if (editingHotlineIndex >= 0) {
        // Update existing hotline
        updatedHotlines = [...emergencyHotlines];
        updatedHotlines[editingHotlineIndex] = { ...newHotline };
      } else {
        // Add new hotline
        updatedHotlines = [...emergencyHotlines, { ...newHotline }];
      }
      
      // Update state
      setEmergencyHotlines(updatedHotlines);
      
      // Reset form
      setNewHotline({ name: '', numbers: [''] });
      setEditingHotlineIndex(-1);
      
      // Save to backend immediately
      await saveHotlinesToBackend(updatedHotlines);
      
      showAlert(editingHotlineIndex >= 0 ? 'Hotline updated successfully!' : 'Hotline added successfully!');
    } catch (error) {
      console.error('Error adding/updating hotline:', error);
      showAlert('Error adding/updating hotline. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const editHotline = (index) => {
    setNewHotline({ ...emergencyHotlines[index] });
    setEditingHotlineIndex(index);
  };
  
  const removeHotline = async (index) => {
    try {
      setSaving(true);
      
      const updatedHotlines = emergencyHotlines.filter((_, i) => i !== index);
      setEmergencyHotlines(updatedHotlines);
      
      // Save to backend immediately
      await saveHotlinesToBackend(updatedHotlines);
      
      showAlert('Hotline removed successfully!');
    } catch (error) {
      console.error('Error removing hotline:', error);
      showAlert('Error removing hotline. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const saveEmergencyHotlines = async () => {
    try {
      setSaving(true);
      await saveHotlinesToBackend(emergencyHotlines);
      showAlert('Emergency hotlines updated successfully!');
    } catch (error) {
      console.error('Error updating emergency hotlines:', error);
      showAlert('Error updating emergency hotlines. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Map Coordinates Handlers ========
  const handleMapCoordinateChange = (e) => {
    const { name, value } = e.target;
    setMapCoordinates(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const saveMapCoordinates = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch('http://localhost:3002/homepage/map', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapCoordinates,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('Map coordinates updated successfully!');
    } catch (error) {
      console.error('Error updating map coordinates:', error);
      showAlert('Error updating map coordinates. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Officials Handlers ========
  const handleOfficialImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setSelectedOfficialImage(selectedFile);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setOfficialImagePreview(previewUrl);
      
      // We'll set the image path later when we add or update the official
    }
  };
  
  const handleOfficialChange = (e) => {
    const { name, value } = e.target;
    setNewOfficial(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addOfficial = async () => {
    if (!newOfficial.name || !newOfficial.position) {
      showAlert('Please fill in name and position', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      // First, if we have a new image, upload it
      let imagePath = newOfficial.imageUrl; // Keep existing path by default
      
      if (selectedOfficialImage) {
        const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
        
        const formData = new FormData();
        formData.append('image', selectedOfficialImage);
        formData.append('adminName', adminName);
        
        const response = await fetch('http://localhost:3002/homepage/official-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload official image');
        }
        
        const data = await response.json();
        imagePath = data.imagePath; // Get the path of the uploaded image
        console.log("Image path received:", imagePath);
      }
      
      // Now proceed with adding/updating the official with the new image path
      const officialWithImage = {
        ...newOfficial,
        imageUrl: imagePath
      };
      
      if (editingOfficialIndex >= 0) {
        // Update existing official
        const updatedOfficials = [...officials];
        updatedOfficials[editingOfficialIndex] = officialWithImage;
        setOfficials(updatedOfficials);
      } else {
        // Add new official
        setOfficials([...officials, officialWithImage]);
      }
      
      // Reset form and states
      setNewOfficial({ name: '', position: '', imageUrl: '' });
      setEditingOfficialIndex(-1);
      setSelectedOfficialImage(null);
      setOfficialImagePreview('');
      
      // Important: Save the officials to backend right away
      await saveOfficialsToBackend([...officials, officialWithImage]);
      
      showAlert('Official added successfully!');
    } catch (error) {
      console.error('Error adding official:', error);
      showAlert('Error adding official. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveOfficialsToBackend = async (officialsToSave) => {
    try {
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      console.log("Saving officials to backend:", officialsToSave);
      
      const response = await fetch('http://localhost:3002/homepage/officials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          officials: officialsToSave,
          adminName
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Save officials response:", data);
      setHomepageContent(data);
      
      // We don't need to reload since we're already updating state
      return true;
    } catch (error) {
      console.error('Error saving officials to backend:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };
  
  
  const editOfficial = (index) => {
    setNewOfficial({ ...officials[index] });
    setEditingOfficialIndex(index);
    setOfficialImagePreview(''); // Reset image preview
    setSelectedOfficialImage(null); // Reset selected image
  };
  
  const removeOfficial = async (index) => {
    try {
      setSaving(true);
      
      const updatedOfficials = officials.filter((_, i) => i !== index);
      setOfficials(updatedOfficials);
      
      // Save to backend right away
      await saveOfficialsToBackend(updatedOfficials);
      
      showAlert('Official removed successfully!');
    } catch (error) {
      console.error('Error removing official:', error);
      showAlert('Error removing official. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const saveOfficials = async () => {
    try {
      setSaving(true);
      await saveOfficialsToBackend(officials);
      showAlert('All officials updated successfully!');
    } catch (error) {
      console.error('Error updating all officials:', error);
      showAlert('Error updating officials. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Homepage Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update the content displayed on the public and resident homepage
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Welcome Section" />
          <Tab label="About Section" />
          <Tab label="Summary Data" />
          <Tab label="Carousel Images" />
          <Tab label="Emergency Hotlines" />
          <Tab label="Map Location" />
          <Tab label="Officials" />
          <Tab label="Footer" /> 
        </Tabs>
        
        {/* Welcome Section Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Update Welcome Section
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This is the first section visitors see on the homepage.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Welcome Title"
                variant="outlined"
                fullWidth
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                margin="normal"
                helperText="Main headline displayed on the homepage"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Welcome Text"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                margin="normal"
                helperText="Introductory paragraph displayed below the title"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveWelcomeSection}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Welcome Section'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* About Section Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Update About Section
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Information about Barangay Maahas displayed on the homepage.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="About Text"
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                margin="normal"
                helperText="Description of Barangay Maahas"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveAboutSection}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save About Section'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Summary Data Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Update Summary Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Statistical information about Barangay Maahas.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="type"
                label="Type"
                variant="outlined"
                fullWidth
                value={summaryData.type || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="islandGroup"
                label="Island Group"
                variant="outlined"
                fullWidth
                value={summaryData.islandGroup || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="region"
                label="Region"
                variant="outlined"
                fullWidth
                value={summaryData.region || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="province"
                label="Province"
                variant="outlined"
                fullWidth
                value={summaryData.province || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="municipality"
                label="Municipality"
                variant="outlined"
                fullWidth
                value={summaryData.municipality || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="postalCode"
                label="Postal Code"
                variant="outlined"
                fullWidth
                value={summaryData.postalCode || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="population"
                label="Population"
                variant="outlined"
                fullWidth
                value={summaryData.population || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="majorIsland"
                label="Major Island"
                variant="outlined"
                fullWidth
                value={summaryData.majorIsland || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="coordinates"
                label="Coordinates"
                variant="outlined"
                fullWidth
                value={summaryData.coordinates || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="elevation"
                label="Elevation"
                variant="outlined"
                fullWidth
                value={summaryData.elevation || ''}
                onChange={handleSummaryDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveSummaryData}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Summary Data'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Carousel Images Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Manage Carousel Images
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            These images will be displayed in the homepage carousel.
          </Typography>
          
          {/* Current Images */}
          <Paper sx={{ p: 2, mb: 4, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Carousel Images
            </Typography>
            
            {carouselImages.length > 0 ? (
            <Box>
            {/* Slider Preview */}
            <Box sx={{ mb: 3 }}>
                <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                adaptiveHeight={true}
                >
                {carouselImages.map((image, index) => (
                    <Box key={image._id || index} sx={{ position: 'relative' }}>
                    <img
                        src={`http://localhost:3002${image.path}`}
                        alt={image.caption || `Carousel image ${index + 1}`}
                        style={{ 
                        width: '100%', 
                        height: '250px', 
                        objectFit: 'cover',
                        borderRadius: '8px' 
                        }}
                    />
                    <Box
                        sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        p: 2,
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px'
                        }}
                    >
                        <Typography variant="body1">{image.caption || 'No caption'}</Typography>
                    </Box>
                    </Box>
                ))}
                </Slider>
            </Box>
            
            {/* Image List with Delete Buttons */}
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Manage Individual Images:
            </Typography>
            <Grid container spacing={2}>
                {carouselImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={image._id || index}>
                    <Card>
                    <CardMedia
                        component="img"
                        height="140"
                        image={`http://localhost:3002${image.path}`}
                        alt={image.caption || `Carousel image ${index + 1}`}
                    />
                    <CardContent sx={{ pb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                        {image.caption || 'No caption'}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteImageClick(image)}
                        >
                        Delete
                        </Button>
                    </CardActions>
                    </Card>
                </Grid>
                ))}
            </Grid>
            </Box>
        ) : (
            <Typography variant="body2" sx={{ py: 2 }}>
            No carousel images have been uploaded yet.
            </Typography>
        )}
        </Paper>
          
          {/* Upload New Images */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload New Images
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                Select Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            
            {/* File Preview */}
            {filePreviewUrls.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Selected Images:
                </Typography>
                <Grid container spacing={2}>
                  {filePreviewUrls.map((url, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={url}
                          alt={`Preview ${index + 1}`}
                        />
                        <CardContent>
                          <TextField
                            label="Caption (optional)"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={carouselCaptions[index] || ''}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => uploadCarouselImages('append')}
                disabled={saving || selectedFiles.length === 0}
              >
                {saving ? 'Uploading...' : 'Add to Carousel'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={() => uploadCarouselImages('replace')}
                disabled={saving || selectedFiles.length === 0}
              >
                Replace All Images
              </Button>
            </Box>
          </Paper>
        </TabPanel>
        
        {/* Emergency Hotlines Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Manage Emergency Hotlines
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Emergency contact numbers displayed on the homepage.
          </Typography>
          
          {/* Current Hotlines */}
          <Paper sx={{ p: 2, mb: 4, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Hotlines
            </Typography>
            
            {emergencyHotlines.length > 0 ? (
              <List>
                {emergencyHotlines.map((hotline, index) => (
                  <ListItem key={index} divider={index !== emergencyHotlines.length - 1}>
                    <ListItemText
                      primary={hotline.name}
                      secondary={hotline.numbers.join(' / ')}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => editHotline(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => removeHotline(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ py: 2 }}>
                No emergency hotlines have been added yet.
              </Typography>
            )}
          </Paper>
          
          {/* Add/Edit Hotline */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {editingHotlineIndex >= 0 ? 'Edit Hotline' : 'Add New Hotline'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Hotline Name"
                  variant="outlined"
                  fullWidth
                  name="name"
                  value={newHotline.name}
                  onChange={(e) => handleHotlineChange(e)}
                  margin="normal"
                  placeholder="E.g., LB Bureau of Fire Protection"
                />
              </Grid>
              
              {newHotline.numbers.map((number, index) => (
                <Grid item xs={12} key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label={`Phone Number ${index + 1}`}
                    variant="outlined"
                    fullWidth
                    name="numbers"
                    value={number}
                    onChange={(e) => handleHotlineChange(e, index)}
                    margin="normal"
                    placeholder="E.g., 123-4567"
                  />
                  {newHotline.numbers.length > 1 && (
                    <IconButton 
                      color="error" 
                      onClick={() => removeHotlineNumber(index)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              ))}
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={addHotlineNumber}
                  startIcon={<AddIcon />}
                >
                  Add Another Number
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addHotline}
                  >
                    {editingHotlineIndex >= 0 ? 'Update Hotline' : 'Add Hotline'}
                  </Button>
                  {editingHotlineIndex >= 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setNewHotline({ name: '', numbers: [''] });
                        setEditingHotlineIndex(-1);
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveEmergencyHotlines}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Hotlines'}
          </Button>
        </TabPanel>
        
        {/* Map Location Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Update Map Location
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set the coordinates for the embedded Google Map.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="latitude"
                label="Latitude"
                variant="outlined"
                fullWidth
                type="number"
                value={mapCoordinates.latitude || ''}
                onChange={handleMapCoordinateChange}
                margin="normal"
                InputProps={{ inputProps: { step: 0.0001 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="longitude"
                label="Longitude"
                variant="outlined"
                fullWidth
                type="number"
                value={mapCoordinates.longitude || ''}
                onChange={handleMapCoordinateChange}
                margin="normal"
                InputProps={{ inputProps: { step: 0.0001 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Map Preview:
              </Typography>
              <Box sx={{ width: '100%', height: 300, mb: 2 }}>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://maps.google.com/maps?q=${mapCoordinates.latitude},${mapCoordinates.longitude}&z=15&output=embed`}
                ></iframe>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveMapCoordinates}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Map Location'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Officials Tab */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            Manage Barangay Officials
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Officials displayed on the homepage.
          </Typography>
          
          {/* Current Officials */}
          <Paper sx={{ p: 2, mb: 4, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Officials
            </Typography>
            
            {officials.length > 0 ? (
              <Grid container spacing={2}>
                {officials.map((official, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{official.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {official.position}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => editOfficial(index)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => removeOfficial(index)}
                        >
                          Remove
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ py: 2 }}>
                No officials have been added yet.
              </Typography>
            )}
          </Paper>
          
          {/* Add/Edit Official */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {editingOfficialIndex >= 0 ? 'Edit Official' : 'Add New Official'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  name="name"
                  value={newOfficial.name}
                  onChange={handleOfficialChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Position"
                  variant="outlined"
                  fullWidth
                  name="position"
                  value={newOfficial.position}
                  onChange={handleOfficialChange}
                  margin="normal"
                />
              </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        Official Image
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                        sx={{ 
                            width: 100, 
                            height: 100, 
                            border: '1px dashed #ccc',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                        >
                        {officialImagePreview ? (
                            <img 
                            src={officialImagePreview} 
                            alt="Official preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : newOfficial.imageUrl ? (
                            <img 
                            src={`http://localhost:3002${newOfficial.imageUrl}`} 
                            alt="Current official" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = '/placeholder-person.png';
                                e.target.style.padding = '10px';
                                e.target.style.opacity = '0.5';
                            }}
                            />
                        ) : (
                            <PhotoIcon color="disabled" />
                        )}
                        </Box>
                        
                        <Box>
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            startIcon={<UploadIcon />}
                        >
                            Upload Photo
                            <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleOfficialImageChange}
                            />
                        </Button>
                        
                        {(officialImagePreview || newOfficial.imageUrl) && (
                            <Button
                            variant="text"
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => {
                                setSelectedOfficialImage(null);
                                setOfficialImagePreview('');
                                setNewOfficial({...newOfficial, imageUrl: ''});
                            }}
                            >
                            Remove
                            </Button>
                        )}
                        
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Recommended: Square image (1:1 ratio)
                        </Typography>
                        </Box>
                    </Box>
                    </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addOfficial}
                  >
                    {editingOfficialIndex >= 0 ? 'Update Official' : 'Add Official'}
                  </Button>
                  {editingOfficialIndex >= 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setNewOfficial({ name: '', position: '', imageUrl: '' });
                        setEditingOfficialIndex(-1);
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveOfficials}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Officials'}
          </Button>
        </TabPanel>
        {/* Footer Tab */}
        <TabPanel value={tabValue} index={7}>
          <Typography variant="h6" gutterBottom>
            Update Footer Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Update the information displayed in the site footer.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Footer Title"
                variant="outlined"
                fullWidth
                value={footerData.title || ''}
                onChange={handleFooterDataChange}
                margin="normal"
                helperText="Title displayed in the footer (usually barangay name)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Footer Description"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={footerData.description || ''}
                onChange={handleFooterDataChange}
                margin="normal"
                helperText="Brief description of the barangay or site"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="address"
                label="Address"
                variant="outlined"
                fullWidth
                value={footerData.address || ''}
                onChange={handleFooterDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="phone"
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={footerData.phone || ''}
                onChange={handleFooterDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="email"
                label="Email Address"
                variant="outlined"
                fullWidth
                value={footerData.email || ''}
                onChange={handleFooterDataChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveFooterData}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Footer Information'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this image? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={deleteCarouselImage} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminManageHomepage;
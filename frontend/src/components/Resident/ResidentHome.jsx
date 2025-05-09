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
  CardMedia,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Link,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Announcement as AnnouncementIcon,
  Explore as ExploreIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  ArrowForward as ArrowForwardIcon,
  ImportContacts as ImportContactsIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function ResidentHome() {
  const [firstName, setFirstName] = useState('');
  const [homepageContent, setHomepageContent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Get user's first name from localStorage
    const storedFirstName = localStorage.getItem('firstName');
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }
    
    // Fetch homepage content
    fetchHomepageContent();
    
    // Fetch latest announcements
    fetchLatestAnnouncements();
  }, [refreshKey]);
  
  const refreshData = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const fetchHomepageContent = async () => {
  try {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`http://localhost:3002/homepage?t=${timestamp}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setHomepageContent(data);
    console.log("Homepage content loaded:", data); // Debug log
  } catch (error) {
    console.error('Error fetching homepage content:', error);
  } finally {
    setLoading(false);
  }
};
  
  const fetchLatestAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:3002/announcements');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Sort by date (newest first) and take only the latest 3
      const latestAnnouncements = data
        .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
        .slice(0, 3);
      setAnnouncements(latestAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Carousel settings for react-slick
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    adaptiveHeight: true
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #2196f3, #0d47a1)',
          color: 'white',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              {homepageContent?.welcomeTitle || 'Barangay Maahas Digital Hub'}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 3
              }}
            >
              {homepageContent?.welcomeText || 'Welcome to the Barangay Maahas Digital Hub'}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' } 
              }}
            >
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/resident/announcements"
                startIcon={<AnnouncementIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#0d47a1',
                  '&:hover': { bgcolor: '#e0e0e0' },
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold'
                }}
              >
                Latest Announcements
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/resident/services"
                startIcon={<ExploreIcon />}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  },
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold'
                }}
              >
                Explore Services
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: { xs: '200px', md: '300px' } }}>
              {homepageContent?.carouselImages && homepageContent.carouselImages.length > 0 ? (
                <Box sx={{ overflow: 'hidden', borderRadius: 2 }}>
                  <Slider {...carouselSettings}>
                    {homepageContent.carouselImages.map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          height: { xs: '200px', md: '300px' },
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Debug information */}
                        {process.env.NODE_ENV === 'development' && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              p: 1,
                              zIndex: 10,
                              fontSize: '10px',
                            }}
                          >
                            Path: {item.path}
                          </Box>
                        )}
                        
                        {/* Image with better error handling */}
                        <img 
                          src={`http://localhost:3002${item.path}`} 
                          alt={item.caption || 'Barangay Maahas'} 
                          onError={(e) => {
                            console.error('Image failed to load:', item.path);
                            e.target.src = '/placeholder-image.jpg'; // Fallback image
                            e.target.style.objectFit = 'contain';
                            e.target.style.backgroundColor = '#e0e0e0';
                          }}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        
                        {item.caption && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                              bgcolor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              p: 1,
                              zIndex: 5
                            }}
                          >
                            <Typography variant="body2">{item.caption}</Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Slider>
                </Box>
              ) : (
                <Box
                  sx={{ 
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <Typography variant="body1">No images available</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Latest Announcements */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '3px solid #2196f3',
            pb: 1
          }}
        >
          <AnnouncementIcon sx={{ mr: 1, color: '#2196f3' }} />
          Latest Announcements
        </Typography>
        
        <Grid container spacing={3}>
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Grid item xs={12} md={4} key={announcement._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {announcement.images && announcement.images.length > 0 && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`http://localhost:3002${announcement.images[0]}`}
                      alt={announcement.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      component="div"
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: '0.8rem' }}
                    >
                      {formatDate(announcement.postedAt)} | {announcement.type}
                    </Typography>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(announcement.content, 120)}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      component={RouterLink} 
                      to={`/resident/announcements/${announcement._id}`}
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                    >
                      Read more
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No announcements available.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            component={RouterLink} 
            to="/resident/announcements" 
            variant="outlined" 
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 2 }}
          >
            View All Announcements
          </Button>
        </Box>
      </Box>

      {/* About and Summary Data */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid #2196f3',
                pb: 1
              }}
            >
              <InfoIcon sx={{ mr: 1, color: '#2196f3' }} />
              About Barangay Maahas
            </Typography>
            <Typography variant="body1" paragraph>
              {homepageContent?.aboutText || 'Information about Barangay Maahas.'}
            </Typography>
            
            <Button 
              component={RouterLink}
              to="/resident/register-database"
              variant="contained" 
              color="primary" 
              startIcon={<PersonAddIcon />}
              sx={{ mt: 2 }}
            >
              Register as Resident
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid #2196f3',
                pb: 1
              }}
            >
              <ImportContactsIcon sx={{ mr: 1, color: '#2196f3' }} />
              Barangay Summary Data
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>Type</TableCell>
                    <TableCell>{homepageContent?.summaryData?.type || 'barangay'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Island group</TableCell>
                    <TableCell>{homepageContent?.summaryData?.islandGroup || 'Luzon'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Region</TableCell>
                    <TableCell>{homepageContent?.summaryData?.region || 'CALABARZON (Region IV‑A)'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Province</TableCell>
                    <TableCell>{homepageContent?.summaryData?.province || 'Laguna'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Municipality</TableCell>
                    <TableCell>{homepageContent?.summaryData?.municipality || 'Los Baños'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Postal code</TableCell>
                    <TableCell>{homepageContent?.summaryData?.postalCode || '4030'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Population (2020)</TableCell>
                    <TableCell>{homepageContent?.summaryData?.population || '8,785'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Major island</TableCell>
                    <TableCell>{homepageContent?.summaryData?.majorIsland || 'Luzon'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Coordinates</TableCell>
                    <TableCell>{homepageContent?.summaryData?.coordinates || '14.1766, 121.2566'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Elevation</TableCell>
                    <TableCell>{homepageContent?.summaryData?.elevation || '16.0 meters (52.5 feet)'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Emergency Hotlines and Map */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid #2196f3',
                pb: 1
              }}
            >
              <PhoneIcon sx={{ mr: 1, color: '#2196f3' }} />
              Emergency Hotlines
            </Typography>
            
            <List dense>
              {homepageContent?.emergencyHotlines && homepageContent.emergencyHotlines.length > 0 ? (
                homepageContent.emergencyHotlines.map((hotline, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={hotline.name}
                      secondary={hotline.numbers.join(' / ')}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No hotlines available" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid #2196f3',
                pb: 1
              }}
            >
              <LocationOnIcon sx={{ mr: 1, color: '#2196f3' }} />
              Barangay Location
            </Typography>
            
            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${homepageContent?.mapCoordinates?.latitude || 14.1766},${homepageContent?.mapCoordinates?.longitude || 121.2566}&z=15&output=embed`}
              ></iframe>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Barangay Officials */}
      <Paper sx={{ p: 3, mb: 5 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '2px solid #2196f3',
            pb: 1
          }}
        >
          <CelebrationIcon sx={{ mr: 1, color: '#2196f3' }} />
          Current Barangay Officials
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {homepageContent?.officials && homepageContent.officials.length > 0 ? (
            homepageContent.officials.map((official, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2
                  }}
                >
                  
                  <Avatar
                    src={official.imageUrl ? `http://localhost:3002${official.imageUrl}` : ''}
                    alt={official.name}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mb: 2,
                      border: '2px solid #e0e0e0'
                    }}
                    imgProps={{
                      onError: (e) => {
                        console.log('Official image failed to load:', official.imageUrl);
                        e.target.src = '/placeholder-person.png'; // Fallback image
                      }
                    }}
                  />
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    {official.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {official.position}
                  </Typography>
                </Box>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                No officials information available.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}
  
export default ResidentHome;
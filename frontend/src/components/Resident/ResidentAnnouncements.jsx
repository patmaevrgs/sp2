import React, { useEffect, useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  CircularProgress, 
  Box,
  CardMedia, 
  Grid,
  Button,
  Chip,
  Link,
  Divider,
  Paper,
  CardHeader,
  Avatar
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AnnouncementIcon from '@mui/icons-material/Announcement';

const ResidentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const highlightedCardRef = useRef(null);

  // Get icon for announcement type
  const getTypeIcon = (typeValue) => {
    switch(typeValue) {
      case 'General': return <NotificationsIcon />;
      case 'Event': return <EventIcon />;
      case 'Emergency': return <WarningIcon />;
      case 'Notice': return <InfoIcon />;
      case 'Other': return <MoreHorizIcon />;
      default: return <NotificationsIcon />;
    }
  };

  // Get color for announcement type
  const getTypeColor = (typeValue) => {
    switch(typeValue) {
      case 'General': return 'primary';
      case 'Event': return 'secondary';
      case 'Emergency': return 'error';
      case 'Notice': return 'info';
      case 'Other': return 'default';
      default: return 'primary';
    }
  };

  // Get avatar background color based on announcement type
  const getAvatarBgColor = (typeValue) => {
    switch(typeValue) {
      case 'General': return '#1976d2'; // primary
      case 'Event': return '#9c27b0'; // secondary
      case 'Emergency': return '#d32f2f'; // error
      case 'Notice': return '#0288d1'; // info
      case 'Other': return '#757575'; // default
      default: return '#1976d2';
    }
  };

  useEffect(() => {
    // Fetching announcements from the backend
    fetch('http://localhost:3002/announcements', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch announcements');
        }
        return res.json();
      })
      .then((data) => {
        console.log('API response:', data);
        setAnnouncements(Array.isArray(data) ? data.reverse() : []); // Show latest first
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Add this new useEffect for handling hash navigation
  useEffect(() => {
    if (!loading && announcements.length > 0 && window.location.hash) {
      const id = window.location.hash.substring(1); // Remove the # symbol
      
      // Give time for the DOM to render the cards
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          // Scroll the element into view with smooth behavior
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Add a highlight effect
          element.style.boxShadow = '0 0 20px rgba(33, 150, 243, 0.8)';
          highlightedCardRef.current = element;
          
          // Remove the highlight effect after 3 seconds
          setTimeout(() => {
            if (highlightedCardRef.current) {
              highlightedCardRef.current.style.boxShadow = '';
            }
          }, 3000);
        }
      }, 300);
    }
  }, [loading, announcements]);
  
  // When component unmounts or navigates away, clean up any highlight
  useEffect(() => {
    return () => {
      if (highlightedCardRef.current) {
        highlightedCardRef.current.style.boxShadow = '';
      }
    };
  }, []);

  // Helper function to display media galleries
  const renderMedia = (announcement) => {
    return (
      <>
        {/* Images Gallery */}
        {announcement.images && announcement.images.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={1}>
              {announcement.images.map((imgPath, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      image={`http://localhost:3002${imgPath}`}
                      alt={`Announcement image ${index + 1}`}
                      sx={{ 
                        height: 200, 
                        objectFit: 'cover',
                        '&:hover': {
                          cursor: 'pointer',
                          opacity: 0.9
                        }
                      }}
                      onClick={() => window.open(`http://localhost:3002${imgPath}`, '_blank')}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Videos Gallery */}
        {announcement.videos && announcement.videos.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <VideocamIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Videos:
            </Typography>
            <Grid container spacing={1}>
              {announcement.videos.map((videoPath, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="video"
                      controls
                      src={`http://localhost:3002${videoPath}`}
                      sx={{ maxHeight: 200 }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Attached Files */}
        {announcement.files && announcement.files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">
              <AttachFileIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Attachments:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {announcement.files.map((file, index) => (
                <Chip
                  key={index}
                  icon={<AttachFileIcon />}
                  label={file.name}
                  component={Link}
                  href={`http://localhost:3002${file.path}`}
                  target="_blank"
                  clickable
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </>
    );
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnnouncementIcon fontSize="large" sx={{ mr: 1 }} />
        <Typography variant="h4" component="div">
          Barangay Announcements
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: '#fff8f8', mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : announcements.length > 0 ? (
        announcements.map((announcement) => (
          <Card key={announcement._id} id={announcement._id} sx={{ mb: 3, boxShadow: 3, overflow: 'visible', transition: 'box-shadow 0.3s ease-in-out' }}>
            <CardHeader
              avatar={
                <Avatar 
                  sx={{ 
                    bgcolor: getAvatarBgColor(announcement.type || 'General'),
                  }}
                >
                  {getTypeIcon(announcement.type || 'General')}
                </Avatar>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" component="span">
                    {announcement.title || 'Brgy Maahas Update'}
                  </Typography>
                  <Chip
                    label={announcement.type || 'General'}
                    color={getTypeColor(announcement.type || 'General')}
                    size="small"
                  />
                </Box>
              }
              subheader={new Date(announcement.postedAt).toLocaleString()}
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                {announcement.content}
              </Typography>
              
              {/* Render media content */}
              {renderMedia(announcement)}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {announcement.editedAt && (
                    <span>Last updated: {new Date(announcement.editedAt).toLocaleString()}</span>
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Paper sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          p: 3,
          bgcolor: '#f5f5f5',
          borderRadius: 1
        }}>
          <Typography variant="h6" color="text.secondary">
            No announcements available.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ResidentAnnouncements;
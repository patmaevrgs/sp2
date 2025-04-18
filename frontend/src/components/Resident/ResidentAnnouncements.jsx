import React, { useEffect, useState } from 'react';
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
  Divider
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';

const ResidentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching announcements from the backend without the /api prefix
    fetch('http://localhost:3002/announcements', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adding credentials to include cookies if necessary (if you're using sessions)
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('API response:', data);
        // Adjust this line if your response is nested or has a different structure
        setAnnouncements(Array.isArray(data) ? data.reverse() : []); // Show latest first
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching announcements:', err);
        setLoading(false);
      });
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
        <Typography variant="h4" gutterBottom component="div">
          Barangay Announcements
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card key={announcement._id} sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Brgy Maahas Update
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {announcement.content}
                </Typography>
                
                {/* Render media content */}
                {renderMedia(announcement)}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Posted: {new Date(announcement.postedAt).toLocaleString()}
                    {announcement.editedAt && (
                      <span> (edited: {new Date(announcement.editedAt).toLocaleString()})</span>
                    )}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            bgcolor: '#f5f5f5',
            borderRadius: 1
          }}>
            <Typography variant="h6" color="text.secondary">
              No announcements available.
            </Typography>
          </Box>
        )
      )}
    </Container>
  );
};

export default ResidentAnnouncements;
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function AdminAnnouncements() {
  const [title, setTitle] = useState('Brgy Maahas Update'); // New title state
  const [type, setType] = useState('General'); // New type state
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Track existing files when editing
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Announcement type options
  const announcementTypes = [
    { value: 'General', label: 'General', icon: <NotificationsIcon /> },
    { value: 'Event', label: 'Event', icon: <EventIcon /> },
    { value: 'Emergency', label: 'Emergency', icon: <WarningIcon /> },
    { value: 'Notice', label: 'Notice', icon: <InfoIcon /> },
    { value: 'Other', label: 'Other', icon: <MoreHorizIcon /> }
  ];

  // Get icon for announcement type
  const getTypeIcon = (typeValue) => {
    const typeObj = announcementTypes.find(t => t.value === typeValue);
    return typeObj ? typeObj.icon : <NotificationsIcon />;
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

  useEffect(() => {
    // Get current admin's full name from localStorage
    try {
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      
      if (firstName && lastName) {
        setCurrentAdmin(`${firstName} ${lastName}`);
      } else if (localStorage.getItem("fullName")) {
        setCurrentAdmin(localStorage.getItem("fullName"));
      } else {
        setCurrentAdmin(localStorage.getItem("user") || "Unknown Admin");
      }
    } catch (e) {
      console.error("Error getting admin name:", e);
      setCurrentAdmin("Unknown Admin");
    }
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3002/announcements');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAnnouncements(data.reverse()); // show latest first
      } else {
        console.warn("Unexpected response format:", data);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    // Generate previews for images
    const newPreviews = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            file: file,
            preview: e.target.result,
            type: 'image'
          });
          if (newPreviews.length === files.filter(f => f.type.startsWith('image/')).length) {
            setPreviewImages(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        newPreviews.push({
          file: file,
          name: file.name,
          type: 'video'
        });
      } else {
        newPreviews.push({
          file: file,
          name: file.name,
          type: 'file'
        });
      }
    });

    if (newPreviews.filter(p => p.type !== 'image').length > 0) {
      setPreviewImages(prev => [...prev, ...newPreviews.filter(p => p.type !== 'image')]);
    }
  };

  // Remove a file from the selected files
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  // Remove an existing file when editing
  const removeExistingImage = (path) => {
    setExistingImages(prev => prev.filter(img => img !== path));
  };

  const removeExistingVideo = (path) => {
    setExistingVideos(prev => prev.filter(vid => vid !== path));
  };

  const removeExistingFile = (file) => {
    setExistingFiles(prev => prev.filter(f => f.path !== file.path));
  };

  const handlePost = async () => {
    if ((!content.trim() && selectedFiles.length === 0) || !title.trim()) {
      setError("Title and either content or files are required.");
      return;
    }
    
    if (!currentAdmin) {
      setError("You must be logged in to post.");
      return;
    }

    setSubmitLoading(true);
    setError('');

    const url = editingId
      ? `http://localhost:3002/announcements/${editingId}`
      : 'http://localhost:3002/announcements';

    const method = editingId ? 'PATCH' : 'POST';

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('title', title); // Add title to form data
      formData.append('content', content);
      formData.append('postedBy', currentAdmin);
      formData.append('type', type); // Add type to form data
      
      // Add selected files
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add existing files info if editing
      if (editingId) {
        formData.append('keepImages', JSON.stringify(existingImages));
        formData.append('keepVideos', JSON.stringify(existingVideos));
        formData.append('keepFiles', JSON.stringify(existingFiles));
      }
      
      // Add empty links array (you can modify this to handle links if needed)
      formData.append('links', JSON.stringify([]));

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        console.error('Error saving announcement:', errorMsg);
        setError('Failed to save announcement. Please try again.');
        return;
      }

      // Reset form
      setTitle('Brgy Maahas Update');
      setContent('');
      setType('General');
      setEditingId(null);
      setSelectedFiles([]);
      setPreviewImages([]);
      setExistingImages([]);
      setExistingVideos([]);
      setExistingFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!currentAdmin) {
      setError("You must be logged in to delete announcements.");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const response = await fetch(`http://localhost:3002/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminName: currentAdmin }),
        });
        
        if (response.ok) {
          fetchAnnouncements();
        } else {
          console.error('Error deleting announcement:', await response.text());
          setError('Failed to delete announcement. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        setError('An error occurred while deleting. Please try again.');
      }
    }
  };

  const startEdit = (announcement) => {
    setTitle(announcement.title || 'Brgy Maahas Update');
    setContent(announcement.content);
    setType(announcement.type || 'General');
    setEditingId(announcement._id);
    
    // Set existing files
    setExistingImages(announcement.images || []);
    setExistingVideos(announcement.videos || []);
    setExistingFiles(announcement.files || []);
    
    // Clear new file selections
    setSelectedFiles([]);
    setPreviewImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Scroll to top to edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('Brgy Maahas Update');
    setContent('');
    setType('General');
    setEditingId(null);
    setSelectedFiles([]);
    setPreviewImages([]);
    setExistingImages([]);
    setExistingVideos([]);
    setExistingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {editingId ? 'Edit Announcement' : 'Post Announcement'}
        </Typography>
        
        {currentAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Posting as: <strong>{currentAdmin}</strong>
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {/* Title input field */}
        <TextField
          fullWidth
          label="Announcement Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        
        {/* Announcement Type Selector */}
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel id="announcement-type-label">Announcement Type</InputLabel>
          <Select
            labelId="announcement-type-label"
            value={type}
            onChange={(e) => setType(e.target.value)}
            label="Announcement Type"
          >
            {announcementTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>{type.icon}</Box>
                  {type.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Text content */}
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement here..."
          sx={{ mb: 2 }}
        />
        
        {/* File upload */}
        <Box sx={{ 
          border: '1px dashed #ccc', 
          p: 2, 
          borderRadius: 1, 
          mb: 3,
          textAlign: 'center'
        }}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button 
              variant="contained" 
              component="span"
              startIcon={<UploadFileIcon />}
            >
              Upload Files
            </Button>
          </label>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Upload images, videos, or documents
          </Typography>
        </Box>
        
        {/* Preview of selected new files */}
        {previewImages.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Files
            </Typography>
            <Grid container spacing={2}>
              {previewImages.map((item, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card sx={{ position: 'relative' }}>
                    {item.type === 'image' ? (
                      <CardMedia
                        component="img"
                        height="120"
                        image={item.preview}
                        alt="Preview"
                      />
                    ) : (
                      <Box sx={{ 
                        height: 120, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.100'
                      }}>
                        {item.type === 'video' ? (
                          <VideocamIcon fontSize="large" color="primary" />
                        ) : (
                          <AttachFileIcon fontSize="large" color="primary" />
                        )}
                      </Box>
                    )}
                    <CardContent sx={{ pt: 1, pb: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2" noWrap>
                        {item.type === 'image' ? 'Image' : item.file.name}
                      </Typography>
                    </CardContent>
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 2, 
                        right: 2, 
                        bgcolor: 'rgba(255,255,255,0.7)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                      }}
                      onClick={() => removeFile(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Existing files when editing */}
        {editingId && (
          <>
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Images
                </Typography>
                <Grid container spacing={2}>
                  {existingImages.map((path, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={`http://localhost:3002${path}`}
                          alt={`Existing image ${index}`}
                        />
                        <IconButton
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 2, 
                            right: 2, 
                            bgcolor: 'rgba(255,255,255,0.7)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                          }}
                          onClick={() => removeExistingImage(path)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Existing Videos */}
            {existingVideos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Videos
                </Typography>
                <Grid container spacing={2}>
                  {existingVideos.map((path, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        <Box sx={{ 
                          height: 120, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}>
                          <VideocamIcon fontSize="large" color="primary" />
                        </Box>
                        <CardContent sx={{ pt: 1, pb: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="body2" noWrap>
                            Video {index + 1}
                          </Typography>
                        </CardContent>
                        <IconButton
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 2, 
                            right: 2, 
                            bgcolor: 'rgba(255,255,255,0.7)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                          }}
                          onClick={() => removeExistingVideo(path)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Existing Files */}
            {existingFiles.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Files
                </Typography>
                <Grid container spacing={2}>
                  {existingFiles.map((file, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        <Box sx={{ 
                          height: 120, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}>
                          <AttachFileIcon fontSize="large" color="primary" />
                        </Box>
                        <CardContent sx={{ pt: 1, pb: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="body2" noWrap title={file.name}>
                            {file.name}
                          </Typography>
                        </CardContent>
                        <IconButton
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 2, 
                            right: 2, 
                            bgcolor: 'rgba(255,255,255,0.7)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                          }}
                          onClick={() => removeExistingFile(file)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={handlePost}
            disabled={submitLoading || !title.trim() || (!content.trim() && selectedFiles.length === 0 && 
                      !existingImages.length && !existingVideos.length && !existingFiles.length)}
            startIcon={submitLoading ? <CircularProgress size={20} /> : null}
          >
            {submitLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Post'}
          </Button>
          
          {editingId && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={resetForm}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      <Typography variant="h4" sx={{ mb: 3, mt: 4 }}>
        All Announcements
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Alert severity="info">No announcements available.</Alert>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                <CardContent>
                  {/* Announcement Type Chip */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {announcement.title || 'Brgy Maahas Update'}
                    </Typography>
                    <Chip
                      icon={getTypeIcon(announcement.type || 'General')}
                      label={announcement.type || 'General'}
                      color={getTypeColor(announcement.type || 'General')}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {announcement.content}
                  </Typography>
                  
                  {/* Display Images */}
                  {announcement.images && announcement.images.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        {announcement.images.map((imgPath, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Box
                              component="img"
                              src={`http://localhost:3002${imgPath}`}
                              alt={`Image ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 1,
                                cursor: 'pointer',
                              }}
                              onClick={() => window.open(`http://localhost:3002${imgPath}`, '_blank')}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Display Videos */}
                  {announcement.videos && announcement.videos.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        <VideocamIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Videos:
                      </Typography>
                      <Grid container spacing={1}>
                        {announcement.videos.map((videoPath, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              component="video"
                              controls
                              sx={{
                                width: '100%',
                                borderRadius: 1,
                                maxHeight: 200,
                              }}
                            >
                              <source src={`http://localhost:3002${videoPath}`} />
                              Your browser does not support video playback.
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Display Files */}
                  {announcement.files && announcement.files.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <AttachFileIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Attachments:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {announcement.files.map((file, index) => (
                          <Chip
                            key={index}
                            label={file.name}
                            icon={<AttachFileIcon />}
                            component="a"
                            href={`http://localhost:3002${file.path}`}
                            target="_blank"
                            clickable
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Posted by: <strong>{announcement.postedBy}</strong> | {new Date(announcement.postedAt).toLocaleString()}
                      {announcement.editedAt && (
                        <span> (edited: {new Date(announcement.editedAt).toLocaleString()})</span>
                      )}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => startEdit(announcement)}
                      >
                        {isMobile ? '' : 'Edit'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(announcement._id)}
                      >
                        {isMobile ? '' : 'Delete'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default AdminAnnouncements;
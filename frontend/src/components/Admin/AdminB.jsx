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
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import InputAdornment from '@mui/material/InputAdornment';
import { useMemo } from 'react';

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

  const filteredAndSortedAnnouncements = useMemo(() => {
    let filtered = announcements;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(announcement => 
        (announcement.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (filterType) {
      filtered = filtered.filter(announcement => 
        (announcement.type || 'General') === filterType
      );
    }
    
    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.postedAt);
      const dateB = new Date(b.postedAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [announcements, searchQuery, filterType, sortOrder]);

  return (
  <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Announcement Management
      </Typography>
      <Box sx={{ mb: 4 }} />
      
      {/* Main Form Paper */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
        {/* Form Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            {editingId ? 'Edit Announcement' : 'Post New Announcement'}
          </Typography>
        </Box>
        
        {currentAdmin && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
            <Typography variant="body2">
              Posting as: <strong>{currentAdmin}</strong>
            </Typography>
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        <Box component="form">
          {/* Title and Type Section */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Announcement Title"
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotificationsIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="announcement-type-label">Type</InputLabel>
                  <Select
                    labelId="announcement-type-label"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    label="Type"
                    startAdornment={
                      <InputAdornment position="start">
                        {getTypeIcon(type)}
                      </InputAdornment>
                    }
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
              </Grid>
            </Grid>
          </Box>
          
          {/* Content Section */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement here..."
              label="Content"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                    <DescriptionIcon fontSize="small" color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {/* File Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Attachments
            </Typography>
            <Box sx={{ 
              border: '1px dashed', 
              borderColor: 'divider',
              p: 3, 
              borderRadius: 1, 
              textAlign: 'center',
              bgcolor: 'background.default'
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
                  size="large"
                >
                  Upload Files
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload images, videos, or documents (Maximum 10MB per file)
              </Typography>
            </Box>
          </Box>
          
          {/* Preview of selected new files */}
          {previewImages.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
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
                          top: 8, 
                          right: 8, 
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
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
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
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
                              top: 8, 
                              right: 8, 
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
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
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
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
                              top: 8, 
                              right: 8, 
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
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
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
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
                              top: 8, 
                              right: 8, 
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            {editingId && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetForm}
                startIcon={<CancelIcon />}
                size="large"
              >
                Cancel
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{ mr: 1 }}
              onClick={() => {
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
              }}
              disabled={submitLoading}
              startIcon={<RefreshIcon />}
            >
              Reset Form
            </Button>
            <Button 
              variant="contained"
              color="primary"
              size="large"
              onClick={handlePost}
              disabled={submitLoading || !title.trim() || (!content.trim() && selectedFiles.length === 0 && 
                        !existingImages.length && !existingVideos.length && !existingFiles.length)}
              startIcon={submitLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {submitLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Post'}
            </Button>
          </Box>
        </Box>
      </Paper>
      {/* Search, Filter, and Sort Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <SearchIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Search & Filter Announcements
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* Type Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-type-label">Filter by Type</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Types</MenuItem>
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
          </Grid>
          
          {/* Sort Order */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-order-label">Sort Order</InputLabel>
              <Select
                labelId="sort-order-label"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Sort Order"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="newest">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NewReleasesIcon sx={{ mr: 1, fontSize: 16 }} />
                    Newest First
                  </Box>
                </MenuItem>
                <MenuItem value="oldest">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon sx={{ mr: 1, fontSize: 16 }} />
                    Oldest First
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Announcements List Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
          All Announcements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredAndSortedAnnouncements.length} of {announcements.length} announcements
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading announcements...
            </Typography>
          </Box>
        </Box>
      ) : filteredAndSortedAnnouncements.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery || filterType ? 'No announcements match your search criteria' : 'No announcements available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || filterType ? 'Try adjusting your search or filters' : 'Create your first announcement using the form above'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedAnnouncements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Announcement Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2 
                  }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {announcement.title || 'Brgy Maahas Update'}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getTypeIcon(announcement.type || 'General')}
                      label={announcement.type || 'General'}
                      color={getTypeColor(announcement.type || 'General')}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        }
                      }}
                    />
                  </Box>
                  {/* Announcement Content */}
                  <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                    {announcement.content}
                  </Typography>
                  
                  {/* Display Images */}
                  {announcement.images && announcement.images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        <ImageIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Images ({announcement.images.length})
                      </Typography>
                      <Grid container spacing={1}>
                        {announcement.images.map((imgPath, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Box
                              sx={{
                                position: 'relative',
                                cursor: 'pointer',
                                borderRadius: 1,
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  transition: 'transform 0.2s'
                                }
                              }}
                            >
                              <Box
                                component="img"
                                src={`http://localhost:3002${imgPath}`}
                                alt={`Image ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 150,
                                  objectFit: 'cover',
                                }}
                                onClick={() => window.open(`http://localhost:3002${imgPath}`, '_blank')}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Display Videos */}
                  {announcement.videos && announcement.videos.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        <VideocamIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Videos ({announcement.videos.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {announcement.videos.map((videoPath, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              component="video"
                              controls
                              sx={{
                                width: '100%',
                                borderRadius: 1,
                                maxHeight: 200,
                                bgcolor: 'grey.900'
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
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        <AttachFileIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Attachments ({announcement.files.length})
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
                            sx={{ 
                              mb: 1,
                              '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'white'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Announcement Footer */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Posted by: <strong>{announcement.postedBy}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {new Date(announcement.postedAt).toLocaleString()}
                        {announcement.editedAt && (
                          <span sx={{ ml: 1 }}>
                            • <EditIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Edited: {new Date(announcement.editedAt).toLocaleString()}
                          </span>
                        )}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => startEdit(announcement)}
                        sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}
                      >
                        {isMobile ? '' : 'Edit'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(announcement._id)}
                        sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}
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
    </Box>
  </Container>
);
}

export default AdminAnnouncements;
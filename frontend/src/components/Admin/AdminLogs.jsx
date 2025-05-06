import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  useMediaQuery,
  Pagination,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CategoryIcon from '@mui/icons-material/Category';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState(''); // New filter for entity type
  const [uniqueAdmins, setUniqueAdmins] = useState([]);
  const [uniqueActions, setUniqueActions] = useState([]);
  const [uniqueEntityTypes, setUniqueEntityTypes] = useState([]); // New state for entity types
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // The list of all possible entity types
  const allEntityTypes = [
    'Announcement',
    'Report',
    'ProjectProposal',
    'DocumentRequest',
    'AmbulanceBooking',
    'CourtReservation',
    'Other'
  ];

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

  const fetchLogs = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.adminName) params.append('adminName', filters.adminName);
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType); // Add entity type to query params
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`http://localhost:3002/logs${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data);
      
      // Calculate total pages
      setTotalPages(Math.ceil(data.length / logsPerPage));
      
      // Extract unique admins, actions, and entity types for filters
      const admins = [...new Set(data.map(log => log.adminName))];
      const actions = [...new Set(data.map(log => log.action))];
      const entityTypes = [...new Set(data.map(log => log.entityType))];
      
      setUniqueAdmins(admins);
      setUniqueActions(actions);
      setUniqueEntityTypes(entityTypes);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please try again later.');
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    const filters = {
      startDate,
      endDate,
      adminName: adminFilter,
      action: actionFilter,
      entityType: entityTypeFilter // Include entity type in filters
    };
    fetchLogs(filters);
    setCurrentPage(1); // Reset to first page when filtering
    if (isMobile) {
      setFilterExpanded(false); // Collapse filter on mobile after applying
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setAdminFilter('');
    setActionFilter('');
    setEntityTypeFilter(''); // Clear entity type filter
    fetchLogs();
    setCurrentPage(1);
  };

  // Get human-readable action type
  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE_ANNOUNCEMENT': return 'Created Announcement';
      case 'UPDATE_ANNOUNCEMENT': return 'Updated Announcement';
      case 'DELETE_ANNOUNCEMENT': return 'Deleted Announcement';
      case 'UPDATE_REPORT_STATUS': return 'Updated Report Status';
      case 'CANCEL_REPORT': return 'Cancelled Report';
      case 'UPDATE_PROPOSAL_STATUS': return 'Updated Proposal Status';
      case 'UPDATE_DOCUMENT_REQUEST_STATUS': return 'Updated Document Request';
      case 'DELETE_PROPOSAL': return 'Deleted Proposal';
      // Add new action types for ambulance bookings
      case 'AMBULANCE_BOOKING_ACCEPTED': return 'Accepted Ambulance Booking';
      case 'AMBULANCE_BOOKING_CANCELLED': return 'Cancelled Ambulance Booking';
      case 'AMBULANCE_BOOKING_COMPLETED': return 'Completed Ambulance Booking';
      case 'AMBULANCE_BOOKING_NEEDS_APPROVAL': return 'Requested Diesel Cost Approval';
      case 'AMBULANCE_BOOKING_UPDATED': return 'Updated Ambulance Booking';
      // Add new action types for court reservations
      case 'COURT_RESERVATION_APPROVED': return 'Approved Court Reservation';
      case 'COURT_RESERVATION_REJECTED': return 'Rejected Court Reservation';
      case 'COURT_RESERVATION_CANCELLED': return 'Cancelled Court Reservation';
      case 'COURT_RESERVATION_UPDATED': return 'Updated Court Reservation';
      default: return action.replace(/_/g, ' ').toLowerCase();
    }
  };
  
  // Get action chip color
  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE_ANNOUNCEMENT': return 'primary';
      case 'UPDATE_ANNOUNCEMENT': return 'warning';
      case 'DELETE_ANNOUNCEMENT': return 'error';
      case 'UPDATE_REPORT_STATUS': return 'info';
      case 'CANCEL_REPORT': return 'error';
      case 'UPDATE_PROPOSAL_STATUS': return 'success';
      case 'UPDATE_DOCUMENT_REQUEST_STATUS': return 'secondary';
      case 'DELETE_PROPOSAL': return 'error';
      // Add colors for ambulance booking actions
      case 'AMBULANCE_BOOKING_ACCEPTED': return 'success';
      case 'AMBULANCE_BOOKING_CANCELLED': return 'error';
      case 'AMBULANCE_BOOKING_COMPLETED': return 'primary';
      case 'AMBULANCE_BOOKING_NEEDS_APPROVAL': return 'warning';
      case 'AMBULANCE_BOOKING_UPDATED': return 'info';
      // Add colors for court reservation actions
      case 'COURT_RESERVATION_APPROVED': return 'success';
      case 'COURT_RESERVATION_REJECTED': return 'error';
      case 'COURT_RESERVATION_CANCELLED': return 'error';
      case 'COURT_RESERVATION_UPDATED': return 'info';
      default: return 'default';
    }
  };

  // Get entity type label
  const getEntityTypeLabel = (entityType) => {
    switch(entityType) {
      case 'Announcement': return 'Announcement';
      case 'Report': return 'Infrastructure Report';
      case 'ProjectProposal': return 'Project Proposal';
      case 'DocumentRequest': return 'Document Request';
      case 'AmbulanceBooking': return 'Ambulance Booking';
      case 'CourtReservation': return 'Court Reservation';
      case 'Other': return 'Other';
      default: return entityType;
    }
  };

  // Get entity type color
  const getEntityTypeColor = (entityType) => {
    switch(entityType) {
      case 'Announcement': return 'primary';
      case 'Report': return 'info';
      case 'ProjectProposal': return 'success';
      case 'DocumentRequest': return 'secondary';
      case 'AmbulanceBooking': return 'error';
      case 'CourtReservation': return 'warning';
      case 'Other': return 'default';
      default: return 'default';
    }
  };

  // Extract service ID from details string if present
  const extractServiceId = (details) => {
    // First try to match Service ID pattern
    const serviceIdRegex = /\(Service ID: ([a-zA-Z0-9-]+)\)/i;
    const serviceIdMatch = details.match(serviceIdRegex);
    
    if (serviceIdMatch) {
      return serviceIdMatch[1];
    }
    
    // If no Service ID is found, try to match the MongoDB ID pattern
    const idRegex = /\(ID: ([a-f\d]{24})\)/i;
    const idMatch = details.match(idRegex);
    return idMatch ? idMatch[1] : null;
  };

  // Copy ID to clipboard
  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Pagination logic
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Get current logs for the page
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  // Toggle filter section on mobile
  const toggleFilter = () => {
    setFilterExpanded(!filterExpanded);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Activity Logs
        </Typography>
        
        {currentAdmin && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Logged in as: <strong>{currentAdmin}</strong>
          </Alert>
        )}
        
        {/* Mobile filter toggle */}
        {isMobile && (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={toggleFilter}
            startIcon={filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 2 }}
          >
            {filterExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        )}
        
        {/* Filter section */}
        <Box sx={{ 
          display: isMobile && !filterExpanded ? 'none' : 'block',
          mb: 3,
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Filter Logs
            </Typography>
          </Box>
          
          <form onSubmit={handleFilter}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Admin</InputLabel>
                  <Select
                    value={adminFilter}
                    label="Admin"
                    onChange={(e) => setAdminFilter(e.target.value)}
                  >
                    <MenuItem value="">All Admins</MenuItem>
                    {uniqueAdmins.map(admin => (
                      <MenuItem key={admin} value={admin}>{admin}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={actionFilter}
                    label="Action"
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <MenuItem value="">All Actions</MenuItem>
                    {uniqueActions.map(action => (
                      <MenuItem key={action} value={action}>{getActionLabel(action)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* New entity type filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={entityTypeFilter}
                    label="Service Type"
                    onChange={(e) => setEntityTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">All Service Types</MenuItem>
                    {allEntityTypes.map(type => (
                      <MenuItem key={type} value={type}>{getEntityTypeLabel(type)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              mt: 2,
              gap: 1,
              flexWrap: 'wrap'
            }}>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={clearFilters}
                startIcon={<ClearAllIcon />}
                size={isMobile ? "small" : "medium"}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<FilterListIcon />}
                size={isMobile ? "small" : "medium"}
              >
                Apply Filters
              </Button>
            </Box>
          </form>
        </Box>
        
        {/* Logs summary */}
        {!loading && !error && logs.length > 0 && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Total Logs:</strong> {logs.length}
              </Typography>
              
              {adminFilter && (
                <Chip 
                  size="small" 
                  icon={<PersonIcon />} 
                  label={`Admin: ${adminFilter}`}
                  onDelete={() => {
                    setAdminFilter('');
                    fetchLogs({ 
                      startDate, 
                      endDate, 
                      action: actionFilter,
                      entityType: entityTypeFilter 
                    });
                  }}
                />
              )}
              
              {actionFilter && (
                <Chip 
                  size="small" 
                  icon={<EventNoteIcon />} 
                  label={`Action: ${getActionLabel(actionFilter)}`}
                  onDelete={() => {
                    setActionFilter('');
                    fetchLogs({ 
                      startDate, 
                      endDate, 
                      adminName: adminFilter,
                      entityType: entityTypeFilter 
                    });
                  }}
                />
              )}
              
              {/* Entity type filter chip */}
              {entityTypeFilter && (
                <Chip 
                  size="small" 
                  icon={<CategoryIcon />} 
                  label={`Service: ${getEntityTypeLabel(entityTypeFilter)}`}
                  color={getEntityTypeColor(entityTypeFilter)}
                  onDelete={() => {
                    setEntityTypeFilter('');
                    fetchLogs({ 
                      startDate, 
                      endDate, 
                      adminName: adminFilter,
                      action: actionFilter
                    });
                  }}
                />
              )}
              
              {(startDate || endDate) && (
                <Chip 
                  size="small" 
                  icon={<CalendarTodayIcon />} 
                  label={`Date range applied`}
                  onDelete={() => {
                    setStartDate('');
                    setEndDate('');
                    fetchLogs({ 
                      adminName: adminFilter, 
                      action: actionFilter,
                      entityType: entityTypeFilter
                    });
                  }}
                />
              )}
            </Box>
          </Alert>
        )}
        
        {/* Logs display section */}
        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : logs.length === 0 ? (
            <Alert severity="info">No activity logs found.</Alert>
          ) : (
            <>
              {/* Table view for desktop/tablet */}
              {!isMobile && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Service Type</TableCell> {/* New column for entity type */}
                        <TableCell>Details</TableCell>
                        <TableCell>Service ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentLogs.map((log) => {
                        const serviceId = extractServiceId(log.details);
                        return (
                          <TableRow key={log._id} hover>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{log.adminName}</TableCell>
                            <TableCell>
                              <Chip 
                                label={getActionLabel(log.action)}
                                size="small"
                                color={getActionColor(log.action)}
                                variant="outlined"
                              />
                            </TableCell>
                            {/* Entity type cell */}
                            <TableCell>
                              <Chip 
                                label={getEntityTypeLabel(log.entityType)}
                                size="small"
                                color={getEntityTypeColor(log.entityType)}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell>
                              {serviceId ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ mr: 1 }}>
                                    {serviceId.length > 10 ? `${serviceId.substring(0, 8)}...` : serviceId}
                                  </Typography>
                                  <Tooltip title={copiedId === serviceId ? "Copied!" : "Copy ID"}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => copyToClipboard(serviceId)}
                                      color={copiedId === serviceId ? "success" : "default"}
                                    >
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Card view for mobile */}
              {isMobile && (
                <Box sx={{ mb: 3 }}>
                  {currentLogs.map((log) => {
                    const serviceId = extractServiceId(log.details);
                    return (
                      <Card key={log._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(log.timestamp).toLocaleString()}
                            </Typography>
                            <Chip 
                              label={getActionLabel(log.action)}
                              size="small"
                              color={getActionColor(log.action)}
                            />
                          </Box>
                          
                          <Divider sx={{ mb: 1 }} />
                          
                          <Typography variant="subtitle2" gutterBottom>
                            <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {log.adminName}
                          </Typography>
                          
                          {/* Entity type display in mobile view */}
                          <Box sx={{ mb: 1, mt: 1 }}>
                            <Chip 
                              label={getEntityTypeLabel(log.entityType)}
                              size="small"
                              color={getEntityTypeColor(log.entityType)}
                              variant="outlined"
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {log.details}
                          </Typography>
                          
                          {serviceId && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" sx={{ mr: 1 }}>
                                ID: {serviceId.length > 10 ? `${serviceId.substring(0, 8)}...` : serviceId}
                              </Typography>
                              <Tooltip title={copiedId === serviceId ? "Copied!" : "Copy ID"}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => copyToClipboard(serviceId)}
                                  color={copiedId === serviceId ? "success" : "default"}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default AdminLogs;
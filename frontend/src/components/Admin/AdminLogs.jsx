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
  Pagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [uniqueAdmins, setUniqueAdmins] = useState([]);
  const [uniqueActions, setUniqueActions] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`http://localhost:3002/logs${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data);
      
      // Calculate total pages
      setTotalPages(Math.ceil(data.length / logsPerPage));
      
      // Extract unique admins and actions for filters
      const admins = [...new Set(data.map(log => log.adminName))];
      const actions = [...new Set(data.map(log => log.action))];
      
      setUniqueAdmins(admins);
      setUniqueActions(actions);
      
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
      action: actionFilter
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
      default: return 'default';
    }
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
                    fetchLogs({ startDate, endDate, action: actionFilter });
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
                    fetchLogs({ startDate, endDate, adminName: adminFilter });
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
                    fetchLogs({ adminName: adminFilter, action: actionFilter });
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
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentLogs.map((log) => (
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
                          <TableCell>{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Card view for mobile */}
              {isMobile && (
                <Box sx={{ mb: 3 }}>
                  {currentLogs.map((log) => (
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
                        
                        <Typography variant="body2">
                          {log.details}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
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
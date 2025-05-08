import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { MoreVert, Description, PeopleAlt, LocalHospital, SportsTennis, Assignment, Announcement, FormatListBulleted } from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// API base URL - change this to match your backend URL
const API_BASE_URL = 'http://localhost:3002';

// Utility function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Utility function to format time
const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString('en-US', options);
};

// Utility function for date range
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { 
    startDate: start.toISOString().split('T')[0], 
    endDate: end.toISOString().split('T')[0] 
  };
};

const AdminDashboard = () => {
  // State variables for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState(30); // Default to 30 days
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Statistics state
  const [stats, setStats] = useState({
    todayRequests: 0,
    residentCount: 0
  });
  
  // Data for service-specific analytics
  const [serviceData, setServiceData] = useState({
    ambulance: { total: 0, pending: 0, booked: 0, completed: 0, cancelled: 0 },
    court: { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    documents: { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 },
    reports: { total: 0, pending: 0, inProgress: 0, resolved: 0, cancelled: 0 },
    proposals: { total: 0, pending: 0, inReview: 0, considered: 0, approved: 0, rejected: 0 }
  });
  
  // Time series data
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [serviceDistribution, setServiceDistribution] = useState([]);
  const [requestTrends, setRequestTrends] = useState([]);
  
  // Recent activity data
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Resident data
  const [residentTypes, setResidentTypes] = useState([]);
  const [residentRegistrationTrends, setResidentRegistrationTrends] = useState([]);

  // Menu handling
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Tab handling
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Time range handling
  const handleTimeRangeChange = (event) => {
    setTimeRange(parseInt(event.target.value));
    fetchData(parseInt(event.target.value));
  };

  // Fix for the dashboard data loading error
// Moving the residents variable initialization before it's used in setStats

// Complete fixed fetchData function with error handling
const fetchData = async (days = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange(days);
      
      // Create fetch options with credentials to send cookies
      const fetchOptions = {
        method: 'GET',
        credentials: 'include', // Important: This sends cookies with the request
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // Fetch all data using Promise.all for better performance
      let responses;
      try {
        responses = await Promise.all([
          fetch(`${API_BASE_URL}/ambulance?startDate=${startDate}&endDate=${endDate}`, fetchOptions),
          fetch(`${API_BASE_URL}/court?startDate=${startDate}&endDate=${endDate}`, fetchOptions),
          fetch(`${API_BASE_URL}/documents?startDate=${startDate}&endDate=${endDate}`, fetchOptions),
          fetch(`${API_BASE_URL}/reports`, fetchOptions),
          fetch(`${API_BASE_URL}/proposals?startDate=${startDate}&endDate=${endDate}`, fetchOptions),
          fetch(`${API_BASE_URL}/residents?limit=100000`, fetchOptions),
          fetch(`${API_BASE_URL}/logs?limit=10`, fetchOptions)
        ]);
      } catch (fetchError) {
        console.error('Error fetching data:', fetchError);
        throw new Error('Network error when fetching data');
      }
      
      const [
        ambulanceRes, 
        courtRes, 
        docRes, 
        reportRes, 
        proposalRes, 
        residentRes,
        logsRes
      ] = responses;
      
      // Parse all response data with proper error handling
      let ambulanceData, courtData, docData, reportData, proposalData, residentData, logsData;
      
      try {
        // Use conditional chaining to handle potential errors in each fetch response
        ambulanceData = ambulanceRes.ok ? await ambulanceRes.json() : [];
        courtData = courtRes.ok ? await courtRes.json() : [];
        docData = docRes.ok ? await docRes.json() : { documentRequests: [] };
        reportData = reportRes.ok ? await reportRes.json() : { reports: [] };
        proposalData = proposalRes.ok ? await proposalRes.json() : { proposals: [] };
        residentData = residentRes.ok ? await residentRes.json() : { data: [] };
        logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
      } catch (parseError) {
        console.error('Error parsing response data:', parseError);
        throw new Error('Error parsing server response');
      }
      
      console.log('Fetched data:', {
        ambulance: ambulanceData,
        court: courtData,
        docs: docData,
        reports: reportData,
        proposals: proposalData,
        residents: residentData,
        logs: logsData
      });
      
      // Process ambulance data with safe accesses
      const ambulanceStats = {
        total: Array.isArray(ambulanceData) ? ambulanceData.length : 0,
        pending: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'pending').length : 0,
        booked: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'booked').length : 0,
        completed: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'completed').length : 0,
        cancelled: Array.isArray(ambulanceData) ? ambulanceData.filter(item => item && item.status === 'cancelled').length : 0
      };
      
      // Process court data with safe accesses
      const courtStats = {
        total: Array.isArray(courtData) ? courtData.length : 0,
        pending: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'pending').length : 0,
        approved: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'approved').length : 0,
        rejected: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'rejected').length : 0,
        cancelled: Array.isArray(courtData) ? courtData.filter(item => item && item.status === 'cancelled').length : 0
      };
      
      // Process document data with safe accesses
      const docRequests = docData && Array.isArray(docData.documentRequests) ? docData.documentRequests : [];
      const docStats = {
        total: docRequests.length,
        pending: docRequests.filter(item => item && item.status === 'pending').length,
        inProgress: docRequests.filter(item => item && item.status === 'in_progress').length,
        completed: docRequests.filter(item => item && item.status === 'completed').length,
        rejected: docRequests.filter(item => item && item.status === 'rejected').length
      };
      
      // Process report data with safe accesses
      const reports = reportData && Array.isArray(reportData.reports) ? reportData.reports : [];
      const reportStats = {
        total: reports.length,
        pending: reports.filter(item => item && item.status === 'Pending').length,
        inProgress: reports.filter(item => item && item.status === 'In Progress').length,
        resolved: reports.filter(item => item && item.status === 'Resolved').length,
        cancelled: reports.filter(item => item && item.status === 'Cancelled').length
      };
      
      // Process proposal data with safe accesses
      const proposals = proposalData && Array.isArray(proposalData.proposals) ? proposalData.proposals : [];
      const proposalStats = {
        total: proposals.length,
        pending: proposals.filter(item => item && item.status === 'pending').length,
        inReview: proposals.filter(item => item && item.status === 'in_review').length,
        considered: proposals.filter(item => item && item.status === 'considered').length,
        approved: proposals.filter(item => item && item.status === 'approved').length,
        rejected: proposals.filter(item => item && item.status === 'rejected').length
      };
      
      // Calculate today's requests
      const today = new Date().toISOString().split('T')[0];
      
      // Safe array operations
      const todayAmbulance = Array.isArray(ambulanceData) ? 
        ambulanceData.filter(item => item && item.createdAt && item.createdAt.startsWith(today)).length : 0;
      
      const todayCourt = Array.isArray(courtData) ? 
        courtData.filter(item => item && item.createdAt && item.createdAt.startsWith(today)).length : 0;
      
      const todayDocs = docRequests.filter(item => 
        item && item.createdAt && item.createdAt.startsWith(today)
      ).length;
      
      const todayReports = reports.filter(item => 
        item && item.createdAt && item.createdAt.startsWith(today)
      ).length;
      
      const todayProposals = proposals.filter(item => 
        item && item.createdAt && item.createdAt.startsWith(today)
      ).length;
      
      const todayRequests = todayAmbulance + todayCourt + todayDocs + todayReports + todayProposals;
      
      // Process resident data - IMPORTANT: This needs to be defined before using it
      const residents = residentData && residentData.data ? residentData.data : [];
      
      // Handle resident counts safely
      // Count verified residents - those with isVerified = true
        const verifiedCount = residents.filter(resident => resident && resident.isVerified === true).length;
        // For voter count, ONLY count voters who are ALSO verified
        // This ensures unverified voters don't count toward the voter count
        const voterCount = residents.filter(resident => 
            resident && resident.isVerified === true && resident.isVoter === true
        ).length;
        // For pending count, only count residents with isVerified = false (unverified)
        const pendingCount = residents.filter(resident => 
            resident && resident.isVerified === false
        ).length;
      
      // Log detailed counts for debugging
        console.log("Resident counts:", {
            total: residents.length,
            verified: verifiedCount,
            verifiedVoters: voterCount,
            pending: pendingCount
        });
      
      // Update the stats state with the correct counts
        setStats({
            todayRequests,
            residentCount: residents.length,
            verifiedCount,
            voterCount,
            pendingCount
        });
      
      // Update service data state
      setServiceData({
        ambulance: ambulanceStats,
        court: courtStats,
        documents: docStats,
        reports: reportStats,
        proposals: proposalStats
      });
      
      // Generate time series data for trend analysis
      const dateMap = new Map();
      
      // Initialize dates for the past X days
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dateMap.set(dateStr, {
          date: dateStr,
          ambulance: 0,
          court: 0,
          documents: 0,
          reports: 0,
          proposals: 0,
          total: 0
        });
      }
      
      // Count requests by date for each service with safe accesses
      if (Array.isArray(ambulanceData)) {
        ambulanceData.forEach(booking => {
          if (booking && booking.createdAt) {
            const dateStr = new Date(booking.createdAt).toISOString().split('T')[0];
            if (dateMap.has(dateStr)) {
              const dayData = dateMap.get(dateStr);
              dayData.ambulance += 1;
              dayData.total += 1;
              dateMap.set(dateStr, dayData);
            }
          }
        });
      }
      
      if (Array.isArray(courtData)) {
        courtData.forEach(reservation => {
          if (reservation && reservation.createdAt) {
            const dateStr = new Date(reservation.createdAt).toISOString().split('T')[0];
            if (dateMap.has(dateStr)) {
              const dayData = dateMap.get(dateStr);
              dayData.court += 1;
              dayData.total += 1;
              dateMap.set(dateStr, dayData);
            }
          }
        });
      }
      
      docRequests.forEach(doc => {
        if (doc && doc.createdAt) {
          const dateStr = new Date(doc.createdAt).toISOString().split('T')[0];
          if (dateMap.has(dateStr)) {
            const dayData = dateMap.get(dateStr);
            dayData.documents += 1;
            dayData.total += 1;
            dateMap.set(dateStr, dayData);
          }
        }
      });
      
      reports.forEach(report => {
        if (report && report.createdAt) {
          const dateStr = new Date(report.createdAt).toISOString().split('T')[0];
          if (dateMap.has(dateStr)) {
            const dayData = dateMap.get(dateStr);
            dayData.reports += 1;
            dayData.total += 1;
            dateMap.set(dateStr, dayData);
          }
        }
      });
      
      proposals.forEach(proposal => {
        if (proposal && proposal.createdAt) {
          const dateStr = new Date(proposal.createdAt).toISOString().split('T')[0];
          if (dateMap.has(dateStr)) {
            const dayData = dateMap.get(dateStr);
            dayData.proposals += 1;
            dayData.total += 1;
            dateMap.set(dateStr, dayData);
          }
        }
      });
      
      // Convert Map to array and sort by date
      const timeSeriesArray = Array.from(dateMap.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setTimeSeriesData(timeSeriesArray);
      
      // Create service distribution data for pie chart
      setServiceDistribution([
        { name: 'Ambulance', value: ambulanceStats.total },
        { name: 'Court', value: courtStats.total },
        { name: 'Documents', value: docStats.total },
        { name: 'Reports', value: reportStats.total },
        { name: 'Proposals', value: proposalStats.total }
      ]);
      
      // Create request trends data
      const weekData = timeSeriesArray.slice(-7);
      const monthData = timeSeriesArray;
      
      const weeklyAvg = weekData.reduce((acc, curr) => acc + curr.total, 0) / Math.max(weekData.length, 1);
      const monthlyAvg = monthData.reduce((acc, curr) => acc + curr.total, 0) / Math.max(monthData.length, 1);
      
      setRequestTrends([
        { name: 'Today', value: todayRequests },
        { name: 'Weekly Avg', value: weeklyAvg.toFixed(1) },
        { name: 'Monthly Avg', value: monthlyAvg.toFixed(1) }
      ]);
      
      // Count residents by type - ensure all types are counted separately
      const typeCounter = {
        'Minor': 0,
        '18-30': 0,
        'Illiterate': 0, 
        'PWD': 0,
        'Senior Citizen': 0,
        'Indigent': 0
      };
      
      // Count each type individually with safe access
      residents
        .filter(resident => resident && resident.isVerified === true) // Filter for verified residents only
        .forEach(resident => {
            if (resident && resident.types && Array.isArray(resident.types)) {
            resident.types.forEach(type => {
                // Increment counter for this specific type
                if (typeCounter.hasOwnProperty(type)) {
                typeCounter[type] += 1;
                }
            });
            }
        });
      
      // Log the type counter for debugging
      console.log("Verified residents type counter:", typeCounter);
      
      // Create type data for charts - filter out zero values
    const residentTypeData = Object.entries(typeCounter)
        .filter(([name, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));
      
      setResidentTypes(residentTypeData);
      
      // Create resident registration trends data
      // Group residents by registration month
      const registrationDateMap = new Map();
  
      // Initialize last 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        registrationDateMap.set(monthYear, {
          month: monthYear,
          residents: 0
        });
      }
  
      // Count registrations by month with safe access
      residents
        .filter(resident => resident && resident.isVerified === true) // Filter for verified residents only
        .forEach(resident => {
            if (resident && resident.createdAt) {
            const date = new Date(resident.createdAt);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (registrationDateMap.has(monthYear)) {
                const monthData = registrationDateMap.get(monthYear);
                monthData.residents += 1;
                registrationDateMap.set(monthYear, monthData);
            }
            }
        });
  
      // Convert Map to array and sort by date
    const registrationTrendsArray = Array.from(registrationDateMap.values())
        .sort((a, b) => {
            try {
            const [aMonth, aYear] = a.month.split(' ');
            const [bMonth, bYear] = b.month.split(' ');
            const aDate = new Date(`${aMonth} 1, ${aYear}`);
            const bDate = new Date(`${bMonth} 1, ${bYear}`);
            return aDate - bDate;
            } catch (e) {
            console.error('Error sorting registration trends:', e);
            return 0;
            }
        });
  
      setResidentRegistrationTrends(registrationTrendsArray);
      
      // Process logs for recent activity with safe accesses
      if (logsData && Array.isArray(logsData.logs) && logsData.logs.length > 0) {
        // Use actual logs from backend
        const formattedLogs = logsData.logs.map(log => ({
          id: log._id || `log-${Math.random()}`,
          type: log.entityType || (log.action ? log.action.split('_')[0] : 'Activity'),
          action: log.action || 'ACTIVITY',
          details: log.details || 'System activity',
          admin: log.adminName || 'System',
          timestamp: new Date(log.timestamp || log.createdAt || Date.now())
        })).slice(0, 10); // Get 10 most recent
        
        setRecentActivity(formattedLogs);
      } else if (Array.isArray(ambulanceData) && ambulanceData.length > 0 || 
                 Array.isArray(courtData) && courtData.length > 0) {
        // If no logs, create activity from recent requests
        const activities = [];
        
        // Add recent ambulance bookings
        if (Array.isArray(ambulanceData)) {
          ambulanceData.slice(0, 3).forEach(booking => {
            if (booking && booking.createdAt) {
              activities.push({
                id: booking._id || `amb-${Math.random()}`,
                type: 'Ambulance',
                action: 'BOOKING_CREATED',
                details: `Ambulance booking for ${booking.patientName || 'Unknown'}`,
                admin: booking.processedBy ? 
                  `${booking.processedBy.firstName || ''} ${booking.processedBy.lastName || ''}` : 
                  'System',
                timestamp: new Date(booking.createdAt)
              });
            }
          });
        }
        
        // Add recent court reservations
        if (Array.isArray(courtData)) {
          courtData.slice(0, 3).forEach(reservation => {
            if (reservation && reservation.createdAt) {
              activities.push({
                id: reservation._id || `court-${Math.random()}`,
                type: 'Court',
                action: 'RESERVATION_CREATED',
                details: `Court reservation by ${reservation.representativeName || 'Unknown'}`,
                admin: reservation.processedBy ? 
                  `${reservation.processedBy.firstName || ''} ${reservation.processedBy.lastName || ''}` : 
                  'System',
                timestamp: new Date(reservation.createdAt)
              });
            }
          });
        }
        
        // Sort by timestamp and take top 10
        activities.sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivity(activities.slice(0, 10));
      } else {
        // Fallback with sample data if no real data is available
        setRecentActivity([
          { id: '1', type: 'Ambulance', action: 'BOOKING_CREATED', details: 'New ambulance booking', admin: 'Admin', timestamp: new Date() },
          { id: '2', type: 'Document', action: 'REQUEST_APPROVED', details: 'Document request approved', admin: 'Admin', timestamp: new Date(Date.now() - 3600000) },
          { id: '3', type: 'Court', action: 'RESERVATION_CANCELLED', details: 'Court reservation cancelled', admin: 'Admin', timestamp: new Date(Date.now() - 7200000) }
        ]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData(timeRange);
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchData(timeRange);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }
  
  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    pending: '#FFBB28',
    booked: '#00C49F',
    completed: '#0088FE',
    cancelled: '#FF8042',
    rejected: '#d32f2f',
    inProgress: '#8884d8',
    inReview: '#82ca9d',
    considered: '#ffc658',
    approved: '#0088FE',
    resolved: '#0088FE'
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Brgy Maahas Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
              <MenuItem value={365}>Last year</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              fetchData(timeRange);
              handleMenuClose();
            }}>Refresh Data</MenuItem>
            <MenuItem onClick={handleMenuClose}>Export Report</MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Only keep the requested overview cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ minHeight: 120 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Requests
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.todayRequests}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                New today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ minHeight: 120 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Registered Residents
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.residentCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total in database
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different analytics views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<FormatListBulleted />} label="Overview" />
          <Tab icon={<LocalHospital />} label="Ambulance" />
          <Tab icon={<SportsTennis />} label="Court" />
          <Tab icon={<Description />} label="Documents" />
          <Tab icon={<Assignment />} label="Reports" />
          <Tab icon={<Announcement />} label="Proposals" />
          <Tab icon={<PeopleAlt />} label="Residents" />
        </Tabs>
        
        <Divider />
        
        {/* Tab content areas */}
        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Service Request Trends */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Service Request Trends</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'total' ? 'Total' : name.charAt(0).toUpperCase() + name.slice(1)]}
                        labelFormatter={(date) => formatDate(date)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
                      <Line type="monotone" dataKey="ambulance" stroke="#0088FE" name="Ambulance" />
                      <Line type="monotone" dataKey="court" stroke="#00C49F" name="Court" />
                      <Line type="monotone" dataKey="documents" stroke="#FFBB28" name="Documents" />
                      <Line type="monotone" dataKey="reports" stroke="#FF8042" name="Reports" />
                      <Line type="monotone" dataKey="proposals" stroke="#82ca9d" name="Proposals" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              {/* Service Distribution */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Service Distribution</Typography>
                <Paper sx={{ p: 2, height: 450, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Distribution of service requests across different categories
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Request Status Overview */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Request Status Overview</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Ambulance',
                          pending: serviceData.ambulance.pending,
                          inProgress: serviceData.ambulance.booked,
                          completed: serviceData.ambulance.completed,
                          cancelled: serviceData.ambulance.cancelled
                        },
                        {
                          name: 'Court',
                          pending: serviceData.court.pending,
                          approved: serviceData.court.approved,
                          rejected: serviceData.court.rejected,
                          cancelled: serviceData.court.cancelled
                        },
                        {
                          name: 'Documents',
                          pending: serviceData.documents.pending,
                          inProgress: serviceData.documents.inProgress,
                          completed: serviceData.documents.completed,
                          rejected: serviceData.documents.rejected
                        },
                        {
                          name: 'Reports',
                          pending: serviceData.reports.pending,
                          inProgress: serviceData.reports.inProgress,
                          resolved: serviceData.reports.resolved,
                          cancelled: serviceData.reports.cancelled
                        },
                        {
                          name: 'Proposals',
                          pending: serviceData.proposals.pending,
                          inReview: serviceData.proposals.inReview,
                          considered: serviceData.proposals.considered,
                          approved: serviceData.proposals.approved,
                          rejected: serviceData.proposals.rejected
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
                      <Bar dataKey="inProgress" stackId="a" fill={STATUS_COLORS.inProgress} name="In Progress" />
                      <Bar dataKey="inReview" stackId="a" fill={STATUS_COLORS.inReview} name="In Review" />
                      <Bar dataKey="considered" stackId="a" fill={STATUS_COLORS.considered} name="Considered" />
                      <Bar dataKey="approved" stackId="a" fill={STATUS_COLORS.approved} name="Approved" />
                      <Bar dataKey="completed" stackId="a" fill={STATUS_COLORS.completed} name="Completed" />
                      <Bar dataKey="resolved" stackId="a" fill={STATUS_COLORS.resolved} name="Resolved" />
                      <Bar dataKey="rejected" stackId="a" fill={STATUS_COLORS.rejected} name="Rejected" />
                      <Bar dataKey="cancelled" stackId="a" fill={STATUS_COLORS.cancelled} name="Cancelled" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Ambulance Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Ambulance Booking Status</Typography>
                <Paper sx={{ p: 2, height: 450, width: '94%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.ambulance.pending },
                          { name: 'Booked', value: serviceData.ambulance.booked },
                          { name: 'Completed', value: serviceData.ambulance.completed },
                          { name: 'Cancelled', value: serviceData.ambulance.cancelled }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.booked} />
                        <Cell fill={STATUS_COLORS.completed} />
                        <Cell fill={STATUS_COLORS.cancelled} />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Ambulance Booking Trends</Typography>
                <Paper sx={{ p: 2, height: 450, width: '93%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Bookings']}
                        labelFormatter={(date) => formatDate(date)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="ambulance" stroke="#0088FE" name="Ambulance Bookings" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Ambulance Usage Statistics</Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Bookings
                          </Typography>
                          <Typography variant="h4">
                            {serviceData.ambulance.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Pending
                          </Typography>
                          <Typography variant="h4" color="warning.main">
                            {serviceData.ambulance.pending}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Booked
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {serviceData.ambulance.booked}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Completion Rate
                          </Typography>
                          <Typography variant="h4" color="info.main">
                            {serviceData.ambulance.total > 0 
                              ? `${((serviceData.ambulance.completed / serviceData.ambulance.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Court Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Court Reservation Status</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.court.pending },
                          { name: 'Approved', value: serviceData.court.approved },
                          { name: 'Rejected', value: serviceData.court.rejected },
                          { name: 'Cancelled', value: serviceData.court.cancelled }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.approved} />
                        <Cell fill={STATUS_COLORS.rejected} />
                        <Cell fill={STATUS_COLORS.cancelled} />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Court Reservation Trends</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Reservations']}
                        labelFormatter={(date) => formatDate(date)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="court" stroke="#00C49F" name="Court Reservations" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Court Usage Statistics</Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Reservations
                          </Typography>
                          <Typography variant="h4">
                            {serviceData.court.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Approval Rate
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {serviceData.court.total > 0 
                              ? `${((serviceData.court.approved / serviceData.court.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Rejection Rate
                          </Typography>
                          <Typography variant="h4" color="error.main">
                            {serviceData.court.total > 0 
                              ? `${((serviceData.court.rejected / serviceData.court.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Cancellation Rate
                          </Typography>
                          <Typography variant="h4" color="warning.main">
                            {serviceData.court.total > 0 
                              ? `${((serviceData.court.cancelled / serviceData.court.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Documents Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Document Request Status</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.documents.pending },
                          { name: 'In Progress', value: serviceData.documents.inProgress },
                          { name: 'Completed', value: serviceData.documents.completed },
                          { name: 'Rejected', value: serviceData.documents.rejected }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.inProgress} />
                        <Cell fill={STATUS_COLORS.completed} />
                        <Cell fill={STATUS_COLORS.rejected} />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Document Request Trends</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Requests']}
                        labelFormatter={(date) => formatDate(date)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="documents" stroke="#FFBB28" name="Document Requests" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Popular Document Types</Typography>
                <Paper sx={{ p: 2, height: 400 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    This chart shows distribution of document types requested by residents
                  </Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart
                      data={[
                        { name: 'Brgy Clearance', value: 35 },
                        { name: 'Certificate of Residency', value: 28 },
                        { name: 'Indigency Certificate', value: 15 },
                        { name: 'Business Permit', value: 12 },
                        { name: 'Other Documents', value: 10 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FFBB28" name="Document Requests">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" color="textSecondary">
                    * Sample data placeholder. Connect to actual document types from your database for production.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Reports Tab */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Infrastructure Report Status</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.reports.pending },
                          { name: 'In Progress', value: serviceData.reports.inProgress },
                          { name: 'Resolved', value: serviceData.reports.resolved },
                          { name: 'Cancelled', value: serviceData.reports.cancelled }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.inProgress} />
                        <Cell fill={STATUS_COLORS.resolved} />
                        <Cell fill={STATUS_COLORS.cancelled} />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Issue Types</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Distribution of reported infrastructure issues
                  </Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart
                      data={[
                        { name: 'Road Damage', value: 25 },
                        { name: 'Drainage Issues', value: 20 },
                        { name: 'Street Lights', value: 15 },
                        { name: 'Waste Management', value: 12 },
                        { name: 'Other Issues', value: 8 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FF8042" name="Reports">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" color="textSecondary">
                    * Sample data placeholder. Connect to actual issue types from your database for production.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Report Resolution Time</Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Average Resolution Time
                          </Typography>
                          <Typography variant="h4" color="primary.main">
                            5.2 days
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            From submission to completion
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Resolution Rate
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {serviceData.reports.total > 0 
                              ? `${((serviceData.reports.resolved / serviceData.reports.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Successfully resolved reports
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Pending Reports
                          </Typography>
                          <Typography variant="h4" color="warning.main">
                            {serviceData.reports.pending}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Requiring attention
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            In Progress Reports
                          </Typography>
                          <Typography variant="h4" color="warning.main">
                            {serviceData.reports.inProgress}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Requiring updates
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Proposals Tab */}
          {tabValue === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Project Proposal Status</Typography>
                <Paper sx={{ p: 2, height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: serviceData.proposals.pending },
                          { name: 'In Review', value: serviceData.proposals.inReview },
                          { name: 'Considered', value: serviceData.proposals.considered },
                          { name: 'Approved', value: serviceData.proposals.approved },
                          { name: 'Rejected', value: serviceData.proposals.rejected }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={STATUS_COLORS.pending} />
                        <Cell fill={STATUS_COLORS.inReview} />
                        <Cell fill={STATUS_COLORS.considered} />
                        <Cell fill={STATUS_COLORS.approved} />
                        <Cell fill={STATUS_COLORS.rejected} />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Proposal Trends</Typography>
                <Paper sx={{ p: 2, height: 450, width:"94%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Proposals']}
                        labelFormatter={(date) => formatDate(date)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="proposals" stroke="#82ca9d" name="Project Proposals" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Proposal Metrics</Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Proposals
                          </Typography>
                          <Typography variant="h4">
                            {serviceData.proposals.total}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Approval Rate
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {serviceData.proposals.total > 0 
                              ? `${((serviceData.proposals.approved / serviceData.proposals.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Consideration Rate
                          </Typography>
                          <Typography variant="h4" color="info.main">
                            {serviceData.proposals.total > 0 
                              ? `${(((serviceData.proposals.considered + serviceData.proposals.inReview) / serviceData.proposals.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Rejection Rate
                          </Typography>
                          <Typography variant="h4" color="error.main">
                            {serviceData.proposals.total > 0 
                              ? `${((serviceData.proposals.rejected / serviceData.proposals.total) * 100).toFixed(1)}%` 
                              : '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
        {/* Residents Tab - Now with real data */}
        {tabValue === 6 && (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Resident Registration Trends</Typography>
            <Paper sx={{ p: 2, height: 450 }}>
                <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={residentRegistrationTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip 
                    formatter={(value) => [value, 'New Registrations']}
                    />
                    <Legend />
                    <Line 
                    type="monotone" 
                    dataKey="residents" 
                    stroke="#8884d8" 
                    name="New Registrations" 
                    strokeWidth={2} 
                    />
                </LineChart>
                </ResponsiveContainer>
            </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Resident Type Distribution</Typography>
            <Paper sx={{ p: 2, height: 450 }}>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={residentTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                    {residentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            </Paper>
            </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Resident Database Metrics</Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Residents
                          </Typography>
                          <Typography variant="h4">
                            {stats.residentCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Verified Residents
                          </Typography>
                            <Typography variant="h4" color="success.main">
                                {stats.verifiedCount}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                {stats.residentCount > 0 ? ((stats.verifiedCount / stats.residentCount) * 100).toFixed(1) : 0}% of total
                            </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                            Registered Voters
                             </Typography>
                            <Typography variant="h4" color="info.main">
                                {stats.voterCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {stats.verifiedCount > 0 ? ((stats.voterCount / stats.verifiedCount) * 100).toFixed(1) : 0}% of verified
                            </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                            Pending Verification
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {stats.pendingCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {stats.residentCount > 0 ? ((stats.pendingCount / stats.residentCount) * 100).toFixed(1) : 0}% of total
                            </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
      
        {/* Recent Activity */}
        <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        {recentActivity.length > 0 ? (
            <TableContainer>
            <Table size="small">
                <TableHead>
                <TableRow>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                    <TableCell><strong>Admin</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {recentActivity.map((activity, index) => (
                    <TableRow key={activity.id || index}>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>
                        {activity.action.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')}
                    </TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>{activity.admin}</TableCell>
                    <TableCell>
                        {formatDate(activity.timestamp)}, {formatTime(activity.timestamp)}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        ) : (
            <Box sx={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
                No recent activity found
            </Typography>
            </Box>
        )}
        </Paper>
      
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
            Last updated: {new Date().toLocaleString()}
            </Typography>
        </Box>
    </Box>
  );
};

export default AdminDashboard;
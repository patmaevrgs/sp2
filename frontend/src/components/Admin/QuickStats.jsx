import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  CircularProgress
} from '@mui/material';
import {
  Assessment,
  CheckCircle,
  Pending,
  Cancel,
  Timeline
} from '@mui/icons-material';

// Date formatter
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// API base URL
const API_BASE_URL = 'http://localhost:3002'; // Change this to match your backend URL

const QuickStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    mostActiveService: '',
    recentActivity: []
  });
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Create fetch options with credentials to send cookies
      const fetchOptions = {
        method: 'GET',
        credentials: 'include', // Important: This sends cookies with the request
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // Fetch all types of requests to aggregate for dashboard
      const [ambulanceRes, courtRes, docRes, reportRes, proposalRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ambulance`, fetchOptions),
        fetch(`${API_BASE_URL}/court`, fetchOptions),
        fetch(`${API_BASE_URL}/documents`, fetchOptions),
        fetch(`${API_BASE_URL}/reports`, fetchOptions),
        fetch(`${API_BASE_URL}/proposals`, fetchOptions),
        fetch(`${API_BASE_URL}/logs?limit=10`, fetchOptions) // Get 10 recent logs for more choices
      ]);
      
      // Check if any requests failed due to auth issues
      if (!ambulanceRes.ok || !courtRes.ok || !docRes.ok || !reportRes.ok || !proposalRes.ok) {
        console.error('Authentication error or API endpoint issue');
        setLoading(false);
        return;
      }
      
      // Parse the JSON responses
      const ambulanceData = await ambulanceRes.json();
      const courtData = await courtRes.json();
      const docData = await docRes.json();
      const reportData = await reportRes.json();
      const proposalData = await proposalRes.json();
      const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
      
      console.log('Fetched data:', {
        ambulance: ambulanceData,
        court: courtData,
        docs: docData,
        reports: reportData,
        proposals: proposalData,
        logs: logsData
      });
      
      // Calculate total requests
      const totalAmbulance = Array.isArray(ambulanceData) ? ambulanceData.length : 0;
      const totalCourt = Array.isArray(courtData) ? courtData.length : 0;
      const totalDocs = docData && docData.documentRequests ? docData.documentRequests.length : 0;
      const totalReports = reportData && reportData.reports ? reportData.reports.length : 0;
      const totalProposals = proposalData && proposalData.proposals ? proposalData.proposals.length : 0;
      
      const totalRequests = totalAmbulance + totalCourt + totalDocs + totalReports + totalProposals;
      
      // Calculate pending requests - be defensive with data access
      const pendingAmbulance = Array.isArray(ambulanceData) 
        ? ambulanceData.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingCourt = Array.isArray(courtData) 
        ? courtData.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingDocs = docData && docData.documentRequests 
        ? docData.documentRequests.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingReports = reportData && reportData.reports 
        ? reportData.reports.filter(item => item && item.status === 'Pending').length 
        : 0;
      
      const pendingProposals = proposalData && proposalData.proposals 
        ? proposalData.proposals.filter(item => item && item.status === 'pending').length 
        : 0;
      
      const pendingRequests = pendingAmbulance + pendingCourt + pendingDocs + pendingReports + pendingProposals;
      
      // Calculate approved/completed requests
      const approvedAmbulance = Array.isArray(ambulanceData) 
        ? ambulanceData.filter(item => item && ['booked', 'completed'].includes(item.status)).length 
        : 0;
      
      const approvedCourt = Array.isArray(courtData) 
        ? courtData.filter(item => item && item.status === 'approved').length 
        : 0;
      
      const approvedDocs = docData && docData.documentRequests 
        ? docData.documentRequests.filter(item => item && ['in_progress', 'completed'].includes(item.status)).length 
        : 0;
      
      const approvedReports = reportData && reportData.reports 
        ? reportData.reports.filter(item => item && ['In Progress', 'Resolved'].includes(item.status)).length 
        : 0;
      
      const approvedProposals = proposalData && proposalData.proposals 
        ? proposalData.proposals.filter(item => item && ['in_review', 'considered', 'approved'].includes(item.status)).length 
        : 0;
      
      const approvedRequests = approvedAmbulance + approvedCourt + approvedDocs + approvedReports + approvedProposals;
      
      // Calculate rejected/cancelled requests
      const rejectedAmbulance = Array.isArray(ambulanceData) 
        ? ambulanceData.filter(item => item && item.status === 'cancelled').length 
        : 0;
      
      const rejectedCourt = Array.isArray(courtData) 
        ? courtData.filter(item => item && ['rejected', 'cancelled'].includes(item.status)).length 
        : 0;
      
      const rejectedDocs = docData && docData.documentRequests 
        ? docData.documentRequests.filter(item => item && ['rejected', 'cancelled'].includes(item.status)).length 
        : 0;
      
      const rejectedReports = reportData && reportData.reports 
        ? reportData.reports.filter(item => item && item.status === 'Cancelled').length 
        : 0;
      
      const rejectedProposals = proposalData && proposalData.proposals 
        ? proposalData.proposals.filter(item => item && item.status === 'rejected').length 
        : 0;
      
      const rejectedRequests = rejectedAmbulance + rejectedCourt + rejectedDocs + rejectedReports + rejectedProposals;
      
      // Determine most active service
      const serviceCounts = [
        { name: 'Ambulance Bookings', count: totalAmbulance },
        { name: 'Court Reservations', count: totalCourt },
        { name: 'Document Requests', count: totalDocs },
        { name: 'Infrastructure Reports', count: totalReports },
        { name: 'Project Proposals', count: totalProposals }
      ];
      
      // Sort services by count for debugging
      console.log('Service counts sorted:', [...serviceCounts].sort((a, b) => b.count - a.count));
      
      const mostActiveService = serviceCounts.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current, { name: 'None', count: 0 }
      ).name;
      
      console.log('Most active service calculated:', mostActiveService);
      
      // Process recent activity - if logs API is available, use that
      let recentActivity = [];
      
      if (logsData && Array.isArray(logsData.logs) && logsData.logs.length > 0) {
        // Use actual logs if available
        recentActivity = logsData.logs.map(log => ({
          type: log.entityType || 'Activity',
          status: log.action || 'Updated',
          date: new Date(log.timestamp || log.createdAt),
          details: log.details || 'System activity'
        })).slice(0, 5);
        
        console.log('Using real logs for activity:', recentActivity);
      } else {
        // If no logs, aggregate recent items from other services
        const allItems = [];
        
        // Add recent ambulance bookings
        if (Array.isArray(ambulanceData)) {
          ambulanceData.forEach(booking => {
            if (booking && booking.createdAt) {
              allItems.push({
                type: 'Ambulance Booking',
                status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
                date: new Date(booking.createdAt),
                details: `Patient: ${booking.patientName || 'Unknown'}`
              });
            }
          });
        }
        
        // Add recent court reservations
        if (Array.isArray(courtData)) {
          courtData.forEach(reservation => {
            if (reservation && reservation.createdAt) {
              allItems.push({
                type: 'Court Reservation',
                status: reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1),
                date: new Date(reservation.createdAt),
                details: `By: ${reservation.representativeName || 'Unknown'}`
              });
            }
          });
        }
        
        // Add recent document requests
        if (docData && docData.documentRequests && Array.isArray(docData.documentRequests)) {
          docData.documentRequests.forEach(doc => {
            if (doc && doc.createdAt) {
              allItems.push({
                type: 'Document Request',
                status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace('_', ' '),
                date: new Date(doc.createdAt),
                details: `Type: ${doc.documentType ? doc.documentType.replace('_', ' ') : 'Unknown'}`
              });
            }
          });
        }
        
        // Add recent reports
        if (reportData && reportData.reports && Array.isArray(reportData.reports)) {
          reportData.reports.forEach(report => {
            if (report && report.createdAt) {
              allItems.push({
                type: 'Infrastructure Report',
                status: report.status || 'Submitted',
                date: new Date(report.createdAt),
                details: `Issue: ${report.issueType || 'General'}`
              });
            }
          });
        }
        
        // Add recent proposals
        if (proposalData && proposalData.proposals && Array.isArray(proposalData.proposals)) {
          proposalData.proposals.forEach(proposal => {
            if (proposal && proposal.createdAt) {
              allItems.push({
                type: 'Project Proposal',
                status: proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1).replace('_', ' '),
                date: new Date(proposal.createdAt),
                details: `Project: ${proposal.projectTitle || 'Untitled'}`
              });
            }
          });
        }
        
        console.log('All collected recent items:', allItems.length);
        
        // Sort all items by date (newest first) and take the first 5
        recentActivity = allItems
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);
        
        console.log('Processed recent activity:', recentActivity);
        
      }
      
      // Add this debug log right before setting the state
      console.log('Final stats being set:', {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        mostActiveService,
        recentActivity: recentActivity.length
      });
      
      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        mostActiveService,
        recentActivity
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Debug logging when stats change
  useEffect(() => {
    console.log('Stats updated:', {
      mostActiveService: stats.mostActiveService,
      recentActivity: stats.recentActivity.length
    });
  }, [stats]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Debug logs during render
  console.log('RENDER DATA:', {
    mostActiveService: stats.mostActiveService,
    recentActivityCount: stats.recentActivity.length,
    firstActivity: stats.recentActivity[0]
  });
  
  const statCards = [
    {
      title: 'Total Service Requests',
      value: stats.totalRequests,
      icon: <Assessment fontSize="large" color="primary" />,
      color: 'primary.main'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: <Pending fontSize="large" color="warning" />,
      color: 'warning.main'
    },
    {
      title: 'Approved/Completed',
      value: stats.approvedRequests,
      icon: <CheckCircle fontSize="large" color="success" />,
      color: 'success.main'
    },
    {
      title: 'Rejected/Cancelled',
      value: stats.rejectedRequests,
      icon: <Cancel fontSize="large" color="error" />,
      color: 'error.main'
    }
  ];
  
  return (
    <Grid container spacing={3}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {card.icon}
                <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                  {card.title}
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color={card.color}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Timeline fontSize="large" color="info" />
              <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                Most Active Service
              </Typography>
            </Box>
            <Typography variant="h5" component="div" color="info.main">
              {stats.mostActiveService}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Based on total number of requests
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              Recent Activity
            </Typography>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: index < stats.recentActivity.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Typography variant="body2" sx={{ maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activity.type}
                  </Typography>
                  <Typography variant="body2" color={
                    activity.status === 'Completed' || activity.status === 'Approved' ? 'success.main' :
                    activity.status === 'Pending' ? 'warning.main' :
                    activity.status === 'In Progress' || activity.status === 'Considered' || activity.status === 'In Review' ? 'info.main' :
                    'error.main'
                  }>
                    {activity.status}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(activity.date)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                No recent activity found
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default QuickStats;
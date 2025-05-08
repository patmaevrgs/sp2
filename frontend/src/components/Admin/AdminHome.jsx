import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import AdminDashboard from './AdminDashboard';
import QuickStats from './QuickStats';

function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Fetch user data from JWT cookie on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to extract user data from JWT cookie
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(cookie => cookie.startsWith('authToken='));
        
        if (authCookie) {
          const token = authCookie.split('=')[1];
          
          // Get user data from server using token
          const response = await fetch('/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUserData({
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                email: data.user.email
              });
            }
          }
        }
        
        // Remove loading state after short delay to ensure UI transitions smoothly
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {userData.firstName ? `Welcome, ${userData.firstName}!` : 'Hello, Admin!'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This dashboard provides insights on service usage, resident needs, and activity statistics to help improve Barangay Maahas resource planning.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Quick Overview
            </Typography>
            <QuickStats />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <AdminDashboard />
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminHome;
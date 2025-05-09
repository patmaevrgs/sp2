import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import AdminDashboard from './AdminDashboard';
import QuickStats from './QuickStats';

// Define the API base URL to match your other components
const API_BASE_URL = 'http://localhost:3002';

function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Fetch user data using localStorage as a reliable fallback
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Always load data from localStorage first for immediate display
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        const email = localStorage.getItem('email');

        if (firstName && lastName && email) {
          setUserData({
            firstName,
            lastName,
            email
          });
        }

      } catch (error) {
        console.error('Error in user data handling:', error);
      } finally {
        // Always finish loading after a short delay
        setTimeout(() => {
          setLoading(false);
        }, 500);
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
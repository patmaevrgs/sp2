import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

function ResidentHome() {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    // Get user's first name from localStorage
    const storedFirstName = localStorage.getItem('firstName');
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {firstName || 'Resident'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access to Barangay Maahas services and information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Featured Services Card */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(to right, #2196f3, #0d47a1)',
              color: 'white'
            }}
          >
            <Typography variant="h5" gutterBottom>
              Featured Services
            </Typography>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6">Document Requests</Typography>
                    <Typography variant="body2">
                      Request barangay certificates, clearances, and other official documents
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to="/resident/services/request/clearance"
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      sx={{ color: 'white' }}
                    >
                      Apply Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6">Court Reservation</Typography>
                    <Typography variant="body2">
                      Book the barangay's basketball or multipurpose court
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to="/resident/services/court"
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      sx={{ color: 'white' }}
                    >
                      Reserve Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6">Ambulance Booking</Typography>
                    <Typography variant="body2">
                      Request emergency medical transport service
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to="/resident/services/ambulance"
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      sx={{ color: 'white' }}
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6">Report Issues</Typography>
                    <Typography variant="body2">
                      Report infrastructure problems in the barangay
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to="/resident/services/report"
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      sx={{ color: 'white' }}
                    >
                      Report Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Resident Registration Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                Resident Database
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Are you registered in the Barangay Maahas resident database?
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Registration ensures fast access to services and keeps you updated on future community benefits and programs.
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/resident/register-database"
              startIcon={<PersonAddIcon />}
              sx={{ 
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              Register as Resident
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
  
export default ResidentHome;
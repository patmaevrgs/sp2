import React from 'react';
import { Button, Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from './LandingNavBar';

export default function LandingPage() {
  return (
    <>
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          backgroundImage: 'url(https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          px: 3,
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h2" fontWeight="bold" color="white" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3.5rem' } }}>
            Welcome to Barangay B-Hub
          </Typography>
          <Typography variant="h6" color="white" sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            A smarter way to manage your community services
          </Typography>
        </Container>
      </Box>
    </>
  );
}


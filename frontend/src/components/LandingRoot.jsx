import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Outlet, useNavigate } from 'react-router-dom';
import LandingNavbar from './LandingNavBar';
import { Box, Container } from '@mui/material';

function LandingRoot() {
  return (
    <Box
      sx={{
        backgroundColor: '#f2f4f8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LandingNavbar />

      {/* Responsive Content Container */}
      <Container
        maxWidth="md" // limits width on larger screens
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3, md: 4 }, // horizontal padding per screen size
          py: { xs: 2, sm: 3 }, // vertical padding per screen size
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default LandingRoot;

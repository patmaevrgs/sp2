import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Outlet, useNavigate } from 'react-router-dom';
import ResidentNav from '../components/Resident/ResidentNav';
import { Box, Container } from '@mui/material';

function ResidentRoot() {
  const [ResidentFirstName, setResidentFirstName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const firstName = localStorage.getItem('firstName');
    if (userType === 'resident' && firstName) {
      setResidentFirstName(firstName);
    }
  }, []);

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove('authToken', { path: '/' });
    localStorage.removeItem('userType');
    localStorage.removeItem('firstName');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f2f4f8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ResidentNav title="B-HUB" name={ResidentFirstName} func={handleLogout} />

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
        <Outlet context={{ firstName: ResidentFirstName }} />
      </Container>
    </Box>
  );
}

export default ResidentRoot;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  CssBaseline
} from '@mui/material';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3002/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, middleName, lastName, email, password, userType: "resident" }),
    });
    const data = await response.json();
    if (data.success) {
      navigate('/'); // Redirect to sign-in page after successful sign-up
    } else {
      alert('Error: Unable to create account');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: 'url(https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?cs=srgb&dl=pexels-pixabay-531880.jpg&fm=jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 5,
            boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
            background: 'rgba(255, 255, 255, 0.9)', // semi-transparent background
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center" color="primary">
            Create Your Account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: '25px',
                '&:hover': {
                  backgroundColor: '#0288d1',
                  transform: 'scale(1.05)',
                },
              }}
            >
              Create an account
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography align="center">
              Already have an account?{' '}
              <Link to="/signin" style={{ textDecoration: 'none' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignUp;

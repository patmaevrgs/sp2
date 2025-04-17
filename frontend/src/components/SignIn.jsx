import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  Link as MuiLink,
  Paper,
  useMediaQuery,
  useTheme,
  CssBaseline
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (isLoggedIn) {
      if (userType === 'admin') navigate('/admin');
      else if (userType === 'resident') navigate('/resident');
    }
  }, [isLoggedIn, navigate, userType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await loginUser();
    if (success) setIsLoggedIn(true);
  };

  const loginUser = async () => {
    try {
      const response = await fetch('http://localhost:3002/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (body.success) {
        const cookies = new Cookies();
        cookies.set('authToken', body.token, { path: '/', age: 60 * 60, sameSite: false });
        localStorage.setItem('user', body.user);
        localStorage.setItem('userType', body.userType);
        localStorage.setItem('firstName', body.firstName);
        localStorage.setItem('lastName', body.lastName);
        localStorage.setItem('email', body.email);
        return true;
      } else {
        alert('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
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
            background: 'rgba(255, 255, 255, 0.8)', // semi-transparent background
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center" color="primary">
            Barangay B-Hub Login
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Log In
            </Button>

            <Divider sx={{ my: 2 }}>or</Divider>

            <Typography align="center">
              Don’t have an account?&nbsp;
              <MuiLink component={Link} to="/signup">
                Sign Up
              </MuiLink>
            </Typography>

            {/* "Back to Landing Page" button */}
            <Button
              onClick={() => navigate('/')}
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderRadius: '25px',
                '&:hover': {
                  backgroundColor: '#0288d1',
                  transform: 'scale(1.05)',
                  color: '#fff',
                },
              }}
            >
              Back to Landing Page
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

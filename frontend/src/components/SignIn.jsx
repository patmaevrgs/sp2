import React, { useState, useEffect, useContext } from 'react';
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
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GroupsIcon from '@mui/icons-material/Groups';
import Cookies from 'universal-cookie';
import InputAdornment from '@mui/material/InputAdornment';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CampaignIcon from '@mui/icons-material/Campaign';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';


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
      else if (userType === 'superadmin') navigate('/admin')
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
      minHeight: '100vh',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    {/* Animated background pattern */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #f9fbfd 0%, #e6eef7 100%)',
        zIndex: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          backgroundImage: 'radial-gradient(circle, #1976d2 0%, transparent 4%)',
          backgroundSize: '25px 25px',
          opacity: 0.03,
          animation: 'backgroundAnimation 40s linear infinite',
        },
        '@keyframes backgroundAnimation': {
          '0%': {
            transform: 'translate(0, 0)',
          },
          '100%': {
            transform: 'translate(50px, 50px)',
          },
        },
      }}
    />

    {/* Left side - Image and branding */}
    {!isMobile && (
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '0 30px 30px 0',
            boxShadow: '15px 0 35px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Animated gradient background */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
              opacity: 0.92,
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
                top: '-25%',
                left: '-25%',
                animation: 'pulseAnimation 15s ease-in-out infinite',
              },
              '@keyframes pulseAnimation': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          />

          {/* Background pattern overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url("/src/assets/pattern-overlay.png")',
              backgroundSize: '400px',
              opacity: 0.03,
              zIndex: 2,
            }}
          />

          <Box
            sx={{
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 3,
            }}
          >
            {/* Logo at top left */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/src/assets/bhub-logo.png" 
                alt="Barangay Hub Logo" 
                style={{ height: '40px' }} 
              />
              <Typography 
                variant="h6" 
                fontWeight="600" 
                color="white" 
                sx={{ ml: 2, letterSpacing: '0.5px' }}
              >
                Barangay Maahas
              </Typography>
            </Box>

            {/* Main content - Welcome text and features */}
            <Box sx={{ my: 4, px: 3 }}>
              <Typography 
                variant="h2" 
                fontWeight="800" 
                color="white" 
                gutterBottom
                sx={{ 
                  fontSize: { md: '2.5rem', lg: '3.25rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  mb: 3
                }}
              >
                Welcome to <br/>Maahas B-Hub
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 300, 
                  mb: 5, 
                  opacity: 0.85,
                  lineHeight: 1.5,
                  maxWidth: '90%',
                }} 
                color="white"
              >
                Your digital gateway to convenient community services and information
              </Typography>

              {/* Feature list with animated icons */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateX(8px)' }
                }}>
                  <Box sx={{ 
                    mr: 2, 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    borderRadius: '12px', 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DocumentScannerIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Request and track official documents online
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateX(8px)' }
                }}>
                  <Box sx={{ 
                    mr: 2, 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    borderRadius: '12px', 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CampaignIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Stay updated with important announcements
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateX(8px)' }
                }}>
                  <Box sx={{ 
                    mr: 2, 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    borderRadius: '12px', 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MeetingRoomIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Book facilities and emergency services
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Decorative bottom element */}
            <Box sx={{ 
              py: 3, 
              px: 4, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="body2" color="white" sx={{ opacity: 0.7, fontWeight: 300 }}>
                "Bringing government services closer to the people through technology."
              </Typography>
              <Typography color="white" variant="body2" sx={{ fontWeight: 500, mt: 1, opacity: 0.9 }}>
                — Barangay Maahas Administration
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    )}

    {/* Right side - Login form */}
    <Box
      sx={{
        width: isMobile ? '100%' : '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 5, md: 6 },
        zIndex: 1,
      }}
    >
      <Box sx={{ 
        maxWidth: '450px', 
        width: '100%',
        py: { xs: 3, md: 4 },
        px: { xs: 3, md: 5 },
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: isMobile ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
      }}>
        {/* Form header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {isMobile && (
            <img 
              src="/src/assets/bhub-logo.png" 
              alt="Barangay Hub Logo" 
              style={{ height: '50px', marginBottom: '16px' }} 
            />
          )}
          <Typography 
            variant="h4" 
            fontWeight="700" 
            color="primary"
            sx={{ 
              mb: 1.5,
              background: 'linear-gradient(90deg, #1976d2, #2196f3)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Log in to your account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access services and stay connected with Barangay Maahas
          </Typography>
        </Box>

        {/* Login form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f5f7fa',
                transition: 'all 0.3s ease',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f5f7fa',
                transition: 'all 0.3s ease',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          />

          {/* Remember me and forgot password */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
          }}>
            <FormControlLabel
              control={
                <Checkbox 
                  size="small" 
                  sx={{ 
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }} 
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Remember me
                </Typography>
              }
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'primary.main', 
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Forgot password?
            </Typography>
          </Box>

          {/* Login button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.6,
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '16px',
              background: 'linear-gradient(90deg, #1976d2, #2196f3)',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.25)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            Log in
          </Button>

          {/* Social login options */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Divider>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                Or continue with
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <IconButton 
                sx={{ 
                  p: 1.5,
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
              >
                <GoogleIcon sx={{ fontSize: 22 }} />
              </IconButton>
              
              <IconButton 
                sx={{ 
                  p: 1.5,
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
              >
                <FacebookIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Signup link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink 
                component={Link} 
                to="/signup" 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign Up
              </MuiLink>
            </Typography>
            
            <Button
              onClick={() => navigate('/')}
              variant="text"
              sx={{
                mt: 2,
                textTransform: 'none',
                fontSize: '0.875rem',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                },
              }}
              startIcon={<ArrowBackIcon fontSize="small" />}
            >
              Back to Landing Page
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);
}

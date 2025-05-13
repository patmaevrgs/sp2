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
  InputAdornment,
  useTheme,
  CssBaseline
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CampaignIcon from '@mui/icons-material/Campaign';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import ReportIcon from '@mui/icons-material/Report';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const MuiLink = Link;
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

    {/* Left side - Form */}
    <Box
      sx={{
        width: isMobile ? '100%' : '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 5, md: 6 },
        zIndex: 1,
        order: { xs: 2, md: 1 },
      }}
    >
      <Box sx={{ 
        maxWidth: '480px', 
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
            sx={{ mb: 1.5 }}
          >
            Create your account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join the Barangay Maahas community
          </Typography>
        </Box>

        {/* Signup form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
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
              fullWidth
              label="Middle Name (Optional)"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
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
          </Box>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mt: 2,
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
              mt: 2,
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
              mt: 2,
              mb: 4,
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
            Create Account
          </Button>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink 
                component={Link} 
                to="/signin" 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Log In
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

    {/* Right side - Info */}
    {!isMobile && (
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          order: { xs: 1, md: 2 },
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
            borderRadius: '30px 0 0 30px',
            boxShadow: '-15px 0 35px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Background */}
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
            {/* Logo at top right */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                color="white" 
                sx={{ mr: 2, letterSpacing: '0.5px' }}
              >
                Barangay Maahas
              </Typography>
              <img 
                src="/src/assets/bhub-logo.png" 
                alt="Barangay Hub Logo" 
                style={{ height: '40px' }} 
              />
            </Box>

            {/* Main content */}
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
                Join Barangay Maahas Hub
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
                Create an account to access exclusive services and be part of our community
              </Typography>

              {/* Services list */}
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
                    <DescriptionIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Request barangay clearances and certificates
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
                    <LocalHospitalIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Book ambulance services in emergencies
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
                    <SportsCricketIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Reserve court facilities for sports events
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
                    <ReportIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography color="white" variant="body1" sx={{ fontWeight: 300 }}>
                    Report infrastructure issues in the community
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Call to action */}
            <Box sx={{ 
              py: 3, 
              px: 4, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="body1" color="white" sx={{ fontWeight: 400 }}>
                Join over 1,500+ residents already using our digital services
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    )}
  </Box>
);
}

export default SignUp;

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
      navigate('/signin'); // Redirect to sign-in page after successful sign-up
    } else {
      alert('Error: Unable to create account');
    }
  };

  return (
  <Box
    sx={{
      // minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      bgcolor: '#f7f7f7',
    }}
  >
    {/* Top decorative wave - visible on all devices */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: { xs: '160px', md: '220px' },
        zIndex: 0,
        background: 'linear-gradient(160deg, #0a8a0d 0%, #26a69a 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 100%)',
      }}
    />
    
    {/* Logo and nav bar - visible on all devices */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            bgcolor: 'white',
            p: 1,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <img 
            src="/src/assets/bhub-logo.png" 
            alt="B-Hub Logo" 
            style={{ height: '30px' }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            ml: 2,
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Barangay Maahas
        </Typography>
      </Box>
      
      <Button
        onClick={() => navigate('/')}
        variant="outlined"
        size="small"
        startIcon={<ArrowBackIcon />}
        sx={{
          color: 'white',
          borderColor: 'rgba(255,255,255,0.5)',
          textTransform: 'none',
          '&:hover': {
            borderColor: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
          },
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        }}
      >
        Back to Home
      </Button>
    </Box>
    {/* Main Content */}
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        py: { xs: 3, sm: 5 },
        px: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        zIndex: 1,
        gap: 4,
      }}
    >
        
      {/* Signup form - SHOWN ON ALL DEVICES */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: '100%', md: '60%' },
          maxWidth: { xs: '100%', md: '600px' },  // Full width on mobile
          borderRadius: '16px',
          p: { xs: 3, sm: 4 },
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          mx: 'auto', // Center on mobile
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(90deg, #0a8a0d, #26a69a)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
          }}
        >
          Create Your Account
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Register as a resident of Barangay Maahas to access digital services
        </Typography>
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          {/* Name fields row */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
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
                  borderRadius: '10px',
                  backgroundColor: '#f5f7fa',
                  pl: 1,
                  '&:hover': {
                    backgroundColor: '#e9ecef',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a8a0d',
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#0a8a0d',
                },
              }}
            />
            <TextField
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
                  borderRadius: '10px',
                  backgroundColor: '#f5f7fa',
                  pl: 1,
                  '&:hover': {
                    backgroundColor: '#e9ecef',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a8a0d',
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#0a8a0d',
                },
              }}
            />
          </Box>
          
          <TextField
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
              mb: 2,
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                backgroundColor: '#f5f7fa',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0a8a0d',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#0a8a0d',
              },
            }}
          />
          <TextField
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
              mb: 2,
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                backgroundColor: '#f5f7fa',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0a8a0d',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#0a8a0d',
              },
            }}
          />
          
          <TextField
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
              mb: 3,
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                backgroundColor: '#f5f7fa',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0a8a0d',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#0a8a0d',
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
              background: 'linear-gradient(90deg, #0a8a0d, #26a69a)',
              boxShadow: '0 4px 15px rgba(10, 138, 13, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(10, 138, 13, 0.4)',
                transform: 'translateY(-2px)',
                background: 'linear-gradient(90deg, #0a8a0d, #26a69a)',
                filter: 'brightness(1.05)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Create Account
          </Button>
          
          {/* Optional social login section - can be hidden on smallest screens if desired */}
          <Box sx={{ display: { xs: 'block', sm: 'block' } }}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                or
              </Typography>
            </Divider>
            
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                to="/signin"
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: '#0a8a0d',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Log in
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>

    {/* Footer with wave shape - HIDDEN ON MOBILE */}
    <Box
      sx={{
        position: 'relative',
        height: '80px',
        overflow: 'hidden',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '150px',
          background: 'linear-gradient(160deg, #0a8a0d 0%, #26a69a 100%)',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 35%, 0 70%)',
        }}
      />
    </Box>
  </Box>
);
}

export default SignUp;

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Importing the logout icon
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function ResidentNav({ title, name, func }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();  // To track the current path

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesAnchorEl, setServicesAnchorEl] = useState(null);
  const [requestFormsAnchorEl, setRequestFormsAnchorEl] = useState(null);
  const [mobileRequestOpen, setMobileRequestOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleServicesClick = (e) => setServicesAnchorEl(e.currentTarget);
  const handleServicesClose = () => {
    setServicesAnchorEl(null);
    setRequestFormsAnchorEl(null);
  };
  const handleRequestFormsClick = (e) => setRequestFormsAnchorEl(e.currentTarget);

  const navLinks = [
    { text: 'Home', path: '/resident' },
    { text: 'Announcements', path: '/resident/announcements' },
    { text: 'Transactions', path: '/resident/transactions' },
    { text: 'FAQs', path: '/resident/faqs' },
    { text: 'Contact', path: '/resident/contact' },
  ];

  const requestFormsLinks = [
    { text: 'Barangay ID', path: '/resident/services/request/id' },
    { text: 'Barangay Clearance', path: '/resident/services/request/clearance' },
    { text: 'Barangay Business Clearance', path: '/resident/services/request/business' },
    { text: 'Lot Ownership', path: '/resident/services/request/lot' },
    { text: 'Digging Permit', path: '/resident/services/request/digging' },
    { text: 'Fencing Permit', path: '/resident/services/request/fencing' },
    { text: 'Request for Assistance', path: '/resident/services/request/assistance' },
    { text: 'Certificate of Indigency', path: '/resident/services/request/indigency' },
    { text: 'Certificate of Residency', path: '/resident/services/request/residency' },
    { text: 'No Objection Certificate', path: '/resident/services/request/objection' },
  ];

  const otherServicesLinks = [
    { text: 'Ambulance Booking', path: '/resident/services/ambulance' },
    { text: 'Court Reservation', path: '/resident/services/court' },
    { text: 'Report Infrastructure', path: '/resident/services/report' },
    { text: 'Project Proposal', path: '/resident/services/proposal' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: 'white',
                px: { xs: 2, md: 8 },
                py: 1,
                borderBottom: '1px solid #dde1e6',
            }}
        >

        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
            }}
            >
            <img
                src="https://dynamic.brandcrowd.com/asset/logo/41a654fb-0d8f-43b7-ab53-ff60720bd946/logo-search-grid-2x?logoTemplateVersion=2&v=638581023245370000"
                alt="Logo"
                style={{
                width: '150px',      // increase height
                height: 'auto',       // auto width keeps aspect ratio
                maxHeight: '60px',   // optional cap for desktop
                }}
            />
            </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {[...navLinks.slice(0, 2)].map(({ text, path }) => (
                <Link
                  key={text}
                  to={path}
                  style={{
                    textDecoration: 'none',
                    color: isActive(path) ? '#1976d2' : 'black',
                  }}
                >
                  <Typography
                    variant="button"
                    sx={{
                      fontWeight: 500,
                      textTransform: 'none',
                      '&:hover': { color: '#1976d2' },
                    }}
                  >
                    {text}
                  </Typography>
                </Link>
              ))}

              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleServicesClick}>
                <Typography variant="button" sx={{ fontWeight: 500,  textTransform: 'none', color: '#000', '&:hover': { color: '#1976d2' } }}>
                  Services
                </Typography>
                <ExpandMoreIcon sx={{ color: '#000', fontSize: 20 }} />
              </Box>

              <Menu anchorEl={servicesAnchorEl} open={Boolean(servicesAnchorEl)} onClose={handleServicesClose}>
                <MenuItem onClick={handleRequestFormsClick}>Request Forms <ExpandMoreIcon /></MenuItem>
                <Menu anchorEl={requestFormsAnchorEl} open={Boolean(requestFormsAnchorEl)} onClose={() => setRequestFormsAnchorEl(null)}>
                  {requestFormsLinks.map(({ text, path }) => (
                    <MenuItem key={text} onClick={() => { handleServicesClose(); navigate(path); }}>{text}</MenuItem>
                  ))}
                </Menu>
                {otherServicesLinks.map(({ text, path }) => (
                  <MenuItem key={text} onClick={() => { handleServicesClose(); navigate(path); }}>{text}</MenuItem>
                ))}
              </Menu>

              {[...navLinks.slice(2)].map(({ text, path }) => (
                <Link
                  key={text}
                  to={path}
                  style={{
                    textDecoration: 'none',
                    color: isActive(path) ? '#1976d2' : 'black',
                  }}
                >
                  <Typography
                    variant="button"
                    sx={{
                      fontWeight: 500,
                      textTransform: 'none',
                      '&:hover': { color: '#1976d2' },
                    }}
                  >
                    {text}
                  </Typography>
                </Link>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <>
                <Button
                  onClick={() => navigate('/resident/profile')}
                  sx={{ color: '#000', textTransform: 'none' }}
                  startIcon={<Avatar sx={{ width: 24, height: 24 }}>{name?.[0]}</Avatar>}
                >
                  {name}
                </Button>

                <IconButton
                  onClick={func}
                  sx={{
                    color: '#1976d2',
                    '&:hover': { color: '#1565c0' },
                  }}
                >
                  <ExitToAppIcon /> {/* Logout icon */}
                </IconButton>
              </>
            )}

            {isMobile && (
                <IconButton
                    color="inherit"
                    edge="end"
                    onClick={handleDrawerToggle}
                    sx={{
                        color: '#1976d2', // Blue color for the hamburger icon
                        '&:hover': {
                        color: '#1565c0', // Slightly darker blue on hover
                        },
                    }}
                    >
                    <MenuIcon />
                </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer (Mobile) */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle} PaperProps={{ sx: { width: 280, backgroundColor: 'white', color: 'black' } }}>
        <List>
          {[...navLinks.slice(0, 2)].map(({ text, path }) => (
            <ListItem button key={text} onClick={() => { navigate(path); setDrawerOpen(false); }}>
              <ListItemText primary={text} sx={{ color: isActive(path) ? '#1976d2' : 'black' }} />
            </ListItem>
          ))}

          <ListItem button onClick={() => setMobileServicesOpen(!mobileServicesOpen)}>
            <ListItemText primary="Services" />
            <ExpandMoreIcon sx={{ transform: mobileServicesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
          </ListItem>

          <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} onClick={() => setMobileRequestOpen(!mobileRequestOpen)}>
                <ListItemText primary="Request Forms" />
                <ExpandMoreIcon sx={{ transform: mobileRequestOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
              </ListItem>

              <Collapse in={mobileRequestOpen} timeout="auto" unmountOnExit>
                {requestFormsLinks.map(({ text, path }) => (
                  <ListItem button key={text} sx={{ pl: 6 }} onClick={() => { navigate(path); setDrawerOpen(false); }}>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </Collapse>

              {otherServicesLinks.map(({ text, path }) => (
                <ListItem button key={text} sx={{ pl: 4 }} onClick={() => { navigate(path); setDrawerOpen(false); }}>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </Collapse>

          {[...navLinks.slice(2)].map(({ text, path }) => (
            <ListItem button key={text} onClick={() => { navigate(path); setDrawerOpen(false); }}>
              <ListItemText primary={text} sx={{ color: isActive(path) ? '#1976d2' : 'black' }} />
            </ListItem>
          ))}

          <Divider sx={{ borderColor: '#90CAF9', my: 1 }} />

          <ListItem button onClick={() => { navigate('/resident/profile'); setDrawerOpen(false); }}>
            <ListItemText primary={`Profile (${name})`} />
          </ListItem>
          <ListItem button onClick={() => { func(); setDrawerOpen(false); }}>
            <ListItemText primary="Logout" sx={{ color: '#1976d2' }} />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { text: 'Home', path: '/' },
    { text: 'Announcements', path: '/announcements' },
    { text: 'Services', path: '/services' },
    { text: 'FAQs', path: '/faqs' },
    { text: 'Contact', path: '/contact' },
  ];

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#fff',
          px: { xs: 2, md: 8 },
          py: 1,
          boxShadow: 'none',
          borderBottom: '1px solid #DDE1E6',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
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

          {/* Nav Links (Desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 4 }}>
              {navLinks.map(({ text, path }) => (
                <Link
                  key={text}
                  to={path}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: location.pathname === path ? '#1976d2' : '#000',
                      textTransform: 'none',
                      '&:hover': {
                        color: '#1976d2',
                        transition: '0.3s',
                      },
                    }}
                  >
                    {text}
                  </Typography>
                </Link>
              ))}
            </Box>
          )}

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Login Button (Desktop) */}
            {!isMobile && (
              <Button
                variant="outlined"
                onClick={() => navigate('/signin')}
                sx={{
                  borderColor: '#1976d2',
                  color: '#000',
                  textTransform: 'none',
                  ml: 2,
                  '&:hover': {
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    borderColor: '#1976d2',
                  },
                }}
              >
                Log In
              </Button>
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <IconButton
                onClick={toggleDrawer(true)}
                sx={{ ml: 1, color: '#1976d2' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer (Mobile) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { width: 220, backgroundColor: '#fff', color: '#000' },
        }}
      >
        <List>
          {navLinks.map(({ text, path }) => (
            <ListItem
              button
              key={text}
              onClick={() => handleLinkClick(path)}
              selected={location.pathname === path}
              sx={{
                '&.Mui-selected': { color: '#1976d2' },
                '&.Mui-selected:hover': { backgroundColor: '#f0f0f0' },
              }}
            >
              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={() => handleLinkClick('/signin')}>
            <ListItemText
              primary="Log in"
              primaryTypographyProps={{
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLoaderData } from 'react-router-dom';
import Cookies from 'universal-cookie';

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import AdminSidebar from '../components/Admin/AdminSidebar';

function AdminRoot() {
  const [adminFullName, setAdminFullName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(useLoaderData());
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }

    const userType = localStorage.getItem('userType');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');

    if (userType === 'admin' && firstName) {
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      setAdminFullName(fullName);
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove('authToken', { path: '/' });
    localStorage.removeItem('userType');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f2f4f8' }}>
      {/* Sidebar */}
      {!isMobile && (
        <Box component="nav" sx={{ width: 250, flexShrink: 0 }}>
          <AdminSidebar />
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            color: 'black',
            px: 3,
            py: 1,
            borderBottom: '1px solid #dde1e6',
          }}
        >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              minHeight: '56px',
              pl: isMobile ? 0 : '16px',
              pr: 0,
            }}
          >
            <Box sx={{ flexGrow: 1 }} /> {/* filler space */}

            <Box display="flex" alignItems="center" onClick={handleMenuClick} sx={{ cursor: 'pointer' }}>
              <Avatar alt={adminFullName} src="/profile-placeholder.png" />
              <Typography
                variant="body1"
                sx={{ ml: 1, fontWeight: 500, color: '#0072CE' }}
              >
                {adminFullName}
              </Typography>
              <ArrowDropDownIcon />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiMenu-paper': {
              border: '1px solid #ccc',
              mt: 1
            }
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate('/admin/profile');
            }}
            sx={{
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
          >
            View Profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleLogout();
            }}
            sx={{
              '&:hover': {
                backgroundColor: '#ffeaea'
              }
            }}
          >
            Log out
          </MenuItem>
        </Menu>

        {/* Drawer for Mobile */}
        {isMobile && <AdminSidebar mobile />}

        {/* Main Outlet Content */}
        <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AdminRoot;

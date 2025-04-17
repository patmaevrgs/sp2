import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  useTheme,
  useMediaQuery,
  ListItemIcon,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as AnnouncementsIcon,
  Build as ServicesIcon,
  People as ResidentsIcon,
  ManageAccounts as AccountsIcon,
  History as LogsIcon,
  Menu as MenuIcon,
  Article as FormsIcon,
  LocalHospital as AmbulanceIcon,
  SportsBasketball as CourtIcon,
  Construction as InfraIcon,
  Assignment as ProjectIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 250;

export default function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      label: 'Announcements',
      icon: <AnnouncementsIcon />,
      path: '/admin/announcements',
    },
    {
      label: 'Services',
      icon: <ServicesIcon />,
      submenu: [
        { label: 'Request forms', icon: <FormsIcon />, path: '/admin/services/request-forms' },
        { label: 'Ambulance booking', icon: <AmbulanceIcon />, path: '/admin/services/ambulance-booking' },
        { label: 'Court reservation', icon: <CourtIcon />, path: '/admin/services/court-reservation' },
        { label: 'Infrastructure reports', icon: <InfraIcon />, path: '/admin/services/infrastructure-reports' },
        { label: 'Project proposals', icon: <ProjectIcon />, path: '/admin/services/project-proposals' },
      ],
    },
    {
      label: 'Resident Database',
      icon: <ResidentsIcon />,
      path: '/admin/database',
    },
    {
      label: 'Accounts',
      icon: <AccountsIcon />,
      path: '/admin/accounts',
    },
    {
      label: 'User log',
      icon: <LogsIcon />,
      path: '/admin/logs',
    },
  ];

  const renderNavItems = () => (
    <List sx={{ mt: 2 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#1976d2">
          B-Hub
        </Typography>
      </Box>

      {navItems.map((item, index) => {
        if (!item.submenu) {
          return (
            <ListItemButton
              key={index}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                mx: 1.5,
                borderRadius: 2,
                mb: 0.5,
                color: location.pathname === item.path ? '#1976d2' : '#000',
                backgroundColor: location.pathname === item.path ? '#e1e5ec' : 'transparent',
                '&:hover': {
                  backgroundColor: '#e1e5ec',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        } else {
          return (
            <React.Fragment key={index}>
              <ListItemButton
                onClick={() => setOpenServices(!openServices)}
                sx={{
                  mx: 1.5,
                  borderRadius: 2,
                  mb: 0.5,
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#e1e5ec',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {openServices ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openServices} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((sub, i) => (
                    <ListItemButton
                      key={i}
                      component={Link}
                      to={sub.path}
                      selected={location.pathname === sub.path}
                      sx={{
                        ml: 4,
                        borderRadius: 2,
                        color: location.pathname === sub.path ? '#1976d2' : '#000',
                        backgroundColor: location.pathname === sub.path ? '#e1e5ec' : 'transparent',
                        '&:hover': {
                          backgroundColor: '#e1e5ec',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>{sub.icon}</ListItemIcon>
                      <ListItemText primary={sub.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        }
      })}
    </List>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={toggleDrawer}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: '#000',
              zIndex: 1300,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={toggleDrawer}
            PaperProps={{
              sx: {
                width: drawerWidth,
                backgroundColor: '#dde1e6',
              },
            }}
          >
            {renderNavItems()}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          anchor="left"
          PaperProps={{
            sx: {
              width: drawerWidth,
              backgroundColor: '#dde1e6',
              borderRight: 'none',
              height: '100vh',
            },
          }}
        >
          {renderNavItems()}
        </Drawer>
      )}
    </>
  );
}

import React, { useState, useEffect } from 'react';
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
  alpha,
  Avatar,
  Divider,
  Chip,
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
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

const drawerWidth = 250;

export default function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [userType, setUserType] = useState('admin');
  const [pendingCounts, setPendingCounts] = useState({
    ambulance: 0,
    court: 0,
    reports: 0,
    projects: 0,
    forms: 0,
    total: 0
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
    }
    
    // Check if we should expand the services menu initially
    const isServiceActive = navItems.some(item => 
      item.submenu && item.submenu.some(sub => location.pathname === sub.path)
    );
    
    if (isServiceActive) {
      setOpenServices(true);
    }
  }, [location.pathname]);

  // New useEffect to fetch pending counts
  useEffect(() => {
    // This function fetches pending counts for each service
    const fetchPendingCounts = async () => {
      try {
        // Create promises for all API calls
        const ambulancePromise = fetch('http://localhost:3002/ambulance?status=pending');
        const courtPromise = fetch('http://localhost:3002/court?status=pending');
        const reportsPromise = fetch('http://localhost:3002/reports');
        const projectsPromise = fetch('http://localhost:3002/proposals?status=pending');
        const formsPromise = fetch('http://localhost:3002/document-requests?status=pending');
        
        // Wait for all promises to resolve
        const [ambulanceRes, courtRes, reportsRes, projectsRes, formsRes] = 
          await Promise.all([ambulancePromise, courtPromise, reportsPromise, projectsPromise, formsPromise]);
        
        // Parse the JSON responses
        const ambulanceData = await ambulanceRes.json();
        const courtData = await courtRes.json();
        const reportsData = await reportsRes.json();
        const projectsData = await projectsRes.json();
        const formsData = await formsData.json();
        
        // Calculate counts
        const ambulanceCount = Array.isArray(ambulanceData) ? ambulanceData.length : 0;
        const courtCount = Array.isArray(courtData) ? courtData.length : 0;
        const reportsCount = reportsData.reports ? 
          reportsData.reports.filter(report => report.status === 'Pending').length : 0;
        const projectsCount = projectsData.proposals ? projectsData.proposals.length : 0;
        const formsCount = formsData.documentRequests ? formsData.documentRequests.length : 0;
        
        const totalCount = ambulanceCount + courtCount + reportsCount + projectsCount + formsCount;
        
        // Update state with the counts
        setPendingCounts({
          ambulance: ambulanceCount,
          court: courtCount,
          reports: reportsCount,
          projects: projectsCount,
          forms: formsCount,
          total: totalCount
        });
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };
    
    // Initial fetch
    fetchPendingCounts();
    
    // Set up interval to refresh counts every minute
    const intervalId = setInterval(fetchPendingCounts, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };
  // Base navigation items
  const baseNavItems = [
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
  
  // Add Manage Application for superadmin only
  const navItems = userType === 'superadmin' ? [
    ...baseNavItems,
    {
      label: 'Manage Application',
      icon: <SettingsIcon />,
      path: '/admin/manage-app',
    }
  ] : baseNavItems;
  const renderDrawerContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Header Section */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 1.5
        }}
      >
        <img
          src="/src/assets/bhub-logo.png"
          alt="B-Hub Logo"
          style={{
            height: 'auto',
            width: '150px',
            maxHeight: '50px',
          }}
        />
      </Box>

      {/* Admin Info Section */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          display: 'flex', 
          alignItems: 'center',
          mb: 1.5,
          cursor: 'pointer',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
        onClick={() => navigate('/admin/profile')}
      >
        <Avatar 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1), 
            color: 'primary.main',
            width: 42,
            height: 42,
            border: '2px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box sx={{ ml: 1.5 }}>
          <Typography 
            variant="subtitle2" 
            fontWeight={600} 
            sx={{ color: 'text.primary', lineHeight: 1.2 }}
          >
            {localStorage.getItem('firstName')} {localStorage.getItem('lastName')}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CircleIcon sx={{ fontSize: '8px', color: 'success.main', mr: 0.8 }} />
            Online
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box 
        sx={{ 
          overflowY: 'auto',
          flex: 1,
          py: 1,
          px: 2
        }}
      >
        {/* Section Label */}
        <Typography 
          variant="overline" 
          sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: 'text.secondary',
            opacity: 0.8,
            pl: 1.5,
            mb: 1,
            letterSpacing: '0.08em',
            display: 'block'
          }}
        >
          MAIN NAVIGATION
        </Typography>
        {/* Navigation List */}
        <List sx={{ pt: 0 }}>
          {navItems.map((item, index) => {
            if (!item.submenu) {
              return (
                <ListItemButton
                  key={index}
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    mx: 0.5,
                    borderRadius: 2,
                    mb: 0.75,
                    py: 1,
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    backgroundColor: location.pathname === item.path 
                      ? alpha(theme.palette.primary.main, 0.08) 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === item.path ? 'primary.main' : alpha(theme.palette.text.primary, 0.7),
                      minWidth: 36,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{item.label}</span>
                        {item.label === 'Services' && pendingCounts.total > 0 && (
                          <Chip 
                            label={pendingCounts.total} 
                            size="small"
                            color="warning"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              minWidth: 20,
                              ml: 1
                            }}
                          />
                        )}
                      </Box>
                    }
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.875rem'
                      } 
                    }}
                  />
                </ListItemButton>
              );
            } else {
              return (
                <React.Fragment key={index}>
                  <ListItemButton
                    onClick={() => setOpenServices(!openServices)}
                    sx={{
                      mx: 0.5,
                      borderRadius: 2,
                      mb: 0.75,
                      py: 1,
                      color: openServices || 
                             item.submenu.some(sub => location.pathname === sub.path) ? 
                             'primary.main' : 'text.primary',
                      backgroundColor: openServices || 
                                       item.submenu.some(sub => location.pathname === sub.path) ? 
                                       alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: openServices || 
                               item.submenu.some(sub => location.pathname === sub.path) ? 
                               'primary.main' : alpha(theme.palette.text.primary, 0.7),
                        minWidth: 36,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{item.label}</span>
                          {pendingCounts.total > 0 && (
                            <Chip 
                              label={pendingCounts.total} 
                              size="small"
                              color="warning"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                minWidth: 20,
                                ml: 1
                              }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ 
                        '& .MuiTypography-root': { 
                          fontWeight: openServices || 
                                      item.submenu.some(sub => location.pathname === sub.path) ? 
                                      600 : 500,
                          fontSize: '0.875rem'
                        } 
                      }}
                    />
                    {openServices ? 
                      <ExpandLess sx={{ color: 'primary.main' }} /> : 
                      <ExpandMore sx={{ color: alpha(theme.palette.text.primary, 0.7) }} />
                    }
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
                            pl: 4.5,
                            py: 0.75,
                            mx: 0.5,
                            borderRadius: 2,
                            color: location.pathname === sub.path ? 'primary.main' : alpha(theme.palette.text.primary, 0.75),
                            backgroundColor: location.pathname === sub.path ? 
                                            alpha(theme.palette.primary.main, 0.08) : 'transparent',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                          }}
                        >
                          <ListItemIcon 
                            sx={{ 
                              color: location.pathname === sub.path ? 'primary.main' : alpha(theme.palette.text.primary, 0.6),
                              minWidth: 28,
                              fontSize: '0.875rem'
                            }}
                          >
                            {sub.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>{sub.label}</span>
                                {/* Display pending count badges */}
                                {sub.label === 'Ambulance booking' && pendingCounts.ambulance > 0 && (
                                  <Chip 
                                    label={pendingCounts.ambulance} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1
                                    }}
                                  />
                                )}
                                {sub.label === 'Court reservation' && pendingCounts.court > 0 && (
                                  <Chip 
                                    label={pendingCounts.court} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1
                                    }}
                                  />
                                )}
                                {sub.label === 'Infrastructure reports' && pendingCounts.reports > 0 && (
                                  <Chip 
                                    label={pendingCounts.reports} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1
                                    }}
                                  />
                                )}
                                {sub.label === 'Project proposals' && pendingCounts.projects > 0 && (
                                  <Chip 
                                    label={pendingCounts.projects} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1
                                    }}
                                  />
                                )}
                                {sub.label === 'Request forms' && pendingCounts.forms > 0 && (
                                  <Chip 
                                    label={pendingCounts.forms} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            sx={{ 
                              '& .MuiTypography-root': { 
                                fontWeight: location.pathname === sub.path ? 600 : 400,
                                fontSize: '0.815rem'
                              } 
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }
          })}
        </List>

        {/* Divider for system section */}
        <Divider sx={{ my: 2, mx: 1.5, opacity: 0.6 }} />

        {/* System Section Label */}
        <Typography 
          variant="overline" 
          sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: 'text.secondary',
            opacity: 0.8,
            pl: 1.5,
            mb: 1,
            letterSpacing: '0.08em',
            display: 'block'
          }}
        >
          SYSTEM
        </Typography>
        {/* System Items */}
        <List sx={{ pt: 0 }}>
          {/* Settings - Only for superadmin */}
          {userType === 'superadmin' && (
            <ListItemButton
              component={Link}
              to="/admin/manage-app"
              selected={location.pathname === '/admin/manage-app'}
              sx={{
                mx: 0.5,
                borderRadius: 2,
                mb: 0.75,
                py: 1,
                color: location.pathname === '/admin/manage-app' ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname === '/admin/manage-app' 
                  ? alpha(theme.palette.primary.main, 0.08) 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === '/admin/manage-app' ? 'primary.main' : alpha(theme.palette.text.primary, 0.7),
                  minWidth: 36,
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Manage Application" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: location.pathname === '/admin/manage-app' ? 600 : 500,
                    fontSize: '0.875rem'
                  } 
                }}
              />
            </ListItemButton>
          )}

          {/* Logout Button */}
          <ListItemButton
            onClick={() => {
              // Use the same logout logic as in AdminRoot
              const cookies = new Cookies();
              cookies.remove('authToken', { path: '/' });
              localStorage.removeItem('userType');
              localStorage.removeItem('firstName');
              localStorage.removeItem('lastName');
              localStorage.removeItem('email');
              localStorage.removeItem('user');
              window.location.href = '/'; // Redirect to login page
            }}
            sx={{
              mx: 0.5,
              borderRadius: 2,
              mb: 0.75,
              py: 1,
              color: 'error.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'error.main',
                minWidth: 36,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  fontSize: '0.875rem'
                } 
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer Section */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            display: 'block',
            fontSize: '0.7rem'
          }}
        >
          B-Hub Admin Panel
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: alpha(theme.palette.text.secondary, 0.7),
            fontSize: '0.65rem'
          }}
        >
          © 2025 Barangay Maahas
        </Typography>
      </Box>
    </Box>
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
              color: theme.palette.primary.main,
              zIndex: 1300,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
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
                backgroundColor: '#f8f9fa',
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
              },
            }}
          >
            {renderDrawerContent()}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          anchor="left"
          PaperProps={{
            sx: {
              width: drawerWidth,
              backgroundColor: '#f8f9fa',
              borderRight: 'none',
              height: '100vh',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.07)',
            },
          }}
        >
          {renderDrawerContent()}
        </Drawer>
      )}
    </>
  );
}
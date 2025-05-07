import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserType, setNewUserType] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch all users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/users', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setIsSuperAdmin(data.isSuper);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewUserType(user.userType);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateUserType = async () => {
    try {
      const response = await fetch('http://localhost:3002/users/updateType', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          userId: selectedUser._id,
          userType: newUserType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the user in the local state
        setUsers(users.map(user => 
          user._id === selectedUser._id ? { ...user, userType: newUserType } : user
        ));
        
        setSnackbar({
          open: true,
          message: 'User type updated successfully',
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to update user type');
      }
    } catch (err) {
      console.error('Error updating user type:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update user type',
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }} 
          onClick={fetchUsers}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Accounts
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchUsers}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader aria-label="user accounts table">
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Middle Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>User Type</TableCell>
                {isSuperAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow hover key={user._id}>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.middleName || '-'}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.8125rem',
                        fontWeight: 'medium',
                        textTransform: 'capitalize',
                        backgroundColor: user.userType === 'superadmin' 
                          ? 'rgba(255, 180, 0, 0.1)' 
                          : user.userType === 'admin' 
                            ? 'rgba(0, 123, 255, 0.1)' 
                            : 'rgba(76, 175, 80, 0.1)',
                        color: user.userType === 'superadmin' 
                          ? '#FFA000' 
                          : user.userType === 'admin' 
                            ? '#0074cc' 
                            : '#388e3c',
                      }}
                    >
                      {user.userType}
                    </Box>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell align="center">
                      <Tooltip title="Edit User Type">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(user)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit User Type Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update User Type</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                User: {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email: {selectedUser.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Type: {selectedUser.userType}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="user-type-select-label">New User Type</InputLabel>
                <Select
                  labelId="user-type-select-label"
                  value={newUserType}
                  label="New User Type"
                  onChange={(e) => setNewUserType(e.target.value)}
                >
                  <MenuItem value="resident">Resident</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superadmin">Superadmin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateUserType} 
            variant="contained" 
            disabled={!selectedUser || selectedUser.userType === newUserType}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminAccounts;
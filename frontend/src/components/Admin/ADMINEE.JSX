import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import AlertTitle from '@mui/material/AlertTitle';

// Resident type options
const residentTypes = ['Minor', '18-30', 'Illiterate', 'PWD', 'Senior Citizen', 'Indigent'];

function AdminDatabase() {
  // State variables
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPrecinct, setSelectedPrecinct] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [voterStatus, setVoterStatus] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [openVerifyConfirmDialog, setOpenVerifyConfirmDialog] = useState(false);
  const [openRejectConfirmDialog, setOpenRejectConfirmDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    precinctLevel: '',
    contactNumber: '',
    email: '',
    types: [],
    isVoter: false
  });
  const [password, setPassword] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [precinctOptions, setPrecinctOptions] = useState([]);
  const [addressOptions, setAddressOptions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [openPendingDialog, setOpenPendingDialog] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Fetch residents and options on component mount
  useEffect(() => {
    fetchResidents();
    fetchOptions();
    fetchPendingRequests();
  }, [page, rowsPerPage, searchTerm, selectedAddress, selectedPrecinct, selectedTypes, voterStatus]);

   // Add a new useEffect for checking duplicates when selectedResident changes
   useEffect(() => {
    if (selectedResident) {
      console.log("Selected resident for duplicate check:", selectedResident);
      checkForDuplicates({
        firstName: selectedResident.firstName,
        lastName: selectedResident.lastName
      });
    }
  }, [selectedResident]);

  // Fetch residents from API
  const fetchResidents = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        isVerified: true
      });

      if (searchTerm) queryParams.append('name', searchTerm);
      if (selectedAddress) queryParams.append('address', selectedAddress);
      if (selectedPrecinct) queryParams.append('precinctLevel', selectedPrecinct);
      if (selectedTypes.length > 0) queryParams.append('types', selectedTypes.join(','));
      if (voterStatus) queryParams.append('isVoter', voterStatus === 'yes');

      const response = await fetch(`http://localhost:3002/residents?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setResidents(data.data);
        setTotalRows(data.pagination.total);
      } else {
        console.error('Failed to fetch residents:', data.message);
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching resident data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch precinct and address options
  const fetchOptions = async () => {
    try {
      const response = await fetch('http://localhost:3002/residents?limit=1000&isVerified=true', {
        method: 'GET',
        credentials: 'include' // Important for sending cookies
      });

      const data = await response.json();
      
      if (data.success) {
        // Extract unique precinct levels and addresses
        const precincts = [...new Set(data.data.map(res => res.precinctLevel).filter(Boolean))];
        const addresses = [...new Set(data.data.map(res => res.address).filter(Boolean))];
        
        setPrecinctOptions(precincts.sort());
        setAddressOptions(addresses.sort());
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  // Fetch pending resident requests
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('http://localhost:3002/residents?isVerified=false', {
        method: 'GET',
        credentials: 'include' // Important for sending cookies
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAddress('');
    setSelectedPrecinct('');
    setSelectedTypes([]);
    setVoterStatus('');
    setPage(0);
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      address: '',
      precinctLevel: '',
      contactNumber: '',
      email: '',
      types: [],
      isVoter: false
    });
    setDuplicateWarning(null);
    setOpenAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (resident) => {
    setSelectedResident(resident);
    setFormData({
      firstName: resident.firstName,
      middleName: resident.middleName || '',
      lastName: resident.lastName,
      address: resident.address,
      precinctLevel: resident.precinctLevel || '',
      contactNumber: resident.contactNumber || '',
      email: resident.email || '',
      types: resident.types || [],
      isVoter: resident.isVoter || false
    });
    setDuplicateWarning(null);
    setPassword('');
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (resident) => {
    setSelectedResident(resident);
    setPassword('');
    setOpenDeleteDialog(true);
  };

  // Open upload dialog
  const handleOpenUploadDialog = () => {
    setCsvFile(null);
    setPassword('');
    setOpenUploadDialog(true);
  };

  // Open verify dialog
  const handleOpenVerifyDialog = (resident) => {
    setSelectedResident(resident);
    setOpenVerifyDialog(true);
  };

  // Open pending requests dialog
  const handleOpenPendingDialog = () => {
    fetchPendingRequests();
    setOpenPendingDialog(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check for duplicates on name changes
    if (name === 'firstName' || name === 'lastName') {
      checkForDuplicates({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle types selection change
  const handleTypesChange = (e) => {
    setFormData({
      ...formData,
      types: e.target.value
    });
  };

  // Enhanced duplicate check function with more flexible matching
  const checkForDuplicates = async (data) => {
    if (!data.firstName || !data.lastName) return;
    
    try {
      // First try an exact match (case insensitive)
      const exactMatches = await fetch(`http://localhost:3002/residents/check-duplicate?firstName=${encodeURIComponent(data.firstName)}&lastName=${encodeURIComponent(data.lastName)}&isVerified=true`, {
        method: 'GET',
        credentials: 'include'
      });

      const exactResult = await exactMatches.json();
      
      if (exactResult.success && exactResult.hasDuplicates) {
        console.log("Found exact duplicate matches:", exactResult.duplicates);
        setDuplicateWarning(exactResult.duplicates);
        
        // Set a warning in the snackbar
        setSnackbar({
          open: true,
          message: 'Warning: Exact name matches found in the database!',
          severity: 'warning'
        });
        
        return;
      }
      
      // If no exact match, try a more flexible match (partial name match)
      // This could be implemented with a different endpoint on your backend
      // For now, we'll just check for partial last name matches as an example
      const partialLastName = data.lastName.length > 3 ? data.lastName.substring(0, Math.floor(data.lastName.length * 0.7)) : data.lastName;
      
      const partialMatches = await fetch(`http://localhost:3002/residents?name=${encodeURIComponent(partialLastName)}&limit=5&isVerified=true`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const partialResult = await partialMatches.json();
      
      if (partialResult.success && partialResult.data.length > 0) {
        // Filter out any irrelevant results
        const similarNames = partialResult.data.filter(res => 
          res.lastName.toLowerCase().includes(data.lastName.toLowerCase().substring(0, 3)) ||
          data.lastName.toLowerCase().includes(res.lastName.toLowerCase().substring(0, 3)) ||
          res.firstName.toLowerCase().includes(data.firstName.toLowerCase().substring(0, 3)) ||
          data.firstName.toLowerCase().includes(res.firstName.toLowerCase().substring(0, 3))
        );
        
        if (similarNames.length > 0) {
          console.log("Found similar name matches:", similarNames);
          setDuplicateWarning(similarNames);
          
          // Notify about similar matches
          setSnackbar({
            open: true,
            message: 'Warning: Similar name matches found in the database',
            severity: 'info'
          });
          
          return;
        }
      }
      
      // No duplicates found
      setDuplicateWarning(null);
      
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setDuplicateWarning(null);
    }
  };

  // Create new resident - without password verification
  const handleAddResident = async () => {
    try {
      const response = await fetch('http://localhost:3002/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident added successfully',
          severity: 'success'
        });
        setOpenAddDialog(false);
        fetchResidents();
        fetchOptions();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      setSnackbar({
        open: true,
        message: 'Error adding resident',
        severity: 'error'
      });
    }
  };

  const handleUpdateResident = async () => {
    if (!password) {
      setSnackbar({
        open: true,
        message: 'Password is required to update resident information',
        severity: 'error'
      });
      return;
    }
  
    try {
      // This is the correct URL and method
      const response = await fetch(`http://localhost:3002/residents/${selectedResident._id}`, {
        method: 'PUT', // Using correct method
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          password // Include password
        })
      });
  
      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident updated successfully',
          severity: 'success'
        });
        setOpenEditDialog(false);
        setPassword('');
        fetchResidents();
        fetchOptions();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      setSnackbar({
        open: true,
        message: 'Error updating resident',
        severity: 'error'
      });
    }
  };

  // Delete resident - FIX
  const handleDeleteResident = async () => {
    if (!password) {
      setSnackbar({
        open: true,
        message: 'Password is required to delete a resident',
        severity: 'error'
      });
      return;
    }

    try {
      // This is the correct URL and method
      const response = await fetch(`http://localhost:3002/residents/${selectedResident._id}`, {
        method: 'DELETE', // Using correct method
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password }) // Only send the password
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident deleted successfully',
          severity: 'success'
        });
        setOpenDeleteDialog(false);
        setPassword('');
        fetchResidents();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting resident',
        severity: 'error'
      });
    }
  };

  // Handle CSV file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  // Import residents from CSV
  const handleImportResidents = async () => {
    if (!csvFile) {
      setSnackbar({
        open: true,
        message: 'Please select a CSV file to import',
        severity: 'error'
      });
      return;
    }

    if (!password) {
      setSnackbar({
        open: true,
        message: 'Password is required to import residents',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:3002/residents/import', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'success'
        });
        setOpenUploadDialog(false);
        setCsvFile(null);
        setPassword('');
        fetchResidents();
        fetchOptions();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error importing residents:', error);
      setSnackbar({
        open: true,
        message: 'Error importing residents',
        severity: 'error'
      });
    }
  };

  // Verify resident - FIX
  const handleVerifyResident = async () => {
    try {
      const response = await fetch(`http://localhost:3002/residents/${selectedResident._id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Add this for cookies
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident verified successfully',
          severity: 'success'
        });
        setOpenVerifyDialog(false);
        fetchResidents();
        fetchPendingRequests();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying resident:', error);
      setSnackbar({
        open: true,
        message: 'Error verifying resident',
        severity: 'error'
      });
    }
  };

  // Reject resident request with reason
  const handleRejectWithReason = async () => {
    try {
      // Make sure there's a rejection reason
      if (!rejectReason.trim()) {
        setSnackbar({
          open: true,
          message: 'Rejection reason is required',
          severity: 'error'
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3002/residents/${selectedResident._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          rejectReason: rejectReason  // Send the rejection reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident request rejected successfully',
          severity: 'success'
        });
        // Clear the state variables
        setRejectReason('');
        fetchPendingRequests();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error rejecting resident request:', error);
      setSnackbar({
        open: true,
        message: 'Error rejecting resident request',
        severity: 'error'
      });
    }
  };

  // Render resident types as chips
  const renderTypes = (types) => {
    if (!types || types.length === 0) return <Typography variant="body2">-</Typography>;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {types.map((type) => (
          <Chip 
            key={type} 
            label={type} 
            size="small" 
            sx={{ 
              backgroundColor: getTypeColor(type),
              color: '#fff'
            }} 
          />
        ))}
      </Box>
    );
  };

  // Get color for resident type
  const getTypeColor = (type) => {
    switch(type) {
      case 'Minor': return '#3f51b5';
      case '18-30': return '#009688';
      case 'Illiterate': return '#ff9800';
      case 'PWD': return '#e91e63';
      case 'Senior Citizen': return '#673ab7';
      case 'Indigent': return '#795548';
      default: return '#9e9e9e';
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h2">
          Resident Database
        </Typography>
        <Box>
          {pendingRequests.length > 0 && (
            <Button
              variant="outlined"
              color="warning"
              onClick={handleOpenPendingDialog}
              startIcon={<WarningIcon />}
              sx={{ mr: 1 }}
            >
              Pending Requests ({pendingRequests.length})
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleOpenUploadDialog}
            startIcon={<UploadIcon />}
            sx={{ mr: 1 }}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenAddDialog}
            startIcon={<AddIcon />}
          >
            Add Resident
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search by Name"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="address-select-label">Address</InputLabel>
              <Select
                labelId="address-select-label"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                label="Address"
              >
                <MenuItem value="">All</MenuItem>
                {addressOptions.map((address) => (
                  <MenuItem key={address} value={address}>
                    {address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="precinct-select-label">Precinct</InputLabel>
              <Select
                labelId="precinct-select-label"
                value={selectedPrecinct}
                onChange={(e) => setSelectedPrecinct(e.target.value)}
                label="Precinct"
              >
                <MenuItem value="">All</MenuItem>
                {precinctOptions.map((precinct) => (
                  <MenuItem key={precinct} value={precinct}>
                    {precinct}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="types-select-label">Resident Type</InputLabel>
              <Select
                labelId="types-select-label"
                multiple
                value={selectedTypes}
                onChange={(e) => setSelectedTypes(e.target.value)}
                input={<OutlinedInput label="Resident Type" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {residentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="voter-select-label">Voter</InputLabel>
              <Select
                labelId="voter-select-label"
                value={voterStatus}
                onChange={(e) => setVoterStatus(e.target.value)}
                label="Voter"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<RefreshIcon />}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Residents Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Precinct</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Types</TableCell>
                <TableCell>Voter</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : residents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No residents found
                  </TableCell>
                </TableRow>
              ) : (
                residents.map((resident) => (
                  <TableRow key={resident._id} hover>
                    <TableCell>
                      {resident.firstName === 'Resident' 
                        ? resident.lastName // Display just the lastName for legacy entries (contains full name)
                        : `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`}
                      {!resident.isVerified && (
                        <Chip 
                          label="Pending" 
                          size="small" 
                          color="warning" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{resident.address}</TableCell>
                    <TableCell>{resident.precinctLevel || '-'}</TableCell>
                    <TableCell>{resident.contactNumber || '-'}</TableCell>
                    <TableCell>{renderTypes(resident.types)}</TableCell>
                    <TableCell>{resident.isVoter ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      {!resident.isVerified ? (
                        <Tooltip title="Verify">
                          <IconButton 
                            color="success" 
                            onClick={() => handleOpenVerifyDialog(resident)}
                            size="small"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title="Edit">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenEditDialog(resident)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteDialog(resident)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Resident Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Resident</DialogTitle>
        <DialogContent>
          {duplicateWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Potential duplicate found: {duplicateWarning.map(r => 
                r.firstName === 'Resident' 
                  ? r.lastName  // For legacy format
                  : `${r.lastName}, ${r.firstName} ${r.middleName || ''}`
              ).join(', ')}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precinct Level"
                name="precinctLevel"
                value={formData.precinctLevel}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="add-types-label">Resident Types</InputLabel>
                <Select
                  labelId="add-types-label"
                  multiple
                  value={formData.types}
                  onChange={handleTypesChange}
                  input={<OutlinedInput label="Resident Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                    )}
                    >
                      {residentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isVoter}
                        onChange={handleCheckboxChange}
                        name="isVoter"
                      />
                    }
                    label="Registered Voter"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddResident} variant="contained">Add Resident</Button>
            </DialogActions>
          </Dialog>

          {/* Edit Resident Dialog */}
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precinct Level"
                name="precinctLevel"
                value={formData.precinctLevel}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="add-types-label">Resident Types</InputLabel>
                <Select
                  labelId="add-types-label"
                  multiple
                  value={formData.types}
                  onChange={handleTypesChange}
                  input={<OutlinedInput label="Resident Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                    )}
                    >
                      {residentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isVoter}
                        onChange={handleCheckboxChange}
                        name="isVoter"
                      />
                    }
                    label="Registered Voter"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Enter your password to confirm changes"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    helperText="For security reasons, please enter your password to modify resident information"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateResident} variant="contained">Update Resident</Button>
            </DialogActions>
          </Dialog>

          {/* Delete Resident Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Resident</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the resident record for {selectedResident?.lastName}, {selectedResident?.firstName} {selectedResident?.middleName}? 
            This action cannot be undone.
          </DialogContentText>
          <TextField
            fullWidth
            margin="dense"
            label="Enter your password to confirm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteResident} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)}>
        <DialogTitle>Import Residents from CSV</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Upload a CSV file to import multiple residents at once. The CSV should have the following columns:
          </DialogContentText>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2">Required Columns:</Typography>
            <Typography variant="body2">- Name (format: "Last name, First name Middle name")</Typography>
            <Typography variant="body2">- Address</Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Optional Columns:</Typography>
            <Typography variant="body2">- Precinct Level</Typography>
            <Typography variant="body2">- Type (comma-separated values)</Typography>
            <Typography variant="body2">- Voter (Yes/No)</Typography>
            <Typography variant="body2">- Contact Number</Typography>
            <Typography variant="body2">- Email</Typography>
          </Box>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Select CSV File
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {csvFile && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Selected file: {csvFile.name}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="dense"
            label="Enter your password to confirm import"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleImportResidents} 
            variant="contained"
            disabled={!csvFile || !password}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
          {/* reason reject dialog */}
          <Dialog 
            open={openRejectConfirmDialog} 
            onClose={() => setOpenRejectConfirmDialog(false)}
          >
            <DialogTitle>Provide Rejection Reason</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please provide a reason for rejecting the registration request from {selectedResident?.firstName} {selectedResident?.lastName}.
                This information will be visible to the resident.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Rejection Reason"
                type="text"
                fullWidth
                required
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                error={!rejectReason}
                helperText={!rejectReason ? "Rejection reason is required" : ""}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRejectConfirmDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => {
                  if (!rejectReason.trim()) {
                    setSnackbar({
                      open: true,
                      message: 'Please provide a rejection reason',
                      severity: 'error'
                    });
                    return;
                  }
                  handleRejectWithReason();
                  setOpenRejectConfirmDialog(false);
                }} 
                color="error" 
                variant="contained"
                disabled={!rejectReason.trim()}
              >
                Reject Request
              </Button>
            </DialogActions>
          </Dialog>

      {/* Enhanced Verify Resident Dialog */}
      <Dialog 
        open={openVerifyDialog} 
        onClose={() => setOpenVerifyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Verify Resident Request
        </DialogTitle>
        <DialogContent>
          {selectedResident && (
            <>
              {/* Check for duplicates when a resident is selected */}
              {duplicateWarning && duplicateWarning.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Potential Duplicate Records Found</AlertTitle>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    The following similar records were found in the database:
                  </Typography>
                  <ul style={{ margin: 0 }}>
                    {duplicateWarning.map((resident, index) => (
                      <li key={index}>
                        {resident.lastName}, {resident.firstName} - {resident.address}
                      </li>
                    ))}
                  </ul>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    You can still verify this resident if the information is correct and represents a different person.
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">First Name:</Typography>
                    <Typography variant="body1">{selectedResident.firstName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Middle Name:</Typography>
                    <Typography variant="body1">{selectedResident.middleName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Last Name:</Typography>
                    <Typography variant="body1">{selectedResident.lastName}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Address:</Typography>
                    <Typography variant="body1">{selectedResident.address}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Precinct Level:</Typography>
                    <Typography variant="body1">{selectedResident.precinctLevel || '-'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Contact Number:</Typography>
                    <Typography variant="body1">{selectedResident.contactNumber || '-'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Email:</Typography>
                    <Typography variant="body1">{selectedResident.email || '-'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Resident Types:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedResident.types && selectedResident.types.length > 0 ? (
                        selectedResident.types.map((type) => (
                          <Chip 
                            key={type} 
                            label={type} 
                            size="small" 
                            sx={{ 
                              backgroundColor: getTypeColor(type),
                              color: '#fff'
                            }} 
                          />
                        ))
                      ) : (
                        <Typography variant="body2">None specified</Typography>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Registered Voter:</Typography>
                    <Typography variant="body1">{selectedResident.isVoter ? 'Yes' : 'No'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenVerifyDialog(false);
              setOpenRejectConfirmDialog(true);
            }} 
            color="error"
            startIcon={<CancelIcon />}
          >
            Reject
          </Button>
          <Button 
            onClick={() => {
              setOpenVerifyDialog(false);
              setOpenVerifyConfirmDialog(true);
            }} 
            color="success" 
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pending Requests Dialog - Enhanced with more details */}
      <Dialog 
        open={openPendingDialog} 
        onClose={() => setOpenPendingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Pending Resident Requests
        </DialogTitle>
        <DialogContent>
          {pendingRequests.length === 0 ? (
            <Typography align="center" sx={{ py: 3 }}>
              No pending requests
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((resident) => (
                    <TableRow key={resident._id} hover>
                      <TableCell>
                        {resident.lastName}, {resident.firstName} {resident.middleName && resident.middleName}
                      </TableCell>
                      <TableCell>{resident.address}</TableCell>
                      <TableCell>{resident.contactNumber || '-'}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => {
                            setSelectedResident(resident);
                            setOpenPendingDialog(false);
                            setOpenVerifyDialog(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Verify">
                          <IconButton 
                            color="success" 
                            onClick={() => {
                              setSelectedResident(resident);
                              setOpenPendingDialog(false);
                              setOpenVerifyConfirmDialog(true);
                            }}
                            size="small"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              setSelectedResident(resident);
                              setOpenPendingDialog(false);
                              setOpenRejectConfirmDialog(true);
                            }}
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPendingDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Verify Confirmation Dialog - Enhanced with better duplicate warnings */}
      <Dialog open={openVerifyConfirmDialog} onClose={() => setOpenVerifyConfirmDialog(false)}>
        <DialogTitle>Confirm Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to verify and add {selectedResident?.firstName} {selectedResident?.lastName} to the resident database?
          </DialogContentText>
          
          {duplicateWarning && duplicateWarning.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Warning: Duplicate Records Found!</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                The following similar records already exist in the database:
              </Typography>
              <Box sx={{ ml: 2 }}>
                {duplicateWarning.map((resident, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {resident.lastName}, {resident.firstName} {resident.middleName || ''}
                    </Typography>
                    <Typography variant="body2">
                      Address: {resident.address}
                    </Typography>
                    {resident.contactNumber && (
                      <Typography variant="body2">
                        Contact: {resident.contactNumber}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                Do you still want to add this resident despite the potential duplicates?
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVerifyConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleVerifyResident();
              setOpenVerifyConfirmDialog(false);
            }} 
            color="success" 
            variant="contained"
          >
            Yes, Verify Resident
          </Button>
        </DialogActions>
      </Dialog>

      
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
  );
}

export default AdminDatabase;
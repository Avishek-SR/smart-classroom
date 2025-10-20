// UserManagementTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Switch,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Add,
  Refresh,
  Edit,
  Delete,
  Dashboard,
  ViewList,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { userService } from '../../../services/userService';

// FIXED: Improved authentication check to prevent redirects during form submission
const checkAuth = () => {
  const token = localStorage.getItem('accessToken');
  return !!token; // Simply return boolean, don't redirect here
};

// FIXED: Memoized UserFormDialog to prevent re-renders
const UserFormDialog = React.memo(({ 
  open, 
  onClose, 
  onSubmit, 
  title, 
  loading, 
  isEdit = false,
  initialFormData,
  formErrors 
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [dialogLoading, setDialogLoading] = useState(false);

  // FIXED: Reset form when dialog opens/closes or initialFormData changes
  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open, initialFormData]);

  const handleDialogSubmit = async (e) => {
    e.preventDefault();
    setDialogLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    if (!dialogLoading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={dialogLoading}
    >
      <form onSubmit={handleDialogSubmit}>
        <DialogTitle>
          {title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 0.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  required
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={dialogLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  required
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={dialogLoading}
                />
              </Grid>
              
              {/* Password Field */}
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  required={!isEdit}
                  name="password"
                  label={isEdit ? "New Password (leave blank to keep current)" : "Password *"}
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={dialogLoading}
                  placeholder={isEdit ? "Enter new password to change" : ""}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  required
                  name="role"
                  label="Role"
                  select
                  value={formData.role}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                  disabled={dialogLoading}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="hod">HOD</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  name="department"
                  label="Department"
                  select
                  value={formData.department}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={dialogLoading}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {[
                    'Computer Science',
                    'Mathematics',
                    'Physics',
                    'Chemistry',
                    'Biology',
                    'Electrical Engineering',
                    'Mechanical Engineering',
                    'Civil Engineering',
                    'Business Administration',
                    'Economics',
                    'Psychology',
                    'Administration'
                  ].map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Dynamic ID fields */}
              {formData.role === 'student' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    name="studentId"
                    label="Student ID"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.studentId}
                    helperText={formErrors.studentId}
                    disabled={dialogLoading}
                  />
                </Grid>
              )}
              
              {(formData.role === 'faculty' || formData.role === 'hod') && (
                <Grid item xs={12}>
                  <TextField
                    required
                    name="facultyId"
                    label="Faculty ID"
                    value={formData.facultyId}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.facultyId}
                    helperText={formErrors.facultyId}
                    disabled={dialogLoading}
                  />
                </Grid>
              )}
              
              {formData.role === 'admin' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    name="adminId"
                    label="Admin ID"
                    value={formData.adminId}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.adminId}
                    helperText={formErrors.adminId}
                    disabled={dialogLoading}
                  />
                </Grid>
              )}
              
              {formData.role === 'staff' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    name="staffId"
                    label="Staff ID"
                    value={formData.staffId}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.staffId}
                    helperText={formErrors.staffId}
                    disabled={dialogLoading}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  name="status"
                  label="Status"
                  select
                  value={formData.status}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={dialogLoading}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={dialogLoading}
            variant="outlined"
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 100 }}
          >
            {dialogLoading ? 'Saving...' : isEdit ? 'Update' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

// FIXED: Memoized GroupCard component
const GroupCard = React.memo(({ groupName, users, expandedGroups, toggleGroup, handleEditUser, handleDeleteUser, handleToggleStatus, actionLoading, getStatusColor }) => {
  const roleConfig = {
    admin: { color: 'error', icon: '👑', label: 'Admin' },
    hod: { color: 'info', icon: '🎓', label: 'HOD' },
    faculty: { color: 'warning', icon: '👨‍🏫', label: 'Faculty' },
    student: { color: 'success', icon: '🎒', label: 'Student' },
    staff: { color: 'secondary', icon: '👨‍💼', label: 'Staff' }
  };

  const config = roleConfig[groupName] || { color: 'default', icon: '👤', label: groupName };
  
  return (
    <Card 
      elevation={2}
      sx={{ 
        borderLeft: `4px solid`,
        borderColor: `${config.color}.main`,
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Group Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            cursor: 'pointer',
            backgroundColor: 'background.default',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
          onClick={() => toggleGroup(groupName)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: `${config.color}.main`, width: 48, height: 48 }}>
              <Typography variant="h6">{config.icon}</Typography>
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {config.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Array.isArray(users) ? users.length : 0} {Array.isArray(users) && users.length === 1 ? 'user' : 'users'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={config.label} 
              color={config.color} 
              size="small" 
              variant="outlined"
            />
            {expandedGroups[groupName] ? <ExpandLess /> : <ExpandMore />}
          </Box>
        </Box>

        {/* Group Users Table */}
        <Collapse in={expandedGroups[groupName]}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(users) && users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      opacity: user.status === 'Inactive' ? 0.7 : 1
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 2, 
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem'
                          }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.studentId || user.facultyId || user.adminId || user.staffId || 'N/A'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={user.status} 
                          color={getStatusColor(user.status)} 
                          size="small" 
                        />
                        <Tooltip title={`Toggle ${user.status === 'Active' ? 'Inactive' : 'Active'}`}>
                          <span>
                            <Switch 
                              checked={user.status === 'Active'} 
                              onChange={() => handleToggleStatus(user.id, user.status)} 
                              size="small"
                              disabled={actionLoading}
                              color={user.status === 'Active' ? 'success' : 'default'}
                            />
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit User">
                          <IconButton 
                            color="primary" 
                            size="small" 
                            onClick={() => handleEditUser(user)}
                            disabled={actionLoading}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            color="error" 
                            size="small" 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </CardContent>
    </Card>
  );
});

// FIXED: Memoized TableView component
const TableView = React.memo(({ users, handleEditUser, handleDeleteUser, handleToggleStatus, actionLoading, getRoleColor, getStatusColor }) => (
  <TableContainer 
    component={Paper} 
    elevation={2}
    sx={{ 
      maxHeight: '70vh',
      '& .MuiTableRow-root:hover': {
        backgroundColor: 'action.hover'
      }
    }}
  >
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>Name</TableCell>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>Email</TableCell>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>ID</TableCell>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>Role</TableCell>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>Department</TableCell>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>Status</TableCell>
          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.isArray(users) && users.map((user) => (
          <TableRow 
            key={user.id} 
            hover
            sx={{ 
              opacity: user.status === 'Inactive' ? 0.7 : 1
            }}
          >
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 2, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem'
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight="medium">
                  {user.name}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip 
                label={user.studentId || user.facultyId || user.adminId || user.staffId || 'N/A'} 
                size="small" 
                variant="outlined"
              />
            </TableCell>
            <TableCell>
              <Chip 
                label={user.role} 
                color={getRoleColor(user.role)} 
                size="small" 
              />
            </TableCell>
            <TableCell>{user.department || 'N/A'}</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={user.status} 
                  color={getStatusColor(user.status)} 
                  size="small" 
                />
                <Tooltip title={`Toggle ${user.status === 'Active' ? 'Inactive' : 'Active'}`}>
                  <span>
                    <Switch 
                      checked={user.status === 'Active'} 
                      onChange={() => handleToggleStatus(user.id, user.status)} 
                      size="small"
                      disabled={actionLoading}
                      color={user.status === 'Active' ? 'success' : 'default'}
                    />
                  </span>
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit User">
                  <IconButton 
                    color="primary" 
                    size="small" 
                    onClick={() => handleEditUser(user)}
                    disabled={actionLoading}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete User">
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={actionLoading}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [viewMode, setViewMode] = useState('groups');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // FIXED: Moved form state to separate state objects
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    studentId: '',
    facultyId: '',
    adminId: '',
    staffId: '',
    status: 'Active'
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    studentId: '',
    facultyId: '',
    adminId: '',
    staffId: '',
    status: 'Active'
  });

  const [formErrors, setFormErrors] = useState({});

  // Role configurations
  const roleConfig = {
    admin: { color: 'error', icon: '👑', label: 'Admin' },
    hod: { color: 'info', icon: '🎓', label: 'HOD' },
    faculty: { color: 'warning', icon: '👨‍🏫', label: 'Faculty' },
    student: { color: 'success', icon: '🎒', label: 'Student' },
    staff: { color: 'secondary', icon: '👨‍💼', label: 'Staff' }
  };

  // FIXED: Memoized fetchUsers to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    // Check auth before API call
    if (!checkAuth()) {
      alert('Please login first!');
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const result = await userService.fetchUsers();
      console.log('Fetch users result:', result);
      
      if (result.success) {
        const usersArray = Array.isArray(result.data) ? result.data : [];
        setUsers(usersArray);
      } else {
        showSnackbar(result.error, 'error');
        setUsers([]);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      showSnackbar('Failed to fetch users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchUsers();
    showSnackbar('Users refreshed successfully');
  }, [fetchUsers, showSnackbar]);

  const handleAddUser = useCallback(() => {
    setAddFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      department: '',
      studentId: '',
      facultyId: '',
      adminId: '',
      staffId: '',
      status: 'Active'
    });
    setFormErrors({});
    setOpenDialog(true);
  }, []);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role,
      department: user.department || '',
      studentId: user.studentId || '',
      facultyId: user.facultyId || '',
      adminId: user.adminId || '',
      staffId: user.staffId || '',
      status: user.status
    });
    setFormErrors({});
    setOpenEditDialog(true);
  }, []);

  // Form validation
  const validateForm = useCallback((formData, isEdit = false) => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Password validation for new users
    if (!isEdit && !formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Role-specific ID validation
    if (formData.role === 'student' && !formData.studentId) {
      errors.studentId = 'Student ID is required';
    }

    if ((formData.role === 'faculty' || formData.role === 'hod') && !formData.facultyId) {
      errors.facultyId = 'Faculty ID is required';
    }

    if (formData.role === 'admin' && !formData.adminId) {
      errors.adminId = 'Admin ID is required';
    }

    if (formData.role === 'staff' && !formData.staffId) {
      errors.staffId = 'Staff ID is required';
    }

    return errors;
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    // FIXED: Check authentication and handle redirect properly
    if (!checkAuth()) {
      alert('Please login first!');
      window.location.href = '/login';
      return;
    }
    
    const errors = validateForm(formData, false);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setActionLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        status: formData.status,
        studentId: formData.role === 'student' ? formData.studentId : '',
        facultyId: (formData.role === 'faculty' || formData.role === 'hod') ? formData.facultyId : '',
        adminId: formData.role === 'admin' ? formData.adminId : '',
        staffId: formData.role === 'staff' ? formData.staffId : ''
      };

      const result = await userService.createUser(submitData);
      
      if (result.success) {
        setOpenDialog(false);
        await fetchUsers();
        showSnackbar('User added successfully');
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      console.error('Add user error:', error);
      showSnackbar('Failed to add user', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers, showSnackbar, validateForm]);

  const handleUpdate = useCallback(async (formData) => {
    // FIXED: Check authentication and handle redirect properly
    if (!checkAuth()) {
      alert('Please login first!');
      window.location.href = '/login';
      return;
    }
    
    const errors = validateForm(formData, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setActionLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        status: formData.status,
        studentId: formData.role === 'student' ? formData.studentId : '',
        facultyId: (formData.role === 'faculty' || formData.role === 'hod') ? formData.facultyId : '',
        adminId: formData.role === 'admin' ? formData.adminId : '',
        staffId: formData.role === 'staff' ? formData.staffId : ''
      };

      // Only include password if it was changed
      if (formData.password) {
        submitData.password = formData.password;
      }

      const result = await userService.updateUser(selectedUser.id, submitData);
      
      if (result.success) {
        setOpenEditDialog(false);
        setSelectedUser(null);
        await fetchUsers();
        showSnackbar('User updated successfully');
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      console.error('Update user error:', error);
      showSnackbar('Failed to update user', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers, showSnackbar, validateForm, selectedUser]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    // FIXED: Check authentication and handle redirect properly
    if (!checkAuth()) {
      alert('Please login first!');
      window.location.href = '/login';
      return;
    }

    setActionLoading(true);
    
    try {
      const result = await userService.deleteUser(userId);
      
      if (result.success) {
        await fetchUsers();
        showSnackbar('User deleted successfully');
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      showSnackbar('Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers, showSnackbar]);

  const handleToggleStatus = useCallback(async (userId, currentStatus) => {
    // FIXED: Check authentication and handle redirect properly
    if (!checkAuth()) {
      alert('Please login first!');
      window.location.href = '/login';
      return;
    }

    setActionLoading(true);
    
    try {
      const result = await userService.toggleUserStatus(userId, currentStatus);
      
      if (result.success) {
        await fetchUsers();
        showSnackbar(`User status updated to ${result.data.newStatus}`);
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      showSnackbar('Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers, showSnackbar]);

  const getRoleColor = useCallback((role) => {
    return roleConfig[role]?.color || 'default';
  }, []);

  const getStatusColor = useCallback((status) => {
    return status === 'Active' ? 'success' : 'error';
  }, []);

  // Group users by role
  const groupedUsers = Array.isArray(users) ? users.reduce((groups, user) => {
    const role = user.role;
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(user);
    return groups;
  }, {}) : {};

  const toggleGroup = useCallback((groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          👥 User Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Tabs 
            value={viewMode} 
            onChange={(e, newValue) => setViewMode(newValue)}
            sx={{ 
              mr: 2,
              '& .MuiTab-root': { minHeight: 48 }
            }}
          >
            <Tab 
              icon={<Dashboard />} 
              label="Group View" 
              value="groups" 
              iconPosition="start"
            />
            <Tab 
              icon={<ViewList />} 
              label="Table View" 
              value="table" 
              iconPosition="start"
            />
          </Tabs>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
            disabled={loading || actionLoading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleAddUser}
            disabled={actionLoading}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && users.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading users...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          p: 8,
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No users found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleAddUser}
          >
            Add First User
          </Button>
        </Box>
      )}

      {/* Content */}
      {!loading && users.length > 0 && (
        viewMode === 'groups' ? (
          <>
            {Object.entries(groupedUsers).map(([groupName, groupUsers]) => (
              <GroupCard 
                key={groupName} 
                groupName={groupName} 
                users={groupUsers}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                handleEditUser={handleEditUser}
                handleDeleteUser={handleDeleteUser}
                handleToggleStatus={handleToggleStatus}
                actionLoading={actionLoading}
                getStatusColor={getStatusColor}
              />
            ))}
          </>
        ) : (
          <TableView 
            users={users}
            handleEditUser={handleEditUser}
            handleDeleteUser={handleDeleteUser}
            handleToggleStatus={handleToggleStatus}
            actionLoading={actionLoading}
            getRoleColor={getRoleColor}
            getStatusColor={getStatusColor}
          />
        )
      )}

      {/* Dialogs */}
      <UserFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        title="Add New User"
        loading={actionLoading}
        isEdit={false}
        initialFormData={addFormData}
        formErrors={formErrors}
      />

      <UserFormDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdate}
        title="Edit User"
        loading={actionLoading}
        isEdit={true}
        initialFormData={editFormData}
        formErrors={formErrors}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(UserManagementTab);
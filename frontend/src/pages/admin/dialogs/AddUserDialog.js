import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

const AddUserDialog = ({ open, onClose, onUserAdded }) => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FIXED: Better handleInputChange function
  const handleInputChange = (field, value) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleAddUser = async () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!newUser.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (response.status === 409) {
          setError('User with this email already exists');
        } else {
          const errorData = await response.json();
          setError(errorData.message || `HTTP error! status: ${response.status}`);
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log('User added successfully:', result);

      // Notify parent component dynamically
      if (onUserAdded) {
        onUserAdded(result.user || result);
      }

      // Reset form and close dialog
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: ''
      });
      setError('');
      onClose();
      
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'student',
      department: ''
    });
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Full Name *"
            margin="normal"
            value={newUser.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email *"
            margin="normal"
            type="email"
            value={newUser.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password *"
            margin="normal"
            type="password"
            value={newUser.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={loading}
          />

          <FormControl fullWidth margin="normal" disabled={loading}>
            <InputLabel>Role *</InputLabel>
            <Select
              value={newUser.role}
              label="Role *"
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Department"
            margin="normal"
            value={newUser.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            disabled={loading}
            placeholder="e.g., Computer Science, Mathematics"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAddUser}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Adding...' : 'Add User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
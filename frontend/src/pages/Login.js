import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Link
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending login request to:', `${API_BASE}/api/auth/login`);
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        const token = data.token || data.data?.token || data.accessToken;
        const user = data.user || data.data?.user;

        if (!token) {
          setError('No token received from server');
          setLoading(false);
          return;
        }

        // Save token and user to localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        console.log("Token received:", token);
        console.log("User received:", user);

        // Redirect based on role
        switch (user?.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'faculty':
            navigate('/faculty');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          p: 5, 
          width: '100%',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <School 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                borderRadius: '50%',
                p: 1
              }} 
            />
          </Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Smart Classroom
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to access your educational portal
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
            <Link 
              href="#" 
              variant="body2" 
              sx={{ 
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Forgot your password?
            </Link>
          </Box>
          
          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 2, 
              mb: 3, 
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
            size="large"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Welcome Back
          </Typography>
        </Divider>

        {/* Additional Information */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Secure access to your educational resources and tools
          </Typography>
        </Box>

        {/* Support Information */}
        <Box 
          sx={{ 
            mt: 3, 
            p: 2, 
            backgroundColor: 'rgba(25, 118, 210, 0.04)', 
            borderRadius: 2,
            border: '1px solid rgba(25, 118, 210, 0.1)'
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center">
            🔒 Your credentials are securely encrypted. Contact IT support if you encounter any issues.
          </Typography>
        </Box>
      </Paper>

      {/* Footer */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 20, 
          width: '100%', 
          textAlign: 'center' 
        }}
      >
        <Typography variant="caption" color="white">
          © 2024 Smart Classroom System. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
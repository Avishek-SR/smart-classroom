// services/authService.js

const API_BASE_URL = 'http://localhost:5001/api';

export const authService = {
  // Login user and store token
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.accessToken || data.token || data.data?.token) {
        // Handle different response structures
        const token = data.accessToken || data.token || data.data?.token;
        const user = data.user || data.data?.user;
        
        // Store token and user in localStorage
        localStorage.setItem('accessToken', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          success: true,
          token: token,
          user: user,
          message: data.message || 'Login successful'
        };
      }
      
      throw new Error('No token received from server');
    } catch (error) {
      console.error('Auth service login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.accessToken || data.token) {
        const token = data.accessToken || data.token;
        const user = data.user;
        
        // Store token and user in localStorage
        localStorage.setItem('accessToken', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          success: true,
          token: token,
          user: user,
          message: data.message || 'Registration successful'
        };
      }
      
      return {
        success: true,
        message: data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('Auth service register error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    return { success: true, message: 'Logged out successfully' };
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    // Optional: Check token expiry if it's a JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch (error) {
      // If token is not a JWT, just check if it exists
      return true;
    }
  },

  // Refresh token (if using refresh tokens)
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return {
          success: true,
          token: data.accessToken,
          message: 'Token refreshed successfully'
        };
      }
      
      throw new Error('No new token received');
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        success: false,
        error: error.message || 'Token refresh failed'
      };
    }
  },

  // Verify token with server
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Token verification failed');
      }

      return {
        success: true,
        user: data.user,
        message: 'Token is valid'
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error.message || 'Token verification failed'
      };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }

      return {
        success: true,
        message: data.message || 'Password reset instructions sent to your email'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset request failed'
      };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return {
        success: true,
        message: data.message || 'Password reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update user in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user,
        message: data.message || 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  }
};

export default authService;
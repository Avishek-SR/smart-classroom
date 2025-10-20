// services/userService.js
const API_BASE_URL = 'http://localhost:5001/api';

// Get token and create headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.error('No access token found in localStorage');
    throw new Error('No access token found. Please login again.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const userService = {
  fetchUsers: async () => {
    try {
      console.log('🔄 Fetching users from:', `${API_BASE_URL}/users`);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      // Handle different response structures
      let usersArray = [];
      
      if (Array.isArray(data)) {
        // If response is directly an array
        usersArray = data;
        console.log('📊 Using direct array, count:', usersArray.length);
      } else if (data.data && Array.isArray(data.data)) {
        // If response has { data: [...] }
        usersArray = data.data;
        console.log('📊 Using data.array, count:', usersArray.length);
      } else if (data.users && Array.isArray(data.users)) {
        // If response has { users: [...] }
        usersArray = data.users;
        console.log('📊 Using users array, count:', usersArray.length);
      } else if (data.success && Array.isArray(data.data)) {
        // If response has { success: true, data: [...] }
        usersArray = data.data;
        console.log('📊 Using success.data array, count:', usersArray.length);
      } else {
        console.warn('⚠️ Unknown response structure, returning empty array');
        usersArray = [];
      }
      
      console.log('🎯 Final users array to return:', usersArray);
      
      return { 
        success: true, 
        data: usersArray 
      };
    } catch (error) {
      console.error('❌ Fetch users error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch users' 
      };
    }
  },

  createUser: async (userData) => {
    try {
      console.log('🔄 Creating user with data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      console.log('📡 Create user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create user response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Create user response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Create user error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create user' 
      };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      console.log('🔄 Updating user:', userId, 'with data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      console.log('📡 Update user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update user response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Update user response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Update user error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update user' 
      };
    }
  },

  deleteUser: async (userId) => {
    try {
      console.log('🔄 Deleting user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('📡 Delete user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete user response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Delete user response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete user' 
      };
    }
  },

  toggleUserStatus: async (userId, currentStatus) => {
    try {
      console.log('🔄 Toggling user status:', userId, 'from', currentStatus);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: currentStatus === 'Active' ? 'Inactive' : 'Active'
        })
      });

      console.log('📡 Toggle status response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Toggle status response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Toggle status response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Toggle status error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update user status' 
      };
    }
  }
};
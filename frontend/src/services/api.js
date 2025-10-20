import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: Please check your connection');
    }
    
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'Server error occurred';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Cannot connect to server. Please check if the backend is running.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
);

export const userAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  addUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // ADDED: Course-Faculty Mapping Methods
  mapCourseToFaculty: async (mappingData) => {
    const response = await api.post('/courses/map-faculty', mappingData);
    return response.data;
  },
  
  unmapCourseFromFaculty: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}/unmap-faculty`);
    return response.data;
  },
  
  getFacultyMembers: async () => {
    const response = await api.get('/users/faculty');
    return response.data;
  }
};

export default api;
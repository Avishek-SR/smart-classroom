const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Fixed port to 5001

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized (token expired/invalid)
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API service functions
export const apiService = {
  // Auth
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    });
  },

  // Users
  getUsers: async () => {
    return apiRequest('/users');
  },
  
  createUser: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: userData
    });
  },
  
  updateUser: async (userId, userData) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: userData
    });
  },
  
  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Courses
  getCourses: async () => {
    return apiRequest('/courses');
  },
  
  createCourse: async (courseData) => {
    return apiRequest('/courses', {
      method: 'POST',
      body: courseData
    });
  },
  
  updateCourse: async (courseId, courseData) => {
    return apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: courseData
    });
  },
  
  deleteCourse: async (courseId) => {
    return apiRequest(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  },

  // Classrooms
  getClassrooms: async () => {
    return apiRequest('/classrooms');
  },
  
  createClassroom: async (classroomData) => {
    return apiRequest('/classrooms', {
      method: 'POST',
      body: classroomData
    });
  },
  
  deleteClassroom: async (classroomId) => {
    return apiRequest(`/classrooms/${classroomId}`, {
      method: 'DELETE'
    });
  },

  // System Stats
  getSystemStats: async () => {
    return apiRequest('/system/stats');
  },

  // Timetable
  generateTimetable: async (timetableData) => {
    return apiRequest('/timetable/generate', {
      method: 'POST',
      body: timetableData
    });
  },

  // Course-Faculty Mapping
  mapCourseToFaculty: async (mappingData) => {
    return apiRequest('/courses/map-faculty', {
      method: 'POST',
      body: mappingData
    });
  },

  // Health check (no auth required)
  healthCheck: async () => {
    return fetch(`${API_BASE_URL}/health`).then(res => res.json());
  }
};

export default apiService;
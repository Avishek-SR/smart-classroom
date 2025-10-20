// services/courseService.js
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

export const courseService = {
  // Fetch all courses
  fetchCourses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Fetch courses error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch courses' 
      };
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Create course error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create course' 
      };
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Update course error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update course' 
      };
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Delete course error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete course' 
      };
    }
  }
};
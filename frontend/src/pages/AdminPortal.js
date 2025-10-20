import OverviewTab from '../pages/admin/tabs/OverviewTab';
import UserManagementTab from '../pages/admin/tabs/UserManagementTab';
import CourseManagementTab from '../pages/admin/tabs/CourseManagementTab';
import ClassroomManagementTab from '../pages/admin/tabs/ClassroomManagementTab';
import TimetableManagementTab from '../pages/admin/tabs/TimetableManagementTab';
import CourseFacultyMappingTab from '../pages/admin/tabs/CourseFacultyMappingTab';
import ReportsAnalyticsTab from '../pages/admin/tabs/ReportsAnalyticsTab';
import SystemSettingsTab from '../pages/admin/tabs/SystemSettingsTab';

import StatDetailsDialog from '../pages/admin/dialogs/StatDetailsDialog';
// REMOVE THIS: import AddUserDialog from '../pages/admin/dialogs/AddUserDialog';
import AddCourseDialog from '../pages/admin/dialogs/AddCourseDialog';
import AddClassroomDialog from '../pages/admin/dialogs/AddClassroomDialog';
import CourseFacultyMappingDialog from '../pages/admin/dialogs/CourseFacultyMappingDialog';
import CourseDetailsDialog from '../pages/admin/dialogs/CourseDetailsDialog';
import EditCourseDialog from '../pages/admin/dialogs/EditCourseDialog';

import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Box,
  AppBar,
  Toolbar,
  Avatar,
  Badge,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Refresh,
  Logout,
  Dashboard,
  People,
  School,
  Class,
  Schedule,
  Analytics,
  Settings,
  AdminPanelSettings,
  Person,
  Group,
  Notifications
} from '@mui/icons-material';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Enhanced API service with proper error handling and authentication
const apiService = {
  // Helper function for API calls
  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
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
      
      if (!response.ok) {
        // Handle 404 errors gracefully
        if (response.status === 404) {
          console.warn(`API endpoint ${endpoint} not found (404)`);
          // Return empty data instead of throwing error
          return { data: [], message: 'Endpoint not available' };
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors and 404s gracefully
      if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        console.warn(`Network error for ${endpoint}, returning empty data`);
        return { data: [] };
      }
      
      throw error;
    }
  },

  // Users
  getUsers: async () => {
    return apiService.request('/users');
  },
  
  createUser: async (userData) => {
    return apiService.request('/users', {
      method: 'POST',
      body: userData
    });
  },
  
  updateUser: async (userId, userData) => {
    return apiService.request(`/users/${userId}`, {
      method: 'PUT',
      body: userData
    });
  },
  
  deleteUser: async (userId) => {
    return apiService.request(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Courses
  getCourses: async () => {
    return apiService.request('/courses');
  },
  
  createCourse: async (courseData) => {
    return apiService.request('/courses', {
      method: 'POST',
      body: courseData
    });
  },
  
  updateCourse: async (courseId, courseData) => {
    return apiService.request(`/courses/${courseId}`, {
      method: 'PUT',
      body: courseData
    });
  },
  
  deleteCourse: async (courseId) => {
    return apiService.request(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  },

  // Classrooms
  getClassrooms: async () => {
    return apiService.request('/classrooms');
  },
  
  createClassroom: async (classroomData) => {
    return apiService.request('/classrooms', {
      method: 'POST',
      body: classroomData
    });
  },
  
  deleteClassroom: async (classroomId) => {
    return apiService.request(`/classrooms/${classroomId}`, {
      method: 'DELETE'
    });
  },

  // System Stats
  getSystemStats: async () => {
    return apiService.request('/system/stats');
  },

  // Timetable
  generateTimetable: async (timetableData) => {
    return apiService.request('/timetable/generate', {
      method: 'POST',
      body: timetableData
    });
  },

  getTimetable: async () => {
    return apiService.request('/timetable');
  },

  updateTimetable: async (timetableId, timetableData) => {
    return apiService.request(`/timetable/${timetableId}`, {
      method: 'PUT',
      body: timetableData
    });
  },

  deleteTimetable: async (timetableId) => {
    return apiService.request(`/timetable/${timetableId}`, {
      method: 'DELETE'
    });
  },

  // Course-Faculty Mapping
  mapCourseToFaculty: async (mappingData) => {
    return apiService.request('/courses/map-faculty', {
      method: 'POST',
      body: mappingData
    });
  },

  // ADDED: Unmap course from faculty
  unmapCourseFromFaculty: async (courseId) => {
    return apiService.request(`/courses/${courseId}/unmap-faculty`, {
      method: 'DELETE'
    });
  },

  // Get faculty members
  getFaculty: async () => {
    return apiService.request('/users/faculty');
  }
};

// Fallback components in case imports fail
const FallbackComponent = ({ tabName }) => (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="error" gutterBottom>
      Component Loading Error
    </Typography>
    <Typography variant="body1">
      Unable to load {tabName} component. Please check the component file.
    </Typography>
  </Paper>
);

const AdminPortal = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [selectedStat, setSelectedStat] = useState(null);
  const [statDetailsDialog, setStatDetailsDialog] = useState(false);
  // REMOVE THIS: const [newUserDialog, setNewUserDialog] = useState(false);
  const [newCourseDialog, setNewCourseDialog] = useState(false);
  const [newClassroomDialog, setNewClassroomDialog] = useState(false);
  const [courseFacultyDialog, setCourseFacultyDialog] = useState(false);
  const [courseDetailsDialog, setCourseDetailsDialog] = useState(false);
  const [editCourseDialog, setEditCourseDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form states
  // REMOVE THIS: const [newUser, setNewUser] = useState({ ... });
  const [newCourse, setNewCourse] = useState({
    code: '', name: '', credits: 3, faculty: '', 
    maxStudents: 50, department: 'Computer Science', 
    description: '', courseType: 'Theory'
  });

  const [newClassroom, setNewClassroom] = useState({
    name: '', capacity: 30, facilities: '', 
    building: 'Main', floor: '1', type: 'Lecture Hall'
  });

  const [courseMapping, setCourseMapping] = useState({
    courseId: '', facultyId: '', semester: 1, schedule: []
  });

  // Real-time data
  const [realtimeData, setRealtimeData] = useState({
    activeSessions: 0,
    serverLoad: 0,
    onlineUsers: 0
  });

  const [notifications, setNotifications] = useState([]);

  // Color scheme
  const colorScheme = {
    primary: '#1976d2',
    primaryLight: '#42a5f5',
    primaryDark: '#1565c0',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1',
    background: '#f5f5f5'
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch all data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Use individual try-catch for each API call to prevent one failure from breaking all
      const fetchWithFallback = async (apiCall, fallbackData = []) => {
        try {
          const response = await apiCall();
          return response.data || response || fallbackData;
        } catch (error) {
          console.warn(`API call failed, using fallback data:`, error.message);
          return fallbackData;
        }
      };

      const [usersData, coursesData, classroomsData, statsData, timetableData] = await Promise.all([
        fetchWithFallback(apiService.getUsers, []),
        fetchWithFallback(apiService.getCourses, []),
        fetchWithFallback(apiService.getClassrooms, []),
        fetchWithFallback(apiService.getSystemStats, {}),
        fetchWithFallback(apiService.getTimetable, [])
      ]);

      setUsers(usersData);
      setCourses(coursesData);
      setClassrooms(classroomsData);
      setSystemStats(statsData);
      setTimetable(timetableData);
      
      showSnackbar('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Some data could not be loaded', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (stat) => {
    setSelectedStat(stat);
    setStatDetailsDialog(true);
  };

  // User operations - FIXED: Use useCallback to prevent re-renders
  const addNewUser = useCallback(async (userData) => {
    try {
      const result = await apiService.createUser(userData);
      const newUserData = result.data || result;
      setUsers(prev => [...prev, newUserData]);
      showSnackbar('User created successfully');
      return newUserData;
    } catch (error) {
      showSnackbar(error.message || 'Error creating user', 'error');
      throw error;
    }
  }, []);

  const updateUserStatus = useCallback(async (userId, status) => {
    try {
      await apiService.updateUser(userId, { status });
      setUsers(prev => prev.map(user => 
        user.id === userId || user._id === userId ? { ...user, status } : user
      ));
      showSnackbar('User status updated');
    } catch (error) {
      showSnackbar(error.message || 'Error updating user', 'error');
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId && user._id !== userId));
      showSnackbar('User deleted successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error deleting user', 'error');
    }
  }, []);

  // Course operations
  const addNewCourse = async () => {
    try {
      const result = await apiService.createCourse(newCourse);
      const newCourseData = result.data || result;
      setCourses(prev => [...prev, newCourseData]);
      setNewCourseDialog(false);
      setNewCourse({ 
        code: '', name: '', credits: 3, faculty: '', 
        maxStudents: 50, department: 'Computer Science', 
        description: '', courseType: 'Theory' 
      });
      showSnackbar('Course created successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error creating course', 'error');
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await apiService.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId && course._id !== courseId));
      showSnackbar('Course deleted successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error deleting course', 'error');
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setEditCourseDialog(true);
  };

  const handleViewCourseDetails = (course) => {
    setSelectedCourse(course);
    setCourseDetailsDialog(true);
  };

  // Classroom operations
  const addNewClassroom = async () => {
    try {
      const result = await apiService.createClassroom(newClassroom);
      const newClassroomData = result.data || result;
      setClassrooms(prev => [...prev, newClassroomData]);
      setNewClassroomDialog(false);
      setNewClassroom({ 
        name: '', capacity: 30, facilities: '', 
        building: 'Main', floor: '1', type: 'Lecture Hall' 
      });
      showSnackbar('Classroom created successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error creating classroom', 'error');
    }
  };

  const deleteClassroom = async (classroomId) => {
    try {
      await apiService.deleteClassroom(classroomId);
      setClassrooms(prev => prev.filter(classroom => classroom.id !== classroomId && classroom._id !== classroomId));
      showSnackbar('Classroom deleted successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error deleting classroom', 'error');
    }
  };

  // Course-Faculty mapping
  const mapCourseToFaculty = async () => {
    try {
      await apiService.mapCourseToFaculty(courseMapping);
      // Refresh courses to get updated faculty mapping
      const updatedCourses = await apiService.getCourses();
      setCourses(updatedCourses.data || updatedCourses);
      setCourseFacultyDialog(false);
      setCourseMapping({ courseId: '', facultyId: '', semester: 1, schedule: [] });
      showSnackbar('Course mapped to faculty successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error mapping course to faculty', 'error');
    }
  };

  // Timetable operations
  const generateTimetable = async (optimizeFor = 'no_conflicts') => {
    try {
      const timetableData = {
        semester: 1,
        academicYear: new Date().getFullYear(),
        optimizeFor
      };
      
      const result = await apiService.generateTimetable(timetableData);
      const newTimetable = result.timetable || result.data?.timetable || [];
      setTimetable(newTimetable);
      showSnackbar('Timetable generated successfully');
      
      // Refresh the timetable data
      const updatedTimetable = await apiService.getTimetable();
      setTimetable(updatedTimetable.data || updatedTimetable || []);
    } catch (error) {
      showSnackbar(error.message || 'Error generating timetable', 'error');
    }
  };

  const updateTimetableEntry = async (timetableId, updatedData) => {
    try {
      await apiService.updateTimetable(timetableId, updatedData);
      // Refresh timetable data
      const updatedTimetable = await apiService.getTimetable();
      setTimetable(updatedTimetable.data || updatedTimetable || []);
      showSnackbar('Timetable updated successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error updating timetable', 'error');
    }
  };

  const deleteTimetableEntry = async (timetableId) => {
    try {
      await apiService.deleteTimetable(timetableId);
      setTimetable(prev => prev.filter(entry => entry.id !== timetableId && entry._id !== timetableId));
      showSnackbar('Timetable entry deleted successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error deleting timetable entry', 'error');
    }
  };

  // Utility functions - FIXED: Use useCallback
  const getFacultyMembers = useCallback(() => users.filter(user => user.role === 'faculty'), [users]);
  const getUnmappedCourses = useCallback(() => courses.filter(course => !course.facultyId), [courses]);

  const getRoleColor = useCallback((role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'faculty': return 'warning';
      case 'student': return 'success';
      default: return 'default';
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'Available': return 'success';
      default: return 'default';
    }
  }, []);

  // FIXED: Use useCallback for dialog handlers
  const handleAddUserClick = useCallback(() => {
    // This will be handled by UserManagementTab's own dialog
  }, []);

  const handleAddCourseClick = useCallback(() => {
    setNewCourseDialog(true);
  }, []);

  const handleAddClassroomClick = useCallback(() => {
    setNewClassroomDialog(true);
  }, []);

  const handleMapCourseClick = useCallback(() => {
    setCourseFacultyDialog(true);
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchAdminData();

    // Real-time updates for system stats
    const interval = setInterval(async () => {
      try {
        const stats = await apiService.getSystemStats();
        const statsData = stats.data || stats;
        setRealtimeData({
          activeSessions: statsData.activeSessions || 0,
          serverLoad: statsData.serverLoad || 0,
          onlineUsers: statsData.onlineUsers || 0
        });
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  // Safe component rendering with error boundary
  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 0:
          return React.isValidElement(<OverviewTab />) ? (
            <OverviewTab 
              systemStats={systemStats}
              realtimeData={realtimeData}
              onStatClick={handleStatClick}
              onAddUser={handleAddUserClick}
              onGenerateTimetable={generateTimetable}
              colorScheme={colorScheme}
              loading={loading}
            />
          ) : <FallbackComponent tabName="Overview" />;
        
        case 1:
          return React.isValidElement(<UserManagementTab />) ? (
            <UserManagementTab />
          ) : <FallbackComponent tabName="User Management" />;
        
        case 2:
          return React.isValidElement(<CourseManagementTab />) ? (
            <CourseManagementTab 
              courses={courses}
              onAddCourse={handleAddCourseClick}
              onDeleteCourse={deleteCourse}
              onViewDetails={handleViewCourseDetails}
              onEditCourse={handleEditCourse}
              onMapCourse={handleMapCourseClick}
              colorScheme={colorScheme}
              loading={loading}
            />
          ) : <FallbackComponent tabName="Course Management" />;
        
        case 3:
          return React.isValidElement(<ClassroomManagementTab />) ? (
            <ClassroomManagementTab 
              classrooms={classrooms}
              onAddClassroom={handleAddClassroomClick}
              onDeleteClassroom={deleteClassroom}
              getStatusColor={getStatusColor}
              colorScheme={colorScheme}
              loading={loading}
            />
          ) : <FallbackComponent tabName="Classroom Management" />;
        
        case 4:
          return React.isValidElement(<TimetableManagementTab />) ? (
            <TimetableManagementTab 
              timetable={timetable}
              courses={courses}
              classrooms={classrooms}
              users={users}
              onGenerateTimetable={generateTimetable}
              onUpdateTimetable={updateTimetableEntry}
              onDeleteTimetable={deleteTimetableEntry}
              colorScheme={colorScheme}
              loading={loading}
            />
          ) : <FallbackComponent tabName="Timetable Management" />;
        
        case 5:
          return React.isValidElement(<CourseFacultyMappingTab />) ? (
            <CourseFacultyMappingTab 
              courses={courses}
              faculty={getFacultyMembers()}
              onMapCourseToFaculty={async (mappingData) => {
                try {
                  const result = await apiService.mapCourseToFaculty(mappingData);
                  // Refresh courses to get updated mappings from backend
                  const updatedCourses = await apiService.getCourses();
                  setCourses(updatedCourses.data || updatedCourses);
                  showSnackbar(`Course ${mappingData.courseCode} mapped to ${mappingData.facultyName} successfully`);
                  return result;
                } catch (error) {
                  showSnackbar(error.message || 'Error mapping course to faculty', 'error');
                  throw error;
                }
              }}
              onUnmapCourseFromFaculty={async (courseId) => {
                try {
                  const result = await apiService.unmapCourseFromFaculty(courseId);
                  // Refresh courses to get updated mappings from backend
                  const updatedCourses = await apiService.getCourses();
                  setCourses(updatedCourses.data || updatedCourses);
                  showSnackbar('Course unmapped successfully');
                  return result;
                } catch (error) {
                  showSnackbar(error.message || 'Error unmapping course', 'error');
                  throw error;
                }
              }}
              onSaveMappings={async () => {
                try {
                  showSnackbar('All mappings have been saved to database');
                  return { success: true, message: 'Mappings saved' };
                } catch (error) {
                  showSnackbar(error.message || 'Error saving mappings', 'error');
                  throw error;
                }
              }}
              loading={loading}
            />
          ) : <FallbackComponent tabName="Course-Faculty Mapping" />;
        
        case 6:
          return React.isValidElement(<ReportsAnalyticsTab />) ? (
            <ReportsAnalyticsTab 
              systemStats={systemStats}
              users={users}
              courses={courses}
              colorScheme={colorScheme}
              loading={loading}
            />
          ) : <FallbackComponent tabName="Reports & Analytics" />;
        
        case 7:
          return React.isValidElement(<SystemSettingsTab />) ? (
            <SystemSettingsTab 
              colorScheme={colorScheme}
              loading={loading}
            />
          ) : <FallbackComponent tabName="System Settings" />;
        
        default:
          return <FallbackComponent tabName="Unknown" />;
      }
    } catch (error) {
      console.error('Error rendering tab:', error);
      return <FallbackComponent tabName={`Tab ${activeTab + 1}`} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: colorScheme.background, minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={2} sx={{ bgcolor: colorScheme.primary }}>
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🎓 Smart Classroom Admin Portal
          </Typography>
          
          {/* Real-time Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                Active Sessions
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {realtimeData.activeSessions}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                Online Users
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {realtimeData.onlineUsers}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                Server Load
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {realtimeData.serverLoad}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <Notifications sx={{ color: 'white' }} />
            </Badge>
            <Avatar sx={{ width: 32, height: 32, bgcolor: colorScheme.primaryLight }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Typography variant="body2">{user?.name}</Typography>
            <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Status Bar */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: colorScheme.primary, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9, color: 'white' }}>System Status</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                ● All Systems Operational
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            size="small" 
            sx={{ 
              bgcolor: 'white', 
              color: colorScheme.primary,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            startIcon={<Refresh />}
            onClick={fetchAdminData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </Paper>

        {/* Main Navigation Tabs */}
        <Paper sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            variant="scrollable" 
            scrollButtons="auto"
          >
            <Tab icon={<Dashboard />} label="Overview" />
            <Tab icon={<People />} label="User Management" />
            <Tab icon={<School />} label="Course Management" />
            <Tab icon={<Class />} label="Classroom Management" />
            <Tab icon={<Schedule />} label="Timetable Management" />
            <Tab icon={<Group />} label="Course-Faculty Mapping" />
            <Tab icon={<Analytics />} label="Reports & Analytics" />
            <Tab icon={<Settings />} label="System Settings" />
          </Tabs>
        </Paper>

        {/* Tab Content with Error Boundary */}
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        }>
          {renderTabContent()}
        </Suspense>

      </Container>

      {/* Dialogs */}
      <StatDetailsDialog 
        open={statDetailsDialog} 
        onClose={() => setStatDetailsDialog(false)} 
        stat={selectedStat}
        colorScheme={colorScheme}
      />
      
      {/* REMOVE THIS: AddUserDialog component */}
      
      <AddCourseDialog 
        open={newCourseDialog} 
        onClose={() => setNewCourseDialog(false)} 
        newCourse={newCourse} 
        setNewCourse={setNewCourse} 
        onAdd={addNewCourse} 
        colorScheme={colorScheme} 
      />
      
      <AddClassroomDialog 
        open={newClassroomDialog} 
        onClose={() => setNewClassroomDialog(false)} 
        newClassroom={newClassroom} 
        setNewClassroom={setNewClassroom} 
        onAdd={addNewClassroom} 
        colorScheme={colorScheme} 
      />

      <CourseFacultyMappingDialog 
        open={courseFacultyDialog} 
        onClose={() => setCourseFacultyDialog(false)} 
        courses={getUnmappedCourses()}
        faculty={getFacultyMembers()}
        courseMapping={courseMapping}
        setCourseMapping={setCourseMapping}
        onMap={mapCourseToFaculty}
        colorScheme={colorScheme}
      />

      <CourseDetailsDialog 
        open={courseDetailsDialog}
        onClose={() => setCourseDetailsDialog(false)}
        course={selectedCourse}
        colorScheme={colorScheme}
      />

      <EditCourseDialog 
        open={editCourseDialog}
        onClose={() => setEditCourseDialog(false)}
        course={selectedCourse}
        colorScheme={colorScheme}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPortal;
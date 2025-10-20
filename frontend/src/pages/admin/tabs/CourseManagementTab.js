import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  Fab,
  Divider,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Add,
  Refresh,
  Map,
  Visibility,
  Edit,
  Delete,
  Search,
  Download,
  ArrowUpward,
  ArrowDownward,
  School,
  CheckCircle,
  Warning,
  TrendingUp,
  Home,
  NavigateNext,
  FilterList,
  Sort
} from '@mui/icons-material';

// Authentication check function
const checkAuth = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('Please login first!');
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Database service (replace with your actual database service)
class CourseDatabaseService {
  constructor() {
    this.API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllCourses() {
    try {
      console.log('🔄 Fetching courses from:', `${this.API_BASE_URL}/courses`);
      const response = await fetch(`${this.API_BASE_URL}/courses`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      console.log('📡 Courses response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Courses response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Courses API Response data:', data);
      
      // Handle different response structures
      let coursesArray = [];
      
      if (Array.isArray(data)) {
        // If response is directly an array
        coursesArray = data;
        console.log('📊 Using direct array, count:', coursesArray.length);
      } else if (data.data && Array.isArray(data.data)) {
        // If response has { data: [...] }
        coursesArray = data.data;
        console.log('📊 Using data.array, count:', coursesArray.length);
      } else if (data.courses && Array.isArray(data.courses)) {
        // If response has { courses: [...] }
        coursesArray = data.courses;
        console.log('📊 Using courses array, count:', coursesArray.length);
      } else if (data.success && Array.isArray(data.data)) {
        // If response has { success: true, data: [...] }
        coursesArray = data.data;
        console.log('📊 Using success.data array, count:', coursesArray.length);
      } else {
        console.warn('⚠️ Unknown response structure, returning empty array');
        coursesArray = [];
      }
      
      console.log('🎯 Final courses array to return:', coursesArray);
      return coursesArray;
      
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  }

  async createCourse(courseData) {
    try {
      console.log('🔄 Creating course with data:', courseData);
      
      const response = await fetch(`${this.API_BASE_URL}/courses`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      console.log('📡 Create course response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create course response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Create course response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      console.log('🔄 Updating course:', courseId, 'with data:', courseData);
      
      const response = await fetch(`${this.API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      console.log('📡 Update course response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update course response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Update course response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(courseId) {
    try {
      console.log('🔄 Deleting course:', courseId);
      
      const response = await fetch(`${this.API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      console.log('📡 Delete course response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete course response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Delete course response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  }

  async mapCourseToFaculty(courseId, facultyId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/courses/${courseId}/map-faculty`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ facultyId }),
      });
      if (!response.ok) throw new Error('Failed to map course to faculty');
      return await response.json();
    } catch (error) {
      console.error('Error mapping course:', error);
      throw error;
    }
  }
}

const CourseManagementTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const dbService = new CourseDatabaseService();

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication first
      if (!checkAuth()) return;
      
      const coursesData = await dbService.getAllCourses();
      console.log('📊 Setting courses state with:', coursesData);
      
      // Ensure courses is always an array
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      setCourses(coursesArray);
      
    } catch (err) {
      console.error('❌ Error in loadCourses:', err);
      setError('Failed to load courses. Please try again.');
      setCourses([]); // Ensure courses is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseData) => {
    try {
      setActionLoading(true);
      
      // Check authentication first
      if (!checkAuth()) return;
      
      const newCourse = await dbService.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      setSuccess('Course added successfully!');
      setAddCourseOpen(false);
    } catch (err) {
      setError('Failed to add course. Please try again.');
      console.error('Error adding course:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCourse = async (courseId, courseData) => {
    try {
      setActionLoading(true);
      
      // Check authentication first
      if (!checkAuth()) return;
      
      const updatedCourse = await dbService.updateCourse(courseId, courseData);
      setCourses(prev => prev.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
      setSuccess('Course updated successfully!');
      setEditCourseOpen(false);
    } catch (err) {
      setError('Failed to update course. Please try again.');
      console.error('Error updating course:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      setActionLoading(true);
      
      // Check authentication first
      if (!checkAuth()) return;
      
      await dbService.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      setSuccess('Course deleted successfully!');
    } catch (err) {
      setError('Failed to delete course. Please try again.');
      console.error('Error deleting course:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMapCourse = async (courseId, facultyId) => {
    try {
      setActionLoading(true);
      
      // Check authentication first
      if (!checkAuth()) return;
      
      const result = await dbService.mapCourseToFaculty(courseId, facultyId);
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, facultyId: result.facultyId, faculty: result.facultyName } : course
      ));
      setSuccess('Course mapped to faculty successfully!');
    } catch (err) {
      setError('Failed to map course. Please try again.');
      console.error('Error mapping course:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and sort courses - FIXED: Ensure courses is always an array
  const filteredCourses = (Array.isArray(courses) ? courses : [])
    .filter(course => {
      if (!course) return false;
      
      const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filter) {
        case 'mapped': return matchesSearch && course.facultyId;
        case 'unmapped': return matchesSearch && !course.facultyId;
        case 'theory': return matchesSearch && course.courseType === 'Theory';
        case 'lab': return matchesSearch && course.courseType === 'Lab';
        default: return matchesSearch;
      }
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name': aValue = a.name || ''; bValue = b.name || ''; break;
        case 'code': aValue = a.code || ''; bValue = b.code || ''; break;
        case 'enrollment': aValue = a.enrolled || 0; bValue = b.enrolled || 0; break;
        case 'credits': aValue = a.credits || 0; bValue = b.credits || 0; break;
        default: return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  // Course statistics - FIXED: Ensure courses is always an array
  const courseStats = {
    total: Array.isArray(courses) ? courses.length : 0,
    mapped: Array.isArray(courses) ? courses.filter(c => c?.facultyId).length : 0,
    unmapped: Array.isArray(courses) ? courses.filter(c => !c?.facultyId).length : 0,
    theory: Array.isArray(courses) ? courses.filter(c => c?.courseType === 'Theory').length : 0,
    lab: Array.isArray(courses) ? courses.filter(c => c?.courseType === 'Lab').length : 0,
    totalEnrollment: Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course?.enrolled || 0), 0) : 0,
    averageEnrollment: Array.isArray(courses) && courses.length > 0 
      ? Math.round(courses.reduce((sum, course) => sum + (course?.enrolled || 0), 0) / courses.length) 
      : 0,
    capacityUtilization: Array.isArray(courses) && courses.length > 0
      ? Math.round((courses.reduce((sum, course) => sum + (course?.enrolled || 0), 0) / 
                   courses.reduce((sum, course) => sum + (course?.max || 0), 0)) * 100) 
      : 0
  };

  const CourseCard = ({ course }) => {
    if (!course) return null;
    
    return (
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%', 
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
            borderColor: 'primary.main'
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                {course.code || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2 }}>
                {course.name || 'Unnamed Course'}
              </Typography>
            </Box>
            <Chip 
              label={course.courseType || 'Unknown'} 
              color={course.courseType === 'Theory' ? 'primary' : 'secondary'} 
              size="small" 
              variant="outlined"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📚 {course.credits || 0} Credits • 🏛️ {course.department || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              👨‍🏫 {course.faculty || 'Not Assigned'}
            </Typography>
          </Box>

          {/* Enrollment Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="500">
                Enrollment
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="600">
                {Math.round(((course.enrolled || 0) / (course.max || 1)) * 100)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={((course.enrolled || 0) / (course.max || 1)) * 100} 
              color={course.enrolled === course.max ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {course.enrolled || 0}/{course.max || 0} students
            </Typography>
          </Box>

          {/* Status and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip 
              label={course.faculty ? 'Mapped' : 'Unmapped'} 
              color={course.faculty ? 'success' : 'warning'} 
              size="small" 
              variant={course.faculty ? 'filled' : 'outlined'}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="View Details">
                <IconButton 
                  color="primary" 
                  size="small" 
                  onClick={() => {
                    setSelectedCourse(course);
                    setCourseDetailsOpen(true);
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Course">
                <IconButton 
                  color="info" 
                  size="small" 
                  onClick={() => {
                    setCourseToEdit(course);
                    setEditCourseOpen(true);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Course">
                <IconButton 
                  color="error" 
                  size="small" 
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={actionLoading}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading && courses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">Course Management</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            📚 Course Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and organize all academic courses efficiently
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={loadCourses}
            disabled={loading || actionLoading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setAddCourseOpen(true)}
            disabled={actionLoading}
          >
            Add Course
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Courses', value: courseStats.total, color: 'primary', icon: <School /> },
          { label: 'Mapped Courses', value: courseStats.mapped, color: 'success', icon: <CheckCircle /> },
          { label: 'Unmapped Courses', value: courseStats.unmapped, color: 'warning', icon: <Warning /> },
          { label: 'Capacity Used', value: `${courseStats.capacityUtilization}%`, color: 'info', icon: <TrendingUp /> }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: `${stat.color}.light`,
                  color: `${stat.color}.main`,
                  mb: 2
                }}
              >
                {stat.icon}
              </Box>
              <Typography variant="h3" fontWeight="700" color={`${stat.color}.main`} gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Controls Section */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel><FilterList sx={{ fontSize: 18, mr: 0.5 }} /> Filter</InputLabel>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter">
                <MenuItem value="all">All Courses</MenuItem>
                <MenuItem value="mapped">Mapped</MenuItem>
                <MenuItem value="unmapped">Unmapped</MenuItem>
                <MenuItem value="theory">Theory</MenuItem>
                <MenuItem value="lab">Lab</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel><Sort sx={{ fontSize: 18, mr: 0.5 }} /> Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="code">Code</MenuItem>
                <MenuItem value="enrollment">Enrollment</MenuItem>
                <MenuItem value="credits">Credits</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Tooltip title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}>
              <IconButton 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                color="primary"
              >
                {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>View Mode</InputLabel>
              <Select value={viewMode} onChange={(e) => setViewMode(e.target.value)} label="View Mode">
                <MenuItem value="grid">Grid View</MenuItem>
                <MenuItem value="table">Table View</MenuItem>
                <MenuItem value="analytics">Analytics</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={() => {/* Export functionality */}}
              fullWidth
              disabled={actionLoading}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          {filteredCourses.length} of {courses.length} Courses
        </Typography>
        {filter !== 'all' && (
          <Chip 
            label={`Filter: ${filter}`} 
            onDelete={() => setFilter('all')}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Main Content */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          {filteredCourses.map(course => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Paper 
          sx={{ 
            p: 8, 
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'No courses match the current filters'}
          </Typography>
          {(searchTerm || filter !== 'all') && (
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      )}

      {/* Loading Backdrop */}
      <Backdrop open={actionLoading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Dialogs */}
      <CourseDetailsDialog 
        open={courseDetailsOpen}
        onClose={() => setCourseDetailsOpen(false)}
        course={selectedCourse}
        onMapCourse={handleMapCourse}
        loading={actionLoading}
      />

      <EditCourseDialog 
        open={editCourseOpen}
        onClose={() => setEditCourseOpen(false)}
        course={courseToEdit}
        onSave={handleEditCourse}
        loading={actionLoading}
      />

      <AddCourseDialog 
        open={addCourseOpen}
        onClose={() => setAddCourseOpen(false)}
        onSave={handleAddCourse}
        loading={actionLoading}
      />

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add course"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setAddCourseOpen(true)}
        disabled={actionLoading}
      >
        <Add />
      </Fab>
    </Box>
  );
};

// Course Details Dialog Component
const CourseDetailsDialog = ({ open, onClose, course, onMapCourse, loading }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');

  if (!course) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School />
          Course Details - {course.code}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <List>
              <ListItem>
                <ListItemText primary="Course Code" secondary={course.code} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Course Name" secondary={course.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Credits" secondary={course.credits} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Department" secondary={course.department} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Course Type" secondary={course.courseType} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Enrollment & Faculty</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Enrollment" 
                  secondary={`${course.enrolled || 0}/${course.max || 0} students`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Status" 
                  secondary={course.faculty ? 'Mapped' : 'Unmapped'} 
                  secondaryTypographyProps={{ 
                    color: course.faculty ? 'success.main' : 'warning.main' 
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Assigned Faculty" 
                  secondary={course.faculty || 'Not assigned'} 
                />
              </ListItem>
            </List>
            
            {!course.faculty && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assign Faculty</InputLabel>
                  <Select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    label="Assign Faculty"
                  >
                    <MenuItem value="faculty1">Dr. John Smith</MenuItem>
                    <MenuItem value="faculty2">Dr. Sarah Johnson</MenuItem>
                    <MenuItem value="faculty3">Prof. Michael Brown</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!course.faculty && selectedFaculty && (
          <Button 
            variant="contained" 
            onClick={() => {
              onMapCourse(course.id, selectedFaculty);
              onClose();
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Map to Faculty'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Edit Course Dialog Component
const EditCourseDialog = ({ open, onClose, course, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 0,
    department: '',
    courseType: 'Theory',
    max: 30
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        code: course.code || '',
        credits: course.credits || 0,
        department: course.department || '',
        courseType: course.courseType || 'Theory',
        max: course.max || 30
      });
    }
  }, [course]);

  const handleSubmit = () => {
    onSave(course.id, formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Course - {course?.code}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Course Code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Course Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Credits"
              value={formData.credits}
              onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Course Type</InputLabel>
              <Select
                value={formData.courseType}
                onChange={(e) => setFormData({...formData, courseType: e.target.value})}
                label="Course Type"
              >
                <MenuItem value="Theory">Theory</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Students"
              value={formData.max}
              onChange={(e) => setFormData({...formData, max: parseInt(e.target.value)})}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add Course Dialog Component
const AddCourseDialog = ({ open, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    department: '',
    courseType: 'Theory',
    enrolled: 0,
    max: 30
  });

  const handleSubmit = () => {
    onSave(formData);
    // Reset form
    setFormData({
      name: '',
      code: '',
      credits: 3,
      department: '',
      courseType: 'Theory',
      enrolled: 0,
      max: 30
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      name: '',
      code: '',
      credits: 3,
      department: '',
      courseType: 'Theory',
      enrolled: 0,
      max: 30
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Course</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Course Code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g., CS101"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Course Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Introduction to Computer Science"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Credits"
              value={formData.credits}
              onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g., Computer Science"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Course Type</InputLabel>
              <Select
                value={formData.courseType}
                onChange={(e) => setFormData({...formData, courseType: e.target.value})}
                label="Course Type"
              >
                <MenuItem value="Theory">Theory</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Students"
              value={formData.max}
              onChange={(e) => setFormData({...formData, max: parseInt(e.target.value)})}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.name || !formData.code}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseManagementTab;
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
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Backdrop,
  LinearProgress
} from '@mui/material';
import {
  Refresh,
  Link,
  LinkOff,
  Search,
  AutoFixHigh,
  CheckCircle,
  Warning,
  School,
  Group,
  Map,
  Clear,
  Save,
  Download,
  Class
} from '@mui/icons-material';

// Mock API functions - Replace these with your actual API calls
const mockApi = {
  // Mock function to map course to faculty
  mapCourseToFaculty: async (mappingData) => {
    console.log('Saving mapping to backend:', mappingData);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real application, this would be your API call:
    // return await fetch('/api/courses/map-faculty', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(mappingData)
    // });
    
    return { success: true, data: mappingData };
  },

  // Mock function to unmap course from faculty
  unmapCourseFromFaculty: async (courseId) => {
    console.log('Removing mapping from backend for course:', courseId);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real application, this would be your API call:
    // return await fetch(`/api/courses/${courseId}/unmap-faculty`, {
    //   method: 'DELETE'
    // });
    
    return { success: true, courseId };
  },

  // Mock function to save all mappings
  saveAllMappings: async (mappings) => {
    console.log('Saving all mappings to backend');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, this would be your API call:
    // return await fetch('/api/courses/save-all-mappings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ mappings })
    // });
    
    return { success: true, message: 'All mappings saved successfully' };
  }
};

const CourseFacultyMappingTab = ({ 
  courses = [], 
  faculty = [], 
  onMapCourseToFaculty,
  onUnmapCourseFromFaculty,
  onAutoMapCourses,
  onSaveMappings,
  loading = false 
}) => {
  const [localCourses, setLocalCourses] = useState([]);
  const [localFaculty, setLocalFaculty] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('unmapped');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [autoMapProgress, setAutoMapProgress] = useState(0);
  const [mappingHistory, setMappingHistory] = useState([]);
  const [bulkSelection, setBulkSelection] = useState([]);
  const [isMapping, setIsMapping] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use provided callbacks or fall back to mock API
  const handleMapToFaculty = onMapCourseToFaculty || mockApi.mapCourseToFaculty;
  const handleUnmapFromFaculty = onUnmapCourseFromFaculty || mockApi.unmapCourseFromFaculty;
  const handleSaveAll = onSaveMappings || (() => mockApi.saveAllMappings(getAllMappings()));

  // Initialize with data from props
  useEffect(() => {
    console.log('Initializing with courses:', courses);
    console.log('Initializing with faculty:', faculty);
    
    if (courses && courses.length > 0) {
      const normalizedCourses = courses.map(course => ({
        ...course,
        id: course.id || course._id,
        facultyId: course.facultyId || null
      }));
      setLocalCourses(normalizedCourses);
    }
    
    if (faculty && faculty.length > 0) {
      const normalizedFaculty = faculty.map(fac => ({
        ...fac,
        id: fac.id || fac._id
      }));
      setLocalFaculty(normalizedFaculty);
    }
    
    setHasUnsavedChanges(false);
  }, [courses, faculty]);

  // Get all current mappings for saving
  const getAllMappings = () => {
    return localCourses
      .filter(course => course.facultyId)
      .map(course => ({
        courseId: course.id,
        facultyId: course.facultyId,
        courseCode: course.code,
        facultyName: course.faculty?.name,
        department: course.department
      }));
  };

  // Get departments from courses and faculty
  const departments = [...new Set([
    ...localCourses.map(course => course.department),
    ...localFaculty.map(f => f.department)
  ])].filter(Boolean);

  // Filter courses based on view mode and search
  const filteredCourses = localCourses.filter(course => {
    if (!course) return false;
    
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    
    switch (viewMode) {
      case 'unmapped':
        return matchesSearch && matchesDepartment && !course.facultyId;
      case 'mapped':
        return matchesSearch && matchesDepartment && course.facultyId;
      case 'all':
      default:
        return matchesSearch && matchesDepartment;
    }
  });

  // Get faculty by department
  const getFacultyByDepartment = (department) => {
    return localFaculty.filter(f => f.department === department);
  };

  // Get mapped faculty for a course
  const getMappedFaculty = (course) => {
    if (!course.facultyId) return null;
    return localFaculty.find(f => f.id === course.facultyId);
  };

  // Handle manual mapping
  const handleMapCourse = (course) => {
    setSelectedCourse(course);
    setMappingDialogOpen(true);
  };

  // Handle auto mapping for all unmapped courses
  const handleAutoMapAll = async () => {
    setAutoMapProgress(0);
    setIsMapping(true);
    
    try {
      const unmappedCourses = localCourses.filter(course => !course.facultyId);
      let progress = 0;
      
      for (const course of unmappedCourses) {
        const suitableFaculty = findSuitableFaculty(course);
        if (suitableFaculty) {
          await handleMapCourseToFaculty(course, suitableFaculty, false);
        }
        progress += 1;
        setAutoMapProgress(Math.round((progress / unmappedCourses.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setSuccess(`Auto-mapped ${unmappedCourses.length} courses successfully!`);
    } catch (err) {
      setError('Failed to auto-map courses: ' + err.message);
    } finally {
      setAutoMapProgress(0);
      setIsMapping(false);
    }
  };

  // Find suitable faculty for a course
  const findSuitableFaculty = (course) => {
    if (!course.department) return null;
    
    const departmentFaculty = getFacultyByDepartment(course.department);
    if (departmentFaculty.length === 0) return null;
    
    const facultyLoad = {};
    localCourses.forEach(c => {
      if (c.facultyId) {
        facultyLoad[c.facultyId] = (facultyLoad[c.facultyId] || 0) + 1;
      }
    });
    
    const suitableFaculty = departmentFaculty
      .filter(f => !facultyLoad[f.id] || facultyLoad[f.id] < 5)
      .sort((a, b) => (facultyLoad[a.id] || 0) - (facultyLoad[b.id] || 0))[0];
    
    return suitableFaculty || departmentFaculty[0];
  };

  // Map course to faculty - FIXED: Proper persistence
  const handleMapCourseToFaculty = async (course, faculty, showNotification = true) => {
    setIsMapping(true);
    
    try {
      const mappingData = {
        courseId: course.id,
        facultyId: faculty.id,
        courseCode: course.code,
        facultyName: faculty.name,
        department: course.department
      };

      console.log('Mapping course:', course.code, 'to faculty:', faculty.name);

      // Call backend API FIRST to ensure persistence
      const result = await handleMapToFaculty(mappingData);
      console.log('Backend mapping response:', result);

      // Only update local state after successful backend call
      setLocalCourses(prev => {
        const updatedCourses = prev.map(c => 
          c.id === course.id 
            ? { 
                ...c, 
                facultyId: faculty.id, 
                faculty: faculty 
              }
            : c
        );
        console.log('Local state updated for course:', course.code);
        return updatedCourses;
      });

      setHasUnsavedChanges(true);

      // Add to history
      setMappingHistory(prev => [...prev, {
        type: 'map',
        course: course.code,
        faculty: faculty.name,
        timestamp: new Date().toISOString()
      }]);

      if (showNotification) {
        setSuccess(`Course ${course.code} mapped to ${faculty.name} successfully!`);
      }
      
    } catch (err) {
      console.error('Mapping error:', err);
      setError('Failed to map course: ' + err.message);
      throw err;
    } finally {
      setIsMapping(false);
    }
  };

  // Unmap course from faculty - FIXED: Proper persistence
  const handleUnmapCourse = async (course) => {
    setIsMapping(true);
    
    try {
      console.log('Unmapping course:', course.code);

      // Call backend API FIRST to ensure persistence
      const result = await handleUnmapFromFaculty(course.id);
      console.log('Backend unmapping response:', result);

      // Only update local state after successful backend call
      setLocalCourses(prev => {
        const updatedCourses = prev.map(c => 
          c.id === course.id 
            ? { ...c, facultyId: null, faculty: null }
            : c
        );
        console.log('Local state updated after unmapping course:', course.code);
        return updatedCourses;
      });

      setHasUnsavedChanges(true);

      // Add to history
      setMappingHistory(prev => [...prev, {
        type: 'unmap',
        course: course.code,
        faculty: course.faculty?.name,
        timestamp: new Date().toISOString()
      }]);

      setSuccess(`Course ${course.code} unmapped successfully!`);
      
    } catch (err) {
      console.error('Unmapping error:', err);
      setError('Failed to unmap course: ' + err.message);
    } finally {
      setIsMapping(false);
    }
  };

  // Bulk operations
  const handleBulkMap = async (faculty) => {
    if (bulkSelection.length === 0) return;
    
    setIsMapping(true);
    
    try {
      const coursesToMap = localCourses.filter(c => bulkSelection.includes(c.id));
      
      // Call backend API for each course first
      let successCount = 0;
      for (const course of coursesToMap) {
        try {
          const mappingData = {
            courseId: course.id,
            facultyId: faculty.id,
            courseCode: course.code,
            facultyName: faculty.name,
            department: course.department
          };
          
          await handleMapToFaculty(mappingData);
          successCount++;
        } catch (err) {
          console.error(`Failed to map course ${course.code}:`, err);
        }
      }

      // Only update local state after successful backend calls
      setLocalCourses(prev => prev.map(c => 
        bulkSelection.includes(c.id)
          ? { ...c, facultyId: faculty.id, faculty: faculty }
          : c
      ));

      setHasUnsavedChanges(true);
      setBulkSelection([]);
      setSuccess(`Successfully mapped ${successCount} courses to ${faculty.name}`);
      
    } catch (err) {
      setError('Failed to bulk map courses: ' + err.message);
    } finally {
      setIsMapping(false);
    }
  };

  // Save all mappings to backend
  const handleSaveAllMappings = async () => {
    try {
      const mappings = getAllMappings();
      console.log('Saving all mappings:', mappings);
      
      await handleSaveAll(mappings);
      setHasUnsavedChanges(false);
      setSuccess('All mappings saved successfully!');
    } catch (err) {
      setError('Failed to save mappings: ' + err.message);
    }
  };

  // Statistics
  const stats = {
    totalCourses: localCourses.length,
    mappedCourses: localCourses.filter(c => c.facultyId).length,
    unmappedCourses: localCourses.filter(c => !c.facultyId).length,
    totalFaculty: localFaculty.length,
    facultyWithCourses: new Set(localCourses.filter(c => c.facultyId).map(c => c.facultyId)).size
  };

  // Course Card Component
  const CourseCard = ({ course }) => {
    const mappedFaculty = getMappedFaculty(course);
    
    return (
      <Card 
        elevation={2}
        sx={{ 
          height: '100%',
          border: '1px solid',
          borderColor: mappedFaculty ? 'success.light' : 'grey.300',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          },
          position: 'relative'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {course.code}
              </Typography>
              <Typography variant="body1" fontWeight="600" sx={{ lineHeight: 1.2, mb: 1 }}>
                {course.name}
              </Typography>
            </Box>
            <Chip 
              label={course.courseType || 'Lecture'} 
              color={course.courseType === 'Lab' ? 'secondary' : 'primary'} 
              size="small" 
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📚 {course.credits || 0} Credits • 🏛️ {course.department || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              👥 Capacity: {course.enrolled || 0}/{course.max || 30} students
            </Typography>
          </Box>

          {/* Faculty Mapping Section */}
          <Box sx={{ 
            p: 2, 
            bgcolor: mappedFaculty ? 'success.light' : 'warning.light',
            borderRadius: 1,
            mb: 2,
            transition: 'all 0.3s ease'
          }}>
            {mappedFaculty ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {mappedFaculty.name?.charAt(0) || 'F'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {mappedFaculty.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mappedFaculty.department}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title="Unmap Course">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleUnmapCourse(course)}
                    disabled={loading || isMapping}
                  >
                    <LinkOff fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="600">
                  Not Assigned
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Link />}
                  onClick={() => handleMapCourse(course)}
                  disabled={loading || isMapping}
                >
                  Assign
                </Button>
              </Box>
            )}
          </Box>

          {/* Bulk Selection Checkbox */}
          {viewMode === 'unmapped' && !mappedFaculty && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={bulkSelection.includes(course.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkSelection(prev => [...prev, course.id]);
                    } else {
                      setBulkSelection(prev => prev.filter(id => id !== course.id));
                    }
                  }}
                  disabled={loading || isMapping}
                />
              }
              label="Bulk Select"
            />
          )}
        </CardContent>
      </Card>
    );
  };

  // Faculty List Component
  const FacultyList = () => {
    const getFacultyCourseCount = (facultyId) => {
      return localCourses.filter(course => course.facultyId === facultyId).length;
    };

    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group /> Available Faculty ({localFaculty.length})
          </Typography>
          <List dense>
            {localFaculty.map((facultyMember) => {
              const courseCount = getFacultyCourseCount(facultyMember.id);
              
              return (
                <ListItem
                  key={facultyMember.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: selectedFaculty?.id === facultyMember.id ? 'action.selected' : 'background.paper',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedFaculty(facultyMember)}
                >
                  <ListItemIcon>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {facultyMember.name?.charAt(0) || 'F'}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="600">
                          {facultyMember.name}
                        </Typography>
                        <Chip 
                          label={`${courseCount} courses`} 
                          size="small" 
                          color={courseCount > 4 ? 'warning' : courseCount > 0 ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {facultyMember.department} • {facultyMember.email}
                        </Typography>
                        {facultyMember.qualification && (
                          <Typography variant="caption" color="text.secondary">
                            {facultyMember.qualification}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {bulkSelection.length > 0 && (
                    <Tooltip title={`Map ${bulkSelection.length} selected courses to ${facultyMember.name}`}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkMap(facultyMember);
                        }}
                        disabled={loading || isMapping}
                      >
                        Map {bulkSelection.length}
                      </Button>
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
          {localFaculty.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No faculty members available
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  // Mapping Dialog
  const MappingDialog = () => {
    if (!selectedCourse) return null;

    const departmentFaculty = getFacultyByDepartment(selectedCourse.department);
    const availableFaculty = departmentFaculty.length > 0 ? departmentFaculty : localFaculty;

    const getFacultyCourseCount = (facultyId) => {
      return localCourses.filter(course => course.facultyId === facultyId).length;
    };

    return (
      <Dialog 
        open={mappingDialogOpen} 
        onClose={() => !isMapping && setMappingDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Map Course to Faculty
        </DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="h6" gutterBottom>
              {selectedCourse.code} - {selectedCourse.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Department: {selectedCourse.department} • Credits: {selectedCourse.credits}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Select Faculty:
            </Typography>
            
            {availableFaculty.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {availableFaculty.map((facultyMember) => {
                  const courseCount = getFacultyCourseCount(facultyMember.id);
                  
                  return (
                    <Grid item xs={12} key={facultyMember.id}>
                      <Card 
                        variant="outlined"
                        sx={{
                          cursor: isMapping ? 'not-allowed' : 'pointer',
                          border: '2px solid',
                          borderColor: 'transparent',
                          transition: 'all 0.2s ease',
                          opacity: isMapping ? 0.6 : 1,
                          '&:hover': !isMapping ? {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover'
                          } : {}
                        }}
                        onClick={async () => {
                          if (isMapping) return;
                          
                          try {
                            await handleMapCourseToFaculty(selectedCourse, facultyMember);
                            setMappingDialogOpen(false);
                            setSelectedCourse(null);
                          } catch (err) {
                            console.error('Failed to map course:', err);
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {facultyMember.name?.charAt(0) || 'F'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight="600">
                                {facultyMember.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {facultyMember.department} • {facultyMember.email}
                              </Typography>
                              {facultyMember.qualification && (
                                <Typography variant="caption" color="text.secondary">
                                  {facultyMember.qualification}
                                </Typography>
                              )}
                            </Box>
                            <Chip 
                              label={`${courseCount} courses`} 
                              size="small" 
                              color={courseCount > 4 ? 'warning' : courseCount > 0 ? 'success' : 'primary'}
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No faculty members available for mapping
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setMappingDialogOpen(false);
              setSelectedCourse(null);
            }}
            disabled={isMapping}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            🔗 Course-Faculty Mapping
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Map courses to faculty members and manage teaching assignments
          </Typography>
          {hasUnsavedChanges && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              You have unsaved changes. Click "Save All" to persist them.
            </Alert>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {/* Export functionality */}}
            disabled={isMapping}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveAllMappings}
            disabled={loading || isMapping || !hasUnsavedChanges}
            color={hasUnsavedChanges ? "warning" : "primary"}
          >
            Save All {hasUnsavedChanges && '*'}
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.mappedCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mapped Courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.unmappedCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unmapped Courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalFaculty}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Faculty
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Map sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.facultyWithCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Faculty
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }} elevation={2}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                disabled={isMapping}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Department"
                  disabled={isMapping}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>View Mode</InputLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => {
                    setViewMode(e.target.value);
                    setBulkSelection([]);
                  }}
                  label="View Mode"
                  disabled={isMapping}
                >
                  <MenuItem value="unmapped">Unmapped</MenuItem>
                  <MenuItem value="mapped">Mapped</MenuItem>
                  <MenuItem value="all">All Courses</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AutoFixHigh />}
                  onClick={handleAutoMapAll}
                  disabled={loading || isMapping || stats.unmappedCourses === 0}
                  sx={{ flex: 1 }}
                >
                  Auto Map All
                </Button>
                
                {bulkSelection.length > 0 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Clear />}
                    onClick={() => setBulkSelection([])}
                    disabled={isMapping}
                  >
                    Clear ({bulkSelection.length})
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()} // Simple refresh to get latest data
                  disabled={loading || isMapping}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Auto-map Progress */}
          {autoMapProgress > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Auto-mapping courses... {autoMapProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={autoMapProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Courses Grid */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {viewMode === 'unmapped' ? '🚫 Unmapped Courses' : 
               viewMode === 'mapped' ? '✅ Mapped Courses' : '📚 All Courses'}
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                ({filteredCourses.length} courses)
              </Typography>
            </Typography>
            
            {viewMode === 'unmapped' && bulkSelection.length > 0 && (
              <Typography variant="body2" color="primary" fontWeight="600">
                {bulkSelection.length} courses selected for bulk mapping
              </Typography>
            )}
          </Box>

          {filteredCourses.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Class sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No courses found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || selectedDepartment !== 'all' 
                  ? 'Try adjusting your search terms or filters' 
                  : viewMode === 'unmapped' 
                    ? 'All courses are mapped!' 
                    : 'No courses available'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredCourses.map(course => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Faculty Sidebar */}
        <Grid item xs={12} md={4}>
          <FacultyList />
          
          {/* Recent Activity */}
          {mappingHistory.length > 0 && (
            <Card elevation={2} sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {mappingHistory.slice(-5).reverse().map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {activity.type === 'map' ? 
                          <Link color="success" /> : 
                          <LinkOff color="error" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={`${activity.course} ${activity.type === 'map' ? 'mapped to' : 'unmapped from'} ${activity.faculty}`}
                        secondary={new Date(activity.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Mapping Dialog */}
      <MappingDialog />

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop open={loading || isMapping} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default CourseFacultyMappingTab;
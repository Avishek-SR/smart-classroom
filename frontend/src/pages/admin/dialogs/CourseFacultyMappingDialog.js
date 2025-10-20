import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { Map } from '@mui/icons-material';

const CourseFacultyDialog = ({ 
  open, 
  onClose, 
  courses, 
  faculty, 
  courseMapping, 
  setCourseMapping, 
  onMap,
  colorScheme 
}) => {
  const handleMapCourse = () => {
    if (!courseMapping.courseId || !courseMapping.facultyId) {
      alert('Please select both course and faculty');
      return;
    }
    onMap();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        bgcolor: colorScheme.primary, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Map />
        Map Course to Faculty
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Assign faculty members to courses for the current semester
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Course Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={courseMapping.courseId}
              onChange={(e) => setCourseMapping({...courseMapping, courseId: e.target.value})}
              label="Select Course"
            >
              <MenuItem value="">
                <em>Select a course</em>
              </MenuItem>
              {courses.map(course => (
                <MenuItem key={course.id} value={course.id}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {course.code}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {course.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {course.department} • {course.credits} credits
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Faculty Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Faculty</InputLabel>
            <Select
              value={courseMapping.facultyId}
              onChange={(e) => setCourseMapping({...courseMapping, facultyId: e.target.value})}
              label="Select Faculty"
            >
              <MenuItem value="">
                <em>Select a faculty member</em>
              </MenuItem>
              {faculty.map(facultyMember => (
                <MenuItem key={facultyMember.id} value={facultyMember.id}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {facultyMember.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {facultyMember.department}
                    </Typography>
                    {facultyMember.specialization && (
                      <Typography variant="caption" color="textSecondary">
                        {facultyMember.specialization}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Semester Selection */}
          <FormControl fullWidth>
            <InputLabel>Semester</InputLabel>
            <Select
              value={courseMapping.semester}
              onChange={(e) => setCourseMapping({...courseMapping, semester: e.target.value})}
              label="Semester"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <MenuItem key={sem} value={sem}>
                  Semester {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selected Course & Faculty Preview */}
          {(courseMapping.courseId || courseMapping.facultyId) && (
            <Box sx={{ 
              p: 2, 
              border: `1px solid ${colorScheme.primaryLight}`, 
              borderRadius: 1,
              bgcolor: '#f8fdff'
            }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Mapping Preview:
              </Typography>
              {courseMapping.courseId && (
                <Typography variant="body2">
                  📚 Course: {courses.find(c => c.id == courseMapping.courseId)?.code} - {courses.find(c => c.id == courseMapping.courseId)?.name}
                </Typography>
              )}
              {courseMapping.facultyId && (
                <Typography variant="body2">
                  👨‍🏫 Faculty: {faculty.find(f => f.id == courseMapping.facultyId)?.name}
                </Typography>
              )}
              {courseMapping.semester && (
                <Typography variant="body2">
                  🎯 Semester: {courseMapping.semester}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleMapCourse}
          disabled={!courseMapping.courseId || !courseMapping.facultyId}
          sx={{ bgcolor: colorScheme.primary }}
        >
          Map Course
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseFacultyDialog;
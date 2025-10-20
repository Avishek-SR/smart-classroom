import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import { School } from '@mui/icons-material';

const CourseDetailsDialog = ({ open, onClose, course, onMapCourse }) => {
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
                  secondary={`${course.enrolled}/${course.max} students`} 
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
          >
            Map to Faculty
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CourseDetailsDialog;
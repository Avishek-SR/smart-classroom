import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

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

export default EditCourseDialog;
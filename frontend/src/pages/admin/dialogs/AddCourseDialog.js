import React, { useState } from 'react';
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

export default AddCourseDialog;
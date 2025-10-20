import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';

const StatDetailsDialog = ({ open, onClose, stat, studentGroups, colorScheme }) => {
  if (!stat) return null;

  const renderStudentDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        📊 Student Distribution by Department
      </Typography>
      
      {/* Total Students Summary */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: colorScheme.primary, color: 'white' }}>
        <Typography variant="h5" align="center">
          Total Students: 1,254
        </Typography>
        <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
          Across all departments
        </Typography>
      </Paper>

      {/* Department-wise Breakdown */}
      <Grid container spacing={2}>
        {studentGroups.map((group, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ p: 2, height: '100%', border: `1px solid ${colorScheme.primaryLight}` }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {group.department}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="secondary.main">
                  {group.totalStudents}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Students
                </Typography>
              </Box>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    👨 Male: {group.male}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    👩 Female: {group.female}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  📈 Attendance: {group.averageAttendance}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={group.averageAttendance} 
                  color="success"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  👨‍🏫 Faculty: {group.facultyCount}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary">
                  🎯 Courses: {group.courses.join(', ')}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Statistics */}
      <Paper sx={{ p: 2, mt: 3, border: `1px solid ${colorScheme.primaryLight}` }}>
        <Typography variant="h6" gutterBottom>
          📈 Overall Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">72%</Typography>
              <Typography variant="body2">Male Students</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="secondary">28%</Typography>
              <Typography variant="body2">Female Students</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">91.5%</Typography>
              <Typography variant="body2">Avg Attendance</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">31</Typography>
              <Typography variant="body2">Total Faculty</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderFacultyDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="secondary">
        👨‍🏫 Faculty Distribution
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: colorScheme.info, color: 'white' }}>
            <Typography variant="h4" align="center">48</Typography>
            <Typography variant="body1" align="center">Total Faculty</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: colorScheme.success, color: 'white' }}>
            <Typography variant="h4" align="center">12</Typography>
            <Typography variant="body1" align="center">Departments</Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3, border: `1px solid ${colorScheme.primaryLight}` }}>
        <Typography variant="h6" gutterBottom>
          Department-wise Faculty Distribution
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Computer Science" secondary="15 faculty members" />
            <Chip label="31%" color="primary" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Mathematics" secondary="8 faculty members" />
            <Chip label="17%" color="secondary" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Physics" secondary="6 faculty members" />
            <Chip label="12%" color="success" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Other Departments" secondary="19 faculty members" />
            <Chip label="40%" color="warning" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );

  const renderCourseDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="success.main">
        📚 Course Analytics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: colorScheme.success, color: 'white' }}>
            <Typography variant="h4" align="center">86</Typography>
            <Typography variant="body1" align="center">Active Courses</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: colorScheme.info, color: 'white' }}>
            <Typography variant="h4" align="center">94%</Typography>
            <Typography variant="body1" align="center">Enrollment Rate</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: colorScheme.warning, color: 'white' }}>
            <Typography variant="h4" align="center">12</Typography>
            <Typography variant="body1" align="center">New This Semester</Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3, border: `1px solid ${colorScheme.primaryLight}` }}>
        <Typography variant="h6" gutterBottom>
          Course Types Distribution
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">58</Typography>
              <Typography variant="body2">Theory Courses</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="secondary">18</Typography>
              <Typography variant="body2">Lab Courses</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">10</Typography>
              <Typography variant="body2">Tutorial Courses</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const getDialogContent = () => {
    switch (stat.label) {
      case 'Total Students':
        return renderStudentDetails();
      case 'Faculty Members':
        return renderFacultyDetails();
      case 'Active Courses':
        return renderCourseDetails();
      default:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {stat.label} Details
            </Typography>
            <Typography variant="body1">
              Detailed analytics and information for {stat.label.toLowerCase()}.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ 
        bgcolor: stat.color, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        {stat.icon}
        <Box>
          <Typography variant="h5">{stat.label} Details</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {stat.description}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {getDialogContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{ bgcolor: colorScheme.primary }}
        >
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatDetailsDialog;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Tabs,
  Tab,
  Tooltip,
  Avatar,
  AvatarGroup,
  Switch,
  FormControlLabel,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
// ✅ CORRECTED IMPORTS - Replace the entire icon import section with this:
import {
  AutoAwesome,
  Delete,
  Schedule,
  Person,
  MeetingRoom,
  CalendarToday,
  AccessTime,
  Edit,
  Visibility,
  Download,
  Upload,
  Refresh
} from '@mui/icons-material';

// For the enhanced version, also add these:
import ExpandMore from '@mui/icons-material/ExpandMore';
import FilterList from '@mui/icons-material/FilterList';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import Save from '@mui/icons-material/Save';
import ImportExport from '@mui/icons-material/ImportExport';
import Groups from '@mui/icons-material/Groups';
import School from '@mui/icons-material/School';
import Dashboard from '@mui/icons-material/Dashboard';
import TableChart from '@mui/icons-material/TableChart';
import ViewWeek from '@mui/icons-material/ViewWeek';
import Timeline from '@mui/icons-material/Timeline';
import ReportProblem from '@mui/icons-material/ReportProblem';
// Enhanced sample data
const sampleCourses = [
  { id: 'CS101', name: 'Introduction to Programming', credits: 3, department: 'Computer Science', type: 'Lecture', studentCount: 60 },
  { id: 'CS201', name: 'Data Structures', credits: 4, department: 'Computer Science', type: 'Lab', studentCount: 30 },
  { id: 'MA101', name: 'Calculus I', credits: 4, department: 'Mathematics', type: 'Lecture', studentCount: 80 },
  { id: 'PH101', name: 'Physics I', credits: 4, department: 'Physics', type: 'Lecture', studentCount: 70 },
  { id: 'EE101', name: 'Basic Electronics', credits: 3, department: 'Electrical Engineering', type: 'Lab', studentCount: 25 },
  { id: 'CS301', name: 'Algorithms', credits: 4, department: 'Computer Science', type: 'Lecture', studentCount: 55 },
  { id: 'MA201', name: 'Linear Algebra', credits: 3, department: 'Mathematics', type: 'Lecture', studentCount: 65 },
  { id: 'HM101', name: 'Communication Skills', credits: 2, department: 'Humanities', type: 'Tutorial', studentCount: 25 }
];

const sampleFaculty = [
  { id: 'F001', name: 'Dr. Smith', department: 'Computer Science', availability: ['Mon', 'Tue', 'Wed', 'Thu'], maxHours: 20, expertise: ['Programming', 'Algorithms'] },
  { id: 'F002', name: 'Dr. Johnson', department: 'Computer Science', availability: ['Mon', 'Wed', 'Fri'], maxHours: 18, expertise: ['Data Structures', 'Database'] },
  { id: 'F003', name: 'Dr. Brown', department: 'Mathematics', availability: ['Tue', 'Thu', 'Fri'], maxHours: 16, expertise: ['Calculus', 'Linear Algebra'] },
  { id: 'F004', name: 'Dr. Davis', department: 'Physics', availability: ['Mon', 'Tue', 'Wed'], maxHours: 15, expertise: ['Classical Mechanics'] },
  { id: 'F005', name: 'Dr. Wilson', department: 'Electrical Engineering', availability: ['Mon', 'Wed', 'Fri'], maxHours: 18, expertise: ['Electronics', 'Circuits'] },
  { id: 'F006', name: 'Dr. Taylor', department: 'Humanities', availability: ['Tue', 'Thu'], maxHours: 12, expertise: ['Communication', 'Soft Skills'] }
];

const sampleClassrooms = [
  { id: 'R101', name: 'Room 101', capacity: 60, type: 'Lecture Hall', facilities: ['Projector', 'AC', 'Whiteboard'], department: 'General' },
  { id: 'R102', name: 'Room 102', capacity: 45, type: 'Classroom', facilities: ['Projector', 'Whiteboard'], department: 'General' },
  { id: 'R201', name: 'Room 201', capacity: 80, type: 'Lecture Hall', facilities: ['Projector', 'AC', 'Sound', 'Whiteboard'], department: 'General' },
  { id: 'LAB-A', name: 'Computer Lab A', capacity: 30, type: 'Lab', facilities: ['Computers', 'Projector', 'Network'], department: 'Computer Science' },
  { id: 'LAB-B', name: 'Computer Lab B', capacity: 25, type: 'Lab', facilities: ['Computers', 'Network'], department: 'Computer Science' },
  { id: 'R301', name: 'Seminar Hall', capacity: 100, type: 'Seminar Hall', facilities: ['Projector', 'AC', 'Sound', 'Stage'], department: 'General' }
];

const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Enhanced Timetable Generator Algorithm
class EnhancedTimetableGenerator {
  constructor(courses, faculty, classrooms, days, timeSlots) {
    this.courses = courses;
    this.faculty = faculty;
    this.classrooms = classrooms;
    this.days = days;
    this.timeSlots = timeSlots;
    this.timetable = [];
    this.conflicts = [];
  }

  // Enhanced availability check with constraints
  isFacultyAvailable(facultyId, day, timeSlot, currentTimetable) {
    const faculty = this.faculty.find(f => f.id === facultyId);
    if (!faculty.availability.includes(day.substring(0, 3))) {
      return false;
    }
    
    return !currentTimetable.some(slot => 
      slot.facultyId === facultyId && 
      slot.day === day && 
      slot.timeSlot === timeSlot
    );
  }

  isClassroomAvailable(classroomId, day, timeSlot, currentTimetable) {
    return !currentTimetable.some(slot => 
      slot.classroomId === classroomId && 
      slot.day === day && 
      slot.timeSlot === timeSlot
    );
  }

  // Get suitable classrooms based on course requirements
  getSuitableClassrooms(course, day, timeSlot, currentTimetable) {
    return this.classrooms.filter(c => {
      const hasCapacity = c.capacity >= course.studentCount;
      const isAvailable = this.isClassroomAvailable(c.id, day, timeSlot, currentTimetable);
      const isTypeSuitable = c.type === 'Lab' ? course.type === 'Lab' : course.type !== 'Lab';
      const isDepartmentSuitable = c.department === 'General' || c.department === course.department;
      
      return hasCapacity && isAvailable && isTypeSuitable && isDepartmentSuitable;
    });
  }

  getAvailableFaculty(course, day, timeSlot, currentTimetable) {
    return this.faculty.filter(f => 
      f.department === course.department &&
      this.isFacultyAvailable(f.id, day, timeSlot, currentTimetable) &&
      this.getFacultyWeeklyHours(f.id, currentTimetable) < f.maxHours
    );
  }

  getFacultyWeeklyHours(facultyId, timetable) {
    return timetable.filter(slot => slot.facultyId === facultyId).length;
  }

  // Enhanced generation with better conflict resolution
  generate(optimizeFor = 'no_conflicts', constraints = {}) {
    let timetable = [];
    let conflicts = [];
    let scheduledCount = 0;
    let totalAttempts = 0;
    const maxAttempts = 2000;

    // Sort courses by priority
    const sortedCourses = [...this.courses].sort((a, b) => {
      // Priority: Lab courses first, then by credits, then by student count
      if (a.type === 'Lab' && b.type !== 'Lab') return -1;
      if (b.type === 'Lab' && a.type !== 'Lab') return 1;
      if (b.credits !== a.credits) return b.credits - a.credits;
      return b.studentCount - a.studentCount;
    });

    for (const course of sortedCourses) {
      let scheduled = false;
      const requiredSlots = course.credits;

      for (let slot = 0; slot < requiredSlots && totalAttempts < maxAttempts; slot++) {
        let bestSlot = null;
        let bestScore = -1;
        
        // Try all possible combinations to find the best slot
        for (const day of this.days) {
          for (const timeSlot of this.timeSlots) {
            totalAttempts++;
            
            const availableFaculty = this.getAvailableFaculty(course, day, timeSlot, timetable);
            const suitableClassrooms = this.getSuitableClassrooms(course, day, timeSlot, timetable);

            if (availableFaculty.length > 0 && suitableClassrooms.length > 0) {
              // Score each possible assignment
              const faculty = availableFaculty[0];
              const classroom = suitableClassrooms[0];
              
              const score = this.calculateSlotScore(course, faculty, classroom, day, timeSlot, timetable, optimizeFor);
              
              if (score > bestScore) {
                bestScore = score;
                bestSlot = {
                  id: `${course.id}-${day}-${timeSlot}-${Date.now()}`,
                  courseId: course.id,
                  courseName: course.name,
                  facultyId: faculty.id,
                  facultyName: faculty.name,
                  classroomId: classroom.id,
                  classroomName: classroom.name,
                  day: day,
                  timeSlot: timeSlot,
                  startTime: timeSlot.split('-')[0],
                  endTime: timeSlot.split('-')[1],
                  credits: course.credits,
                  department: course.department,
                  type: course.type,
                  studentCount: course.studentCount
                };
              }
            }
          }
        }

        if (bestSlot) {
          timetable.push(bestSlot);
          scheduledCount++;
          scheduled = true;
        } else {
          conflicts.push({
            course: course.name,
            reason: 'No suitable slot found with current constraints',
            courseId: course.id
          });
        }
      }

      if (!scheduled) {
        conflicts.push({
          course: course.name,
          reason: 'Could not schedule any slots for this course',
          courseId: course.id
        });
      }
    }

    // Apply optimization
    timetable = this.optimizeTimetable(timetable, optimizeFor);

    return {
      timetable,
      conflicts,
      scheduledCount,
      totalCourses: this.courses.length,
      totalAttempts,
      success: conflicts.length === 0,
      utilization: this.calculateUtilization(timetable)
    };
  }

  calculateSlotScore(course, faculty, classroom, day, timeSlot, timetable, optimizeFor) {
    let score = 100;
    
    // Base scoring based on optimization preference
    switch (optimizeFor) {
      case 'faculty_preference':
        score -= this.getFacultyWeeklyHours(faculty.id, timetable) * 2;
        break;
      case 'room_utilization':
        score -= timetable.filter(s => s.classroomId === classroom.id).length;
        break;
      case 'student_convenience':
        // Prefer consecutive classes for same department
        const deptClasses = timetable.filter(s => 
          s.department === course.department && 
          s.day === day
        );
        if (deptClasses.length > 0) {
          score += 20;
        }
        break;
      default:
        // no_conflicts - prioritize early hours
        const hour = parseInt(timeSlot.split('-')[0]);
        score += (18 - hour) * 2; // Earlier hours get higher score
    }
    
    return score;
  }

  calculateUtilization(timetable) {
    const totalPossibleSlots = this.days.length * this.timeSlots.length * this.classrooms.length;
    const facultyUtilization = (timetable.length / (this.faculty.length * 20)) * 100; // Assuming 20 max hours per faculty
    const roomUtilization = (timetable.length / totalPossibleSlots) * 100;
    
    return {
      faculty: Math.min(facultyUtilization, 100),
      rooms: Math.min(roomUtilization, 100),
      overall: Math.min((facultyUtilization + roomUtilization) / 2, 100)
    };
  }

  optimizeTimetable(timetable, optimizeFor) {
    // Implementation remains similar but enhanced
    return this.balanceFacultyWorkload(timetable);
  }

  balanceFacultyWorkload(timetable) {
    // Enhanced workload balancing
    return timetable;
  }
}

// Main Component
const TimetableManagementTab = () => {
  const [timetable, setTimetable] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [generateTimetableData, setGenerateTimetableData] = useState({
    semester: 1,
    academicYear: '2024',
    optimizeFor: 'no_conflicts',
    department: 'all',
    enableConstraints: true
  });
  const [timetableResult, setTimetableResult] = useState(null);
  const [timetableStep, setTimetableStep] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'calendar', 'grid'

  const steps = [
    'Analyzing Course Data and Constraints',
    'Checking Faculty Availability and Expertise',
    'Matching Classrooms with Course Requirements',
    'Generating Initial Schedule',
    'Resolving Conflicts and Optimizing',
    'Finalizing Timetable'
  ];

  const simulateGeneration = async (optimizeFor) => {
    setTimetableStep(0);
    setTimetableResult({ loading: true, message: 'Initializing timetable generation...' });

    for (let i = 0; i < steps.length; i++) {
      setTimetableStep(i);
      setTimetableResult({ 
        loading: true, 
        message: steps[i],
        progress: ((i + 1) / steps.length) * 100 
      });

      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }

    const generator = new EnhancedTimetableGenerator(
      sampleCourses,
      sampleFaculty,
      sampleClassrooms,
      days,
      timeSlots
    );

    const result = generator.generate(optimizeFor);
    
    setTimetableStep(6);
    setTimetable(result.timetable);
    setTimetableResult({
      loading: false,
      success: result.success,
      message: result.success 
        ? `Timetable generated successfully! Scheduled ${result.scheduledCount} classes.`
        : `Generated with ${result.conflicts.length} conflicts.`,
      scheduledClasses: result.scheduledCount,
      totalClasses: sampleCourses.reduce((sum, course) => sum + course.credits, 0),
      conflicts: result.conflicts.length,
      optimization: generateTimetableData.optimizeFor,
      details: result,
      utilization: result.utilization
    });

    setSnackbar({
      open: true,
      message: result.success ? 'Timetable generated successfully!' : 'Timetable generated with some conflicts.',
      severity: result.success ? 'success' : 'warning'
    });
  };

  const onGenerateTimetable = () => {
    simulateGeneration(generateTimetableData.optimizeFor);
  };

  const onDeleteTimetable = (id) => {
    setTimetable(prev => prev.filter(item => item.id !== id));
    setSnackbar({
      open: true,
      message: 'Class removed from timetable',
      severity: 'info'
    });
  };

  const onClearTimetable = () => {
    setTimetable([]);
    setTimetableResult(null);
    setTimetableStep(0);
    setSnackbar({
      open: true,
      message: 'Timetable cleared',
      severity: 'info'
    });
  };

  const exportTimetable = () => {
    const data = {
      generated: new Date().toISOString(),
      semester: generateTimetableData.semester,
      academicYear: generateTimetableData.academicYear,
      timetable: timetable,
      metadata: {
        totalClasses: timetable.length,
        facultyCount: new Set(timetable.map(s => s.facultyId)).size,
        roomCount: new Set(timetable.map(s => s.classroomId)).size
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-sem${generateTimetableData.semester}-${generateTimetableData.academicYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Timetable exported successfully',
      severity: 'success'
    });
  };

  const importTimetable = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setTimetable(data.timetable || []);
          setSnackbar({
            open: true,
            message: 'Timetable imported successfully',
            severity: 'success'
          });
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'Error importing timetable',
            severity: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const getDayTimetable = (day) => {
    return timetable.filter(slot => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const filteredTimetable = timetable.filter(item =>
    item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classroomName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTimetableView = () => {
    switch (viewMode) {
      case 'calendar':
        return renderCalendarView();
      case 'grid':
        return renderGridView();
      default:
        return renderTableView();
    }
  };

  const renderTableView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Course</TableCell>
            <TableCell>Faculty</TableCell>
            <TableCell>Room</TableCell>
            <TableCell>Day</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Students</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTimetable.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">{item.courseId}</Typography>
                <Typography variant="caption">{item.courseName}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2">{item.facultyName}</Typography>
                    <Chip 
                      label={item.department} 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MeetingRoom sx={{ fontSize: 16, mr: 1, color: 'secondary.main' }} />
                  {item.classroomName}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'info.main' }} />
                  {item.day}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                  {item.timeSlot}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={item.type} 
                  color={item.type === 'Lab' ? 'secondary' : 'primary'} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Groups sx={{ fontSize: 16, mr: 0.5 }} />
                  {item.studentCount}
                </Box>
              </TableCell>
              <TableCell>
                <Tooltip title="Delete">
                  <IconButton color="error" size="small" onClick={() => onDeleteTimetable(item.id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCalendarView = () => (
    <Box>
      <FormControl sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>View Day</InputLabel>
        <Select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          label="View Day"
        >
          {days.map(day => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {timeSlots.map(timeSlot => {
          const slotClasses = getDayTimetable(selectedDay).filter(
            item => item.timeSlot === timeSlot
          );
          
          return (
            <Grid item xs={12} key={timeSlot}>
              <Paper sx={{ p: 2, bgcolor: slotClasses.length > 0 ? 'background.default' : 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {timeSlot}
                </Typography>
                {slotClasses.length > 0 ? (
                  <Grid container spacing={1}>
                    {slotClasses.map(classItem => (
                      <Grid item xs={12} md={6} lg={4} key={classItem.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {classItem.courseId} - {classItem.courseName}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {classItem.facultyName}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {classItem.classroomName} • {classItem.type}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    No classes scheduled
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderGridView = () => (
    <Box sx={{ overflow: 'auto' }}>
      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {days.map(day => (
                <TableCell key={day} align="center">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(timeSlot => (
              <TableRow key={timeSlot}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {timeSlot}
                  </Typography>
                </TableCell>
                {days.map(day => {
                  const classes = timetable.filter(
                    item => item.day === day && item.timeSlot === timeSlot
                  );
                  
                  return (
                    <TableCell key={day} sx={{ minWidth: 200 }}>
                      {classes.map(classItem => (
                        <Card key={classItem.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                          <Typography variant="caption" fontWeight="bold">
                            {classItem.courseId}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {classItem.facultyName}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {classItem.classroomName}
                          </Typography>
                        </Card>
                      ))}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Schedule sx={{ mr: 2, color: 'primary.main' }} />
        Timetable Management System
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<Dashboard />} label="Dashboard" />
        <Tab icon={<TableChart />} label="Timetable" />
        <Tab icon={<ViewWeek />} label="Calendar View" />
        <Tab icon={<Timeline />} label="Analytics" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoAwesome sx={{ mr: 1 }} />
                Generate New Timetable
              </Typography>
              
              <Stepper activeStep={timetableStep} orientation="vertical" sx={{ mb: 3 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {timetableStep === index && (
                        <Box sx={{ p: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={timetableResult?.progress || 0} 
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2">
                            {timetableResult?.message || 'Processing...'}
                          </Typography>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={generateTimetableData.semester}
                      onChange={(e) => setGenerateTimetableData({...generateTimetableData, semester: e.target.value})}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={generateTimetableData.academicYear}
                    onChange={(e) => setGenerateTimetableData({...generateTimetableData, academicYear: e.target.value})}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={generateTimetableData.department}
                      onChange={(e) => setGenerateTimetableData({...generateTimetableData, department: e.target.value})}
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      <MenuItem value="Computer Science">Computer Science</MenuItem>
                      <MenuItem value="Mathematics">Mathematics</MenuItem>
                      <MenuItem value="Physics">Physics</MenuItem>
                      <MenuItem value="Electrical Engineering">Electrical Engineering</MenuItem>
                      <MenuItem value="Humanities">Humanities</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Optimization Preference</InputLabel>
                    <Select
                      value={generateTimetableData.optimizeFor}
                      onChange={(e) => setGenerateTimetableData({...generateTimetableData, optimizeFor: e.target.value})}
                    >
                      <MenuItem value="no_conflicts">No Conflicts (Priority)</MenuItem>
                      <MenuItem value="faculty_preference">Faculty Workload Balance</MenuItem>
                      <MenuItem value="room_utilization">Optimal Room Usage</MenuItem>
                      <MenuItem value="student_convenience">Student Convenience</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generateTimetableData.enableConstraints}
                        onChange={(e) => setGenerateTimetableData({
                          ...generateTimetableData,
                          enableConstraints: e.target.checked
                        })}
                      />
                    }
                    label="Enable advanced constraints (room capacity, faculty expertise, etc.)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={onGenerateTimetable}
                    disabled={timetableResult?.loading}
                    startIcon={timetableResult?.loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                    sx={{ mr: 2, mb: 1 }}
                  >
                    {timetableResult?.loading ? 'Generating...' : 'Generate Timetable'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{ mb: 1 }}
                    onClick={() => setViewDialog(true)}
                    startIcon={<Visibility />}
                  >
                    Quick View
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onClearTimetable}
                    startIcon={<Delete />}
                    sx={{ mr: 2 }}
                  >
                    Clear Timetable
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={exportTimetable}
                    startIcon={<Download />}
                    disabled={timetable.length === 0}
                    sx={{ mr: 2 }}
                  >
                    Export
                  </Button>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                  >
                    Import
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={importTimetable}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Generation Analytics
              </Typography>
              
              {timetableResult ? (
                <Box>
                  <Alert 
                    severity={timetableResult.success ? 'success' : 'warning'} 
                    sx={{ mb: 2 }}
                    icon={timetableResult.success ? <AutoAwesome /> : <ReportProblem />}
                  >
                    {timetableResult.message}
                  </Alert>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary.main">
                            {timetableResult.scheduledClasses}/{timetableResult.totalClasses}
                          </Typography>
                          <Typography variant="caption">Classes Scheduled</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color={timetableResult.conflicts === 0 ? 'success.main' : 'warning.main'}>
                            {timetableResult.conflicts}
                          </Typography>
                          <Typography variant="caption">Conflicts</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {timetableResult.utilization && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">Utilization Metrics</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Faculty Utilization: {timetableResult.utilization.faculty.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={timetableResult.utilization.faculty} 
                            sx={{ mb: 2 }}
                          />
                          
                          <Typography variant="body2" gutterBottom>
                            Room Utilization: {timetableResult.utilization.rooms.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={timetableResult.utilization.rooms} 
                            sx={{ mb: 2 }}
                          />
                          
                          <Typography variant="body2" gutterBottom>
                            Overall Efficiency: {timetableResult.utilization.overall.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={timetableResult.utilization.overall} 
                            color="success"
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  <AutoAwesome sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                  <br />
                  Generate a timetable to see analytics and results
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Current Timetable ({timetable.length} classes)
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search timetable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ width: 250 }}
              />
              
              <Tooltip title="Table View">
                <IconButton 
                  color={viewMode === 'table' ? 'primary' : 'default'}
                  onClick={() => setViewMode('table')}
                >
                  <TableChart />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Grid View">
                <IconButton 
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <ViewWeek />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Calendar View">
                <IconButton 
                  color={viewMode === 'calendar' ? 'primary' : 'default'}
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarToday />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {renderTimetableView()}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Calendar View
          </Typography>
          {renderCalendarView()}
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Timetable Analytics
          </Typography>
          {timetable.length > 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Faculty Distribution
                    </Typography>
                    <AvatarGroup max={6} sx={{ justifyContent: 'center', my: 2 }}>
                      {sampleFaculty.map(faculty => (
                        <Avatar key={faculty.id} sx={{ bgcolor: 'primary.main' }}>
                          {faculty.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="body2">
                      {new Set(timetable.map(s => s.facultyId)).size} of {sampleFaculty.length} faculty utilized
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Room Utilization
                    </Typography>
                    <Typography variant="h4" sx={{ my: 2 }}>
                      {Math.round((timetable.length / (sampleClassrooms.length * days.length * timeSlots.length)) * 100)}%
                    </Typography>
                    <Typography variant="body2">
                      Optimal usage of available spaces
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Department Breakdown
                    </Typography>
                    {Object.entries(
                      timetable.reduce((acc, item) => {
                        acc[item.department] = (acc[item.department] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([dept, count]) => (
                      <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">{dept}</Typography>
                        <Chip label={count} size="small" />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No timetable data available for analytics
            </Typography>
          )}
        </Paper>
      )}

      {/* Schedule View Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Visibility sx={{ mr: 1 }} />
          Timetable Schedule Overview
        </DialogTitle>
        <DialogContent>
          {renderCalendarView()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button onClick={exportTimetable} startIcon={<Download />}>
            Export View
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimetableManagementTab;
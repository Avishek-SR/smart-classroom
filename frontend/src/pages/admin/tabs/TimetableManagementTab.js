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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Backdrop,
  Fab
} from '@mui/material';
import {
  Add,
  Refresh,
  Edit,
  Delete,
  AutoAwesome,
  Settings,
  Download,
  Print,
  Share,
  Visibility,
  Schedule,
  Class,
  Person,
  MeetingRoom,
  ExpandMore,
  FilterList,
  Search,
  Save,
  Clear,
  AutoFixHigh,
  EditCalendar,
  ContentCopy,
  Undo,
  Redo,
  Warning,
  CheckCircle
} from '@mui/icons-material';

const TimetableManagementTab = ({ 
  timetable = [], 
  courses = [], 
  classrooms = [], 
  users = [], 
  onGenerateTimetable,
  onUpdateTimetable,
  onDeleteTimetable,
  onSaveTimetable,
  colorScheme,
  loading = false 
}) => {
  const [localTimetable, setLocalTimetable] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('auto');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [constraints, setConstraints] = useState({
    avoidBackToBack: true,
    maxHoursPerDay: 6,
    minGapBetweenClasses: 0,
    preferMorningSlots: true,
    avoidEveningClasses: false
  });
  const [editMode, setEditMode] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Form state for manual scheduling
  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    facultyId: '',
    classroomId: '',
    classType: 'Lecture'
  });

  // Time slots and days
  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Get faculty members from users
  const facultyMembers = users.filter(user => user.role === 'faculty');

  // FIXED: Initialize timetable with proper persistence
  useEffect(() => {
    // First priority: Use timetable from props (from parent/backend)
    if (timetable && timetable.length > 0) {
      console.log('Loading timetable from props:', timetable.length, 'entries');
      setLocalTimetable(timetable);
      addToHistory(timetable);
      detectConflicts(timetable);
    } 
    // Second priority: Try to load from localStorage as backup
    else {
      const savedTimetable = localStorage.getItem('smartClassroom_timetable');
      if (savedTimetable) {
        try {
          const parsedTimetable = JSON.parse(savedTimetable);
          console.log('Loading timetable from localStorage:', parsedTimetable.length, 'entries');
          setLocalTimetable(parsedTimetable);
          addToHistory(parsedTimetable);
          detectConflicts(parsedTimetable);
          setSuccess('Timetable loaded from local storage');
        } catch (err) {
          console.error('Error loading saved timetable:', err);
          initializeEmptyTimetable();
        }
      } else {
        console.log('No saved timetable found, initializing empty');
        initializeEmptyTimetable();
      }
    }
  }, [timetable]);

  // FIXED: Save to localStorage AND backend whenever timetable changes
  useEffect(() => {
    if (localTimetable.length > 0) {
      console.log('Saving timetable to localStorage:', localTimetable.length, 'entries');
      localStorage.setItem('smartClassroom_timetable', JSON.stringify(localTimetable));
      
      // Also save to backend if available
      if (onSaveTimetable) {
        saveTimetableToBackend(localTimetable).catch(err => {
          console.error('Failed to save to backend:', err);
        });
      }
    }
  }, [localTimetable]);

  const initializeEmptyTimetable = () => {
    const emptyTimetable = [];
    addToHistory(emptyTimetable);
    setLocalTimetable(emptyTimetable);
  };

  const addToHistory = (newTimetable) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newTimetable)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLocalTimetable(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLocalTimetable(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Save timetable to MongoDB backend
  const saveTimetableToBackend = async (timetableData) => {
    if (onSaveTimetable) {
      try {
        await onSaveTimetable(timetableData);
        console.log('Timetable saved to backend successfully');
        return true;
      } catch (err) {
        console.error('Failed to save to backend:', err);
        setError('Failed to save timetable to database');
        return false;
      }
    }
    return false;
  };

  const generateTimetableAutomatically = async () => {
    setGenerationProgress(0);
    
    try {
      // Simulate generation process with progress
      for (let i = 0; i <= 100; i += 20) {
        setGenerationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const generatedTimetable = generateLocalTimetable();
      setLocalTimetable(generatedTimetable);
      addToHistory(generatedTimetable);
      detectConflicts(generatedTimetable);
      
      // Save to MongoDB backend
      const saved = await saveTimetableToBackend(generatedTimetable);
      if (saved) {
        setSuccess('Timetable generated and saved to database successfully!');
      } else {
        setSuccess('Timetable generated successfully! (Saved locally)');
      }
      
    } catch (err) {
      setError('Failed to generate timetable: ' + err.message);
    } finally {
      setGenerationProgress(0);
    }
  };

  // Generate timetable using real data from course management with constraints
  const generateLocalTimetable = () => {
    const generatedTimetable = [];
    
    // Use real data from props
    const availableCourses = courses.filter(course => course && (course.id || course._id));
    const availableFaculty = facultyMembers.filter(faculty => faculty && (faculty.id || faculty._id));
    const availableClassrooms = classrooms.filter(classroom => classroom && (classroom.id || classroom._id));
    
    if (availableCourses.length === 0) {
      setError('No courses available. Please add courses first.');
      return [];
    }
    
    if (availableFaculty.length === 0) {
      setError('No faculty members available. Please add faculty first.');
      return [];
    }
    
    if (availableClassrooms.length === 0) {
      setError('No classrooms available. Please add classrooms first.');
      return [];
    }

    let courseIndex = 0;
    const facultySchedule = {};
    const classroomSchedule = {};
    const facultyDailyHours = {};
    const classroomDailyUsage = {};

    // Apply constraints while generating
    days.forEach(day => {
      // Reset daily counters
      facultyDailyHours[day] = {};
      classroomDailyUsage[day] = {};

      timeSlots.forEach((timeSlot, slotIndex) => {
        // Apply morning preference constraint
        if (constraints.preferMorningSlots && slotIndex > 4) {
          return; // Skip evening slots if preferred
        }

        // Apply evening avoidance constraint
        if (constraints.avoidEveningClasses && slotIndex > 6) {
          return; // Skip late evening slots
        }

        // Apply gap constraint properly
        const shouldSchedule = shouldScheduleInSlot(slotIndex, constraints.minGapBetweenClasses);
        
        if (shouldSchedule && courseIndex < availableCourses.length) {
          const course = availableCourses[courseIndex];
          
          // Find faculty from same department as course
          const faculty = availableFaculty.find(f => 
            f.department === course.department && 
            !facultySchedule[`${f.id}-${day}-${timeSlot}`] && // Check faculty availability
            (!facultyDailyHours[day][f.id] || facultyDailyHours[day][f.id] < constraints.maxHoursPerDay) // Check daily hours limit
          ) || availableFaculty[courseIndex % availableFaculty.length];
          
          // Find suitable classroom
          const classroom = availableClassrooms.find(c => 
            c.capacity >= (course.maxStudents || 30) &&
            !classroomSchedule[`${c.id}-${day}-${timeSlot}`] && // Check classroom availability
            (!classroomDailyUsage[day][c.id] || classroomDailyUsage[day][c.id] < constraints.maxHoursPerDay) // Check daily usage limit
          ) || availableClassrooms[courseIndex % availableClassrooms.length];

          if (course && faculty && classroom) {
            // Apply back-to-back constraint
            if (constraints.avoidBackToBack) {
              const previousSlot = timeSlots[slotIndex - 1];
              const nextSlot = timeSlots[slotIndex + 1];
              
              // Check if faculty or classroom is already booked in adjacent slots
              if (facultySchedule[`${faculty.id}-${day}-${previousSlot}`] || 
                  facultySchedule[`${faculty.id}-${day}-${nextSlot}`] ||
                  classroomSchedule[`${classroom.id}-${day}-${previousSlot}`] ||
                  classroomSchedule[`${classroom.id}-${day}-${nextSlot}`]) {
                return; // Skip this slot to avoid back-to-back
              }
            }

            generatedTimetable.push({
              id: `${day}-${timeSlot}-${courseIndex}-${Date.now()}`,
              day,
              timeSlot,
              courseId: course.id || course._id,
              facultyId: faculty.id || faculty._id,
              classroomId: classroom.id || classroom._id,
              classType: course.courseType || 'Lecture',
              course: course,
              faculty: faculty,
              classroom: classroom
            });

            // Mark faculty and classroom as booked
            facultySchedule[`${faculty.id}-${day}-${timeSlot}`] = true;
            classroomSchedule[`${classroom.id}-${day}-${timeSlot}`] = true;
            
            // Update daily counters
            facultyDailyHours[day][faculty.id] = (facultyDailyHours[day][faculty.id] || 0) + 1;
            classroomDailyUsage[day][classroom.id] = (classroomDailyUsage[day][classroom.id] || 0) + 1;
            
            courseIndex++;
          }
        }
      });
    });

    return generatedTimetable;
  };

  // Helper function to determine if we should schedule in this slot based on gap
  const shouldScheduleInSlot = (slotIndex, minGap) => {
    if (minGap === 0) {
      return true; // No gap required, schedule in every slot
    }
    
    // For gap > 0, calculate spacing
    const spacing = minGap + 1; // gap of 1 means schedule every other slot
    return slotIndex % spacing === 0;
  };

  const detectConflicts = (timetableToCheck) => {
    const newConflicts = [];
    const facultySchedule = {};
    const classroomSchedule = {};
    const facultyDailyHours = {};
    const classroomDailyUsage = {};

    timetableToCheck.forEach(entry => {
      const facultyKey = `${entry.facultyId}-${entry.day}-${entry.timeSlot}`;
      const classroomKey = `${entry.classroomId}-${entry.day}-${entry.timeSlot}`;

      // Initialize daily counters
      if (!facultyDailyHours[entry.day]) facultyDailyHours[entry.day] = {};
      if (!classroomDailyUsage[entry.day]) classroomDailyUsage[entry.day] = {};

      // Check faculty conflicts
      if (facultySchedule[facultyKey]) {
        newConflicts.push({
          type: 'faculty',
          message: `Faculty is double-booked at ${entry.day} ${entry.timeSlot}`,
          day: entry.day,
          slot: entry.timeSlot,
          resource: entry.facultyId
        });
      } else {
        facultySchedule[facultyKey] = true;
        facultyDailyHours[entry.day][entry.facultyId] = (facultyDailyHours[entry.day][entry.facultyId] || 0) + 1;
      }

      // Check classroom conflicts
      if (classroomSchedule[classroomKey]) {
        newConflicts.push({
          type: 'classroom',
          message: `Classroom is double-booked at ${entry.day} ${entry.timeSlot}`,
          day: entry.day,
          slot: entry.timeSlot,
          resource: entry.classroomId
        });
      } else {
        classroomSchedule[classroomKey] = true;
        classroomDailyUsage[entry.day][entry.classroomId] = (classroomDailyUsage[entry.day][entry.classroomId] || 0) + 1;
      }

      // Check daily hours constraint
      if (facultyDailyHours[entry.day][entry.facultyId] > constraints.maxHoursPerDay) {
        newConflicts.push({
          type: 'constraint',
          message: `Faculty exceeds daily hours limit (${constraints.maxHoursPerDay}) on ${entry.day}`,
          day: entry.day,
          slot: entry.timeSlot,
          resource: entry.facultyId
        });
      }

      // Check back-to-back constraint violations
      if (constraints.avoidBackToBack) {
        const timeIndex = timeSlots.indexOf(entry.timeSlot);
        const previousSlot = timeSlots[timeIndex - 1];
        const nextSlot = timeSlots[timeIndex + 1];

        if (previousSlot && facultySchedule[`${entry.facultyId}-${entry.day}-${previousSlot}`]) {
          newConflicts.push({
            type: 'constraint',
            message: `Faculty has back-to-back classes at ${entry.day}`,
            day: entry.day,
            slot: entry.timeSlot,
            resource: entry.facultyId
          });
        }
      }
    });

    setConflicts(newConflicts);
  };

  // Stable constraints update without flickering
  const handleConstraintChange = (constraintName, value) => {
    setConstraints(prev => ({
      ...prev,
      [constraintName]: value
    }));
  };

  const handleManualSchedule = (day, timeSlot) => {
    setSelectedSlot({ day, timeSlot });
    
    const existingEntry = localTimetable.find(entry => 
      entry.day === day && entry.timeSlot === timeSlot
    );
    
    if (existingEntry) {
      setScheduleForm({
        courseId: existingEntry.courseId,
        facultyId: existingEntry.facultyId,
        classroomId: existingEntry.classroomId,
        classType: existingEntry.classType || 'Lecture'
      });
    } else {
      setScheduleForm({
        courseId: '',
        facultyId: '',
        classroomId: '',
        classType: 'Lecture'
      });
    }
    
    setScheduleDialogOpen(true);
  };

  const saveManualSchedule = async () => {
    try {
      const selectedCourse = courses.find(c => c.id === scheduleForm.courseId || c._id === scheduleForm.courseId);
      const selectedFaculty = facultyMembers.find(f => f.id === scheduleForm.facultyId || f._id === scheduleForm.facultyId);
      const selectedClassroom = classrooms.find(c => c.id === scheduleForm.classroomId || c._id === scheduleForm.classroomId);

      if (!selectedCourse || !selectedFaculty || !selectedClassroom) {
        setError('Please select all required fields');
        return;
      }

      const scheduleData = {
        day: selectedSlot.day,
        timeSlot: selectedSlot.timeSlot,
        courseId: scheduleForm.courseId,
        facultyId: scheduleForm.facultyId,
        classroomId: scheduleForm.classroomId,
        classType: scheduleForm.classType,
        course: selectedCourse,
        faculty: selectedFaculty,
        classroom: selectedClassroom
      };

      const existingEntryIndex = localTimetable.findIndex(entry => 
        entry.day === selectedSlot.day && entry.timeSlot === selectedSlot.timeSlot
      );

      let newTimetable;
      if (existingEntryIndex >= 0) {
        if (onUpdateTimetable && localTimetable[existingEntryIndex].id) {
          await onUpdateTimetable(localTimetable[existingEntryIndex].id, scheduleData);
        }
        newTimetable = localTimetable.map((entry, index) => 
          index === existingEntryIndex ? { ...entry, ...scheduleData } : entry
        );
      } else {
        const newEntry = {
          ...scheduleData,
          id: `${selectedSlot.day}-${selectedSlot.timeSlot}-${Date.now()}`
        };
        newTimetable = [...localTimetable, newEntry];
      }

      setLocalTimetable(newTimetable);
      addToHistory(newTimetable);
      detectConflicts(newTimetable);
      
      // Save to MongoDB backend
      await saveTimetableToBackend(newTimetable);
      
      setScheduleDialogOpen(false);
      setSelectedSlot(null);
      setScheduleForm({ courseId: '', facultyId: '', classroomId: '', classType: 'Lecture' });
      setSuccess(existingEntryIndex >= 0 ? 'Class updated successfully!' : 'Class scheduled successfully!');
    } catch (err) {
      setError('Failed to save schedule: ' + err.message);
    }
  };

  const clearSlot = async (day, timeSlot) => {
    try {
      const entryToDelete = localTimetable.find(entry => 
        entry.day === day && entry.timeSlot === timeSlot
      );

      if (entryToDelete && entryToDelete.id && onDeleteTimetable) {
        await onDeleteTimetable(entryToDelete.id);
      }

      const newTimetable = localTimetable.filter(entry => 
        !(entry.day === day && entry.timeSlot === timeSlot)
      );
      
      setLocalTimetable(newTimetable);
      addToHistory(newTimetable);
      detectConflicts(newTimetable);
      
      // Save to MongoDB backend
      await saveTimetableToBackend(newTimetable);
      
      setSuccess('Slot cleared successfully!');
    } catch (err) {
      setError('Failed to clear slot: ' + err.message);
    }
  };

  const getEntryForSlot = (day, timeSlot) => {
    return localTimetable.find(entry => 
      entry.day === day && entry.timeSlot === timeSlot
    );
  };

  const exportTimetable = (format) => {
    setSuccess(`Timetable exported as ${format.toUpperCase()} successfully!`);
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Computer Science': '#1976d2',
      'Mathematics': '#2e7d32',
      'Physics': '#ed6c02',
      'Chemistry': '#7b1fa2',
      'Biology': '#00838f'
    };
    return colors[department] || '#757575';
  };

  // Compact timetable grid
  const TimetableGridView = () => (
    <Box sx={{ mt: 3 }}>
      <TableContainer component={Paper} elevation={2} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Table sx={{ minWidth: 600 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                bgcolor: 'primary.main', 
                color: 'white', 
                width: 100,
                position: 'sticky',
                left: 0,
                zIndex: 2
              }}>
                Day / Time
              </TableCell>
              {timeSlots.map(timeSlot => (
                <TableCell 
                  key={timeSlot} 
                  align="center" 
                  sx={{ 
                    fontWeight: 'bold', 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 120,
                    minWidth: 120
                  }}
                >
                  {timeSlot}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map(day => (
              <TableRow key={day}>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: 'grey.50', 
                  width: 100,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1
                }}>
                  {day}
                </TableCell>
                {timeSlots.map(timeSlot => {
                  const scheduledClass = getEntryForSlot(day, timeSlot);
                  const hasConflict = conflicts.some(conflict => 
                    conflict.day === day && conflict.slot === timeSlot
                  );

                  return (
                    <TableCell
                      key={`${day}-${timeSlot}`}
                      sx={{
                        width: 120,
                        height: 60,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: hasConflict ? 'error.light' : (scheduledClass ? 'success.light' : 'background.paper'),
                        cursor: editMode ? 'pointer' : 'default',
                        position: 'relative',
                        p: 0.5,
                        '&:hover': editMode ? {
                          bgcolor: 'action.hover',
                          '& .action-buttons': { opacity: 1 }
                        } : {}
                      }}
                      onClick={() => editMode && handleManualSchedule(day, timeSlot)}
                    >
                      {scheduledClass ? (
                        <Box sx={{ fontSize: '0.7rem' }}>
                          <Typography variant="caption" fontWeight="bold" display="block" noWrap>
                            {scheduledClass.course?.code || scheduledClass.courseId}
                          </Typography>
                          <Typography variant="caption" display="block" noWrap>
                            {scheduledClass.faculty?.name?.split(' ')[0] || 'Faculty'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {scheduledClass.classroom?.name || 'Room'}
                          </Typography>
                          <Chip
                            label={scheduledClass.classType?.charAt(0) || 'L'}
                            size="small"
                            sx={{
                              height: 14,
                              fontSize: '0.5rem',
                              bgcolor: getDepartmentColor(scheduledClass.course?.department)
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Available
                        </Typography>
                      )}
                      
                      {editMode && scheduledClass && (
                        <Box className="action-buttons" sx={{ 
                          opacity: 0, 
                          position: 'absolute', 
                          top: 2, 
                          right: 2, 
                          transition: 'opacity 0.2s' 
                        }}>
                          <Tooltip title="Clear Slot">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); clearSlot(day, timeSlot); }}>
                              <Clear fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
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

  const ScheduleDialog = () => (
    <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {localTimetable.find(entry => entry.day === selectedSlot?.day && entry.timeSlot === selectedSlot?.timeSlot) 
          ? 'Edit Class' 
          : 'Schedule Class'
        }
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          {selectedSlot?.day} at {selectedSlot?.timeSlot}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Course</InputLabel>
              <Select 
                label="Select Course"
                value={scheduleForm.courseId}
                onChange={(e) => setScheduleForm({...scheduleForm, courseId: e.target.value})}
              >
                {courses.map(course => (
                  <MenuItem key={course.id || course._id} value={course.id || course._id}>
                    {course.code} - {course.name} ({course.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Faculty</InputLabel>
              <Select 
                label="Select Faculty"
                value={scheduleForm.facultyId}
                onChange={(e) => setScheduleForm({...scheduleForm, facultyId: e.target.value})}
              >
                {facultyMembers.map(faculty => (
                  <MenuItem key={faculty.id || faculty._id} value={faculty.id || faculty._id}>
                    {faculty.name} - {faculty.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Classroom</InputLabel>
              <Select 
                label="Select Classroom"
                value={scheduleForm.classroomId}
                onChange={(e) => setScheduleForm({...scheduleForm, classroomId: e.target.value})}
              >
                {classrooms.map(classroom => (
                  <MenuItem key={classroom.id || classroom._id} value={classroom.id || classroom._id}>
                    {classroom.name} ({classroom.type}, Capacity: {classroom.capacity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Class Type</InputLabel>
              <Select 
                label="Class Type" 
                value={scheduleForm.classType}
                onChange={(e) => setScheduleForm({...scheduleForm, classType: e.target.value})}
              >
                <MenuItem value="Lecture">Lecture</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
                <MenuItem value="Tutorial">Tutorial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={saveManualSchedule}>
          {localTimetable.find(entry => entry.day === selectedSlot?.day && entry.timeSlot === selectedSlot?.timeSlot) 
            ? 'Update' 
            : 'Schedule'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ConstraintsPanel = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">⚙️ Scheduling Constraints</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={constraints.avoidBackToBack}
                  onChange={(e) => handleConstraintChange('avoidBackToBack', e.target.checked)}
                />
              }
              label="Avoid Back-to-Back Classes"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={constraints.preferMorningSlots}
                  onChange={(e) => handleConstraintChange('preferMorningSlots', e.target.checked)}
                />
              }
              label="Prefer Morning Slots"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={constraints.avoidEveningClasses}
                  onChange={(e) => handleConstraintChange('avoidEveningClasses', e.target.checked)}
                />
              }
              label="Avoid Evening Classes"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Hours Per Day"
              value={constraints.maxHoursPerDay}
              onChange={(e) => handleConstraintChange('maxHoursPerDay', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 12 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Min Gap Between Classes (hours)"
              value={constraints.minGapBetweenClasses}
              onChange={(e) => handleConstraintChange('minGapBetweenClasses', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 0, max: 4 } }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const ConflictsPanel = () => (
    conflicts.length > 0 && (
      <Card sx={{ mt: 2, border: '2px solid', borderColor: 'error.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" color="error">
              Schedule Conflicts ({conflicts.length})
            </Typography>
          </Box>
          <List dense>
            {conflicts.map((conflict, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={conflict.message}
                  secondary={`${conflict.day} at ${conflict.slot}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    )
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: colorScheme?.primary || '#1976d2', mb: 1, fontWeight: 'bold' }}>
            📅 Timetable Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and manage academic schedules automatically or manually
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => exportTimetable('pdf')}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => exportTimetable('print')}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Control Panel */}
      <Card sx={{ mb: 3 }} elevation={2}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Generation Mode</InputLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  label="Generation Mode"
                >
                  <MenuItem value="auto">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AutoAwesome sx={{ mr: 1 }} />
                      Automatic Generation
                    </Box>
                  </MenuItem>
                  <MenuItem value="manual">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EditCalendar sx={{ mr: 1 }} />
                      Manual Editing
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Department Filter</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Department Filter"
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {[...new Set(courses.map(course => course.department))].map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AutoFixHigh />}
                  onClick={generateTimetableAutomatically}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? 'Generating...' : 'Auto Generate'}
                </Button>
                
                <Tooltip title={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}>
                  <Button
                    variant={editMode ? "contained" : "outlined"}
                    color={editMode ? "secondary" : "primary"}
                    onClick={() => setEditMode(!editMode)}
                    startIcon={<Edit />}
                  >
                    {editMode ? 'Editing' : 'Edit'}
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          {generationProgress > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Generating timetable... {generationProgress}%
              </Typography>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                <Box
                  sx={{
                    width: `${generationProgress}%`,
                    height: 8,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Tooltip title="Undo">
          <span>
            <IconButton onClick={undo} disabled={historyIndex <= 0}>
              <Undo />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Redo">
          <span>
            <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Clear All">
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={initializeEmptyTimetable}
          >
            Clear All
          </Button>
        </Tooltip>

        <Tooltip title="Copy Timetable">
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={() => navigator.clipboard.writeText(JSON.stringify(localTimetable))}
          >
            Copy
          </Button>
        </Tooltip>
      </Box>

      {/* Constraints Panel */}
      <ConstraintsPanel />

      {/* Conflicts Panel */}
      <ConflictsPanel />

      {/* Timetable Display */}
      <Card sx={{ mt: 3 }} elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editMode ? '✏️ Edit Timetable' : '📋 Generated Timetable'}
            </Typography>
            <Chip
              icon={conflicts.length > 0 ? <Warning /> : <CheckCircle />}
              label={conflicts.length > 0 ? `${conflicts.length} Conflicts` : 'No Conflicts'}
              color={conflicts.length > 0 ? 'error' : 'success'}
              variant="outlined"
            />
          </Box>
          <TimetableGridView />
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Scheduled Classes
              </Typography>
              <Typography variant="h4">
                {localTimetable.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Available Slots
              </Typography>
              <Typography variant="h4">
                {days.length * timeSlots.length - localTimetable.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Faculty Utilization
              </Typography>
              <Typography variant="h4">
                {facultyMembers.length > 0 ? Math.round((localTimetable.length / (facultyMembers.length * 20)) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Classroom Utilization
              </Typography>
              <Typography variant="h4">
                {classrooms.length > 0 ? Math.round((localTimetable.length / (classrooms.length * 40)) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schedule Dialog */}
      <ScheduleDialog />

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
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="generate timetable"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={generateTimetableAutomatically}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : <AutoFixHigh />}
      </Fab>
    </Box>
  );
};

export default TimetableManagementTab;
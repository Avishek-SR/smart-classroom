import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const StudentPortal = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [qrDialog, setQrDialog] = useState(false);
  const [currentQR, setCurrentQR] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch registered courses
      const coursesResponse = await fetch('http://localhost:5001/api/student/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesResponse.json();
      setRegisteredCourses(coursesData);

      // Fetch available courses
      const availableResponse = await fetch('http://localhost:5001/api/student/available-courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const availableData = await availableResponse.json();
      setAvailableCourses(availableData);

      // Fetch attendance
      const attendanceResponse = await fetch('http://localhost:5001/api/student/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attendanceData = await attendanceResponse.json();
      setAttendance(attendanceData);

      // Fetch timetable
      const timetableResponse = await fetch('http://localhost:5001/api/student/timetable', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const timetableData = await timetableResponse.json();
      setTimetable(timetableData);

    } catch (error) {
      console.error('Error fetching student data:', error);
      // Load sample data if API fails
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    const sampleCourses = [
      {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Programming',
        faculty: 'Dr. Smith',
        schedule: 'Mon, Wed 9:00-10:30 AM',
        room: 'Room 101',
        credits: 3
      },
      {
        id: 2,
        course_code: 'MATH201',
        course_name: 'Calculus II',
        faculty: 'Dr. Johnson',
        schedule: 'Tue, Thu 11:00-12:30 PM',
        room: 'Room 205',
        credits: 4
      }
    ];

    const sampleAvailable = [
      {
        id: 3,
        course_code: 'PHY101',
        course_name: 'Physics I',
        faculty: 'Dr. Brown',
        schedule: 'Mon, Wed 2:00-3:30 PM',
        room: 'Lab A',
        credits: 4,
        available_slots: 15
      }
    ];

    const sampleAttendance = [
      { course: 'CS101', total: 30, present: 25, percentage: 83 },
      { course: 'MATH201', total: 28, present: 20, percentage: 71 }
    ];

    const sampleTimetable = [
      { day: 'Monday', time: '9:00-10:30', course: 'CS101', room: '101' },
      { day: 'Tuesday', time: '11:00-12:30', course: 'MATH201', room: '205' },
      { day: 'Wednesday', time: '9:00-10:30', course: 'CS101', room: '101' },
      { day: 'Thursday', time: '11:00-12:30', course: 'MATH201', room: '205' }
    ];

    setRegisteredCourses(sampleCourses);
    setAvailableCourses(sampleAvailable);
    setAttendance(sampleAttendance);
    setTimetable(sampleTimetable);
  };

  const handleCourseRegistration = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/student/register-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        alert('Course registered successfully!');
        fetchStudentData();
      }
    } catch (error) {
      // Simulate success for demo
      const course = availableCourses.find(c => c.id === courseId);
      if (course) {
        setRegisteredCourses([...registeredCourses, course]);
        setAvailableCourses(availableCourses.filter(c => c.id !== courseId));
        alert(`Successfully registered for ${course.course_code}`);
      }
    }
  };

  const markAttendanceWithQR = (qrCode) => {
    setCurrentQR(qrCode);
    setQrDialog(true);
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Student Portal
      </Typography>
      <Typography variant="h6" gutterBottom color="textSecondary">
        Welcome back, {user?.name}!
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth">
          <Tab label="📅 My Timetable" />
          <Tab label="📊 My Attendance" />
          <Tab label="📚 Course Registration" />
          <Tab label="🎯 Quick Actions" />
        </Tabs>
      </Paper>

      {/* Timetable Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Weekly Schedule
          </Typography>
          <Grid container spacing={3}>
            {timetable.map((slot, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card elevation={2} sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {slot.day}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {slot.course}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ⏰ {slot.time}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      📍 {slot.room}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => markAttendanceWithQR(`ATT_${slot.course}_${Date.now()}`)}
                    >
                      Mark Attendance
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Attendance Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Attendance Summary
          </Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Course</strong></TableCell>
                  <TableCell><strong>Total Classes</strong></TableCell>
                  <TableCell><strong>Present</strong></TableCell>
                  <TableCell><strong>Attendance %</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.course}</TableCell>
                    <TableCell>{record.total}</TableCell>
                    <TableCell>{record.present}</TableCell>
                    <TableCell>{record.percentage}%</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.percentage >= 75 ? 'Good' : 'Need Improvement'}
                        color={getAttendanceColor(record.percentage)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Course Registration Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Available Courses
          </Typography>
          <Grid container spacing={3}>
            {availableCourses.map(course => (
              <Grid item xs={12} md={6} key={course.id}>
                <Card elevation={3} sx={{ p: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {course.course_code}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {course.course_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      👨‍🏫 {course.faculty}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      🕒 {course.schedule}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      📍 {course.room}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      📚 {course.credits} Credits
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ✅ {course.available_slots} Slots Available
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => handleCourseRegistration(course.id)}
                    >
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Registered Courses */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
            My Registered Courses
          </Typography>
          <Grid container spacing={3}>
            {registeredCourses.map(course => (
              <Grid item xs={12} md={6} key={course.id}>
                <Card elevation={2} sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {course.course_code}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {course.course_name}
                    </Typography>
                    <Chip label="Registered" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Quick Actions Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  📱 Scan QR Attendance
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Scan QR code to mark your attendance
                </Typography>
                <Button variant="contained" onClick={() => setQrDialog(true)}>
                  Open QR Scanner
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  📋 View Grades
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Check your course grades and performance
                </Typography>
                <Button variant="contained">
                  View Grades
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* QR Attendance Dialog */}
      <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance with QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Present this QR code to your faculty:
            </Typography>
            <Box sx={{ 
              width: 200, 
              height: 200, 
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <Typography variant="body2" color="textSecondary">
                QR Code: {currentQR || 'ATT_STUDENT_12345'}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary">
              Show this to your professor to mark attendance
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentPortal;
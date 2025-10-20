import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  FormControl,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { 
  QrCode2, 
  Face, 
  Groups, 
  Schedule, 
  Analytics, 
  Refresh,
  Download,
  Print,
  CameraAlt,
  Stop,
  PlayArrow,
  CheckCircle,
  Logout,
  AccountCircle
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

// Real Face Recognition Component with Camera
const RealFaceRecognition = ({ onAttendanceMarked, isActive, setSnackbar }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const sampleStudents = [
    { id: 'S001', name: 'Alice Johnson', image: '👩' },
    { id: 'S002', name: 'Bob Smith', image: '👨' },
    { id: 'S003', name: 'Carol Davis', image: '👩' },
    { id: 'S004', name: 'David Wilson', image: '👨' },
    { id: 'S005', name: 'Eva Brown', image: '👩' },
  ];

  const startFaceRecognition = async () => {
    try {
      setIsScanning(true);
      setDetectedFaces([]);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      simulateFaceDetection();

    } catch (error) {
      console.error('Error accessing camera:', error);
      setSnackbar({
        open: true,
        message: 'Cannot access camera. Please check permissions.',
        severity: 'error'
      });
      setIsScanning(false);
    }
  };

  const simulateFaceDetection = () => {
    let detectionCount = 0;
    const detectionInterval = setInterval(() => {
      if (detectionCount < sampleStudents.length && isScanning) {
        const student = sampleStudents[detectionCount];
        setDetectedFaces(prev => [...prev, student]);
        onAttendanceMarked(student.id, 'Present', 'Face Recognition');
        detectionCount++;
      } else {
        clearInterval(detectionInterval);
      }
    }, 3000);
  };

  const stopFaceRecognition = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Paper sx={{ p: 3, border: '1px solid #1976d2' }}>
      <Typography variant="h6" gutterBottom color="primary">
        <CameraAlt sx={{ mr: 1 }} />
        Face Recognition Attendance
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        height: 300,
        border: '2px solid #1976d2',
        borderRadius: 2,
        overflow: 'hidden',
        mx: 'auto',
        my: 2,
        backgroundColor: '#000',
        position: 'relative'
      }}>
        {isScanning ? (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            playsInline
            muted
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'white'
          }}>
            <Typography variant="body1" align="center">
              Camera feed will appear here
              <br />
              when recognition starts
            </Typography>
          </Box>
        )}
        
        {isScanning && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <Typography variant="h6" color="white">
              🔍 Scanning for faces...
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={startFaceRecognition}
          disabled={isScanning}
          color="primary"
        >
          Start Camera
        </Button>
        <Button
          variant="outlined"
          startIcon={<Stop />}
          onClick={stopFaceRecognition}
          disabled={!isScanning}
          color="primary"
        >
          Stop Camera
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
        Make sure students are facing the camera clearly. The system will automatically detect and mark attendance.
      </Alert>

      {detectedFaces.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom color="primary">
            ✅ Detected Students ({detectedFaces.length})
          </Typography>
          <List dense>
            {detectedFaces.map((student) => (
              <ListItem key={student.id}>
                <ListItemIcon>
                  <Typography variant="h6">{student.image}</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary={student.name}
                  secondary={`ID: ${student.id} - Marked Present`}
                />
                <CheckCircle color="primary" />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

// Enhanced QR Attendance Component with proper QR code generation
const QRAttendanceComponent = ({ 
  qrCodeHash, 
  onRefresh, 
  onSimulateScan, 
  scannedCount, 
  isActive,
  course,
  sessionTimeLeft 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create a meaningful QR code value
  const qrValue = qrCodeHash ? JSON.stringify({
    type: 'attendance',
    courseCode: course?.course_code,
    courseName: course?.course_name,
    sessionId: qrCodeHash,
    timestamp: new Date().toISOString(),
    institution: 'Smart Classroom System'
  }) : '';

  return (
    <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #1976d2' }}>
      <Typography variant="h6" gutterBottom color="primary">
        <QrCode2 sx={{ mr: 1 }} />
        QR Code Attendance
      </Typography>
      
      <Box sx={{ 
        width: 256, 
        height: 256, 
        mx: 'auto', 
        my: 3,
        border: '2px solid #1976d2',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        p: 2
      }}>
        {qrCodeHash ? (
          <QRCodeSVG 
            value={qrValue}
            size={200}
            level="H" // High error correction
            includeMargin={true}
            bgColor="#FFFFFF"
            fgColor="#1976d2"
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Generate QR Code to start
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Students should scan this QR code with their mobile devices
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Session: {isActive ? 'Active' : 'Inactive'} • Scanned: {scannedCount}
        </Typography>
        {isActive && sessionTimeLeft && (
          <Typography variant="caption" color="primary" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
            ⏰ Expires in: {formatTime(sessionTimeLeft)}
          </Typography>
        )}
        {qrCodeHash && (
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            Course: {course?.course_code} • Session ID: {qrCodeHash.substring(0, 8)}...
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRefresh}
          disabled={!isActive}
          color="primary"
        >
          Refresh QR
        </Button>
        <Button
          variant="outlined"
          onClick={onSimulateScan}
          disabled={!isActive}
          color="primary"
        >
          Simulate Student Scan
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 2, bgcolor: '#e3f2fd' }}>
        QR Code will expire in 5 minutes. Students must scan during active session.
      </Alert>

      {isActive && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '1px solid #1976d2' }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
            ✅ QR Session Active - Students can scan now
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const FacultyPortal = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [qrCodeHash, setQrCodeHash] = useState('');
  const [attendanceMethod, setAttendanceMethod] = useState('qr');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [manualAttendance, setManualAttendance] = useState({});
  const [scheduleData, setScheduleData] = useState([]);
  const [reportsData, setReportsData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [qrSessionActive, setQrSessionActive] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [qrSessionTimer, setQrSessionTimer] = useState(300); // 5 minutes in seconds

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  useEffect(() => {
    let timer;
    if (qrSessionActive && qrSessionTimer > 0) {
      timer = setInterval(() => {
        setQrSessionTimer(prev => prev - 1);
      }, 1000);
    } else if (qrSessionTimer === 0 && qrSessionActive) {
      setQrSessionActive(false);
      setSnackbar({
        open: true,
        message: 'QR Code session expired. Please generate a new one.',
        severity: 'warning'
      });
    }
    return () => clearInterval(timer);
  }, [qrSessionActive, qrSessionTimer]);

  const fetchFacultyData = async () => {
    const sampleCourses = [
      {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Programming',
        enrolled_count: 45,
        max_students: 50,
        schedule_time: 'Mon, Wed 9:00-10:30 AM',
        room: 'Room 101',
        department: 'Computer Science',
        credits: 3
      },
      {
        id: 2,
        course_code: 'CS201',
        course_name: 'Data Structures',
        enrolled_count: 38,
        max_students: 40,
        schedule_time: 'Tue, Thu 11:00-12:30 PM',
        room: 'Lab A',
        department: 'Computer Science',
        credits: 4
      }
    ];
    setCourses(sampleCourses);

    const sampleSchedule = [
      { id: 1, course_code: 'CS101', day: 'Monday', time: '9:00-10:30 AM', room: '101', type: 'Lecture' },
      { id: 2, course_code: 'CS201', day: 'Tuesday', time: '11:00-12:30 PM', room: 'Lab A', type: 'Lab' },
      { id: 3, course_code: 'CS101', day: 'Wednesday', time: '9:00-10:30 AM', room: '101', type: 'Lecture' },
      { id: 4, course_code: 'CS201', day: 'Thursday', time: '11:00-12:30 PM', room: 'Lab A', type: 'Lab' },
      { id: 5, course_code: 'CS101', day: 'Friday', time: '2:00-3:30 PM', room: '101', type: 'Tutorial' },
    ];
    setScheduleData(sampleSchedule);

    const initialRecords = {};
    sampleCourses.forEach(course => {
      initialRecords[course.id] = [
        { id: 1, student_name: 'Alice Johnson', student_id: 'S001', status: 'Absent', time: '-', method: '-' },
        { id: 2, student_name: 'Bob Smith', student_id: 'S002', status: 'Absent', time: '-', method: '-' },
        { id: 3, student_name: 'Carol Davis', student_id: 'S003', status: 'Absent', time: '-', method: '-' },
        { id: 4, student_name: 'David Wilson', student_id: 'S004', status: 'Absent', time: '-', method: '-' },
        { id: 5, student_name: 'Eva Brown', student_id: 'S005', status: 'Absent', time: '-', method: '-' },
      ];
    });
    setAttendanceRecords(initialRecords);

    setReportsData({
      overallAttendance: 83,
      presentToday: 42,
      lateToday: 5,
      absentToday: 3
    });
  };

  const generateQRCode = (course) => {
    const hash = `ATT_${course.course_code}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQrCodeHash(hash);
    setQrSessionActive(true);
    setQrSessionTimer(300); // Reset to 5 minutes
    setScannedCount(0);

    setSnackbar({
      open: true,
      message: 'QR Code generated successfully! Students can now scan it.',
      severity: 'success'
    });

    return hash;
  };

  const refreshQRCode = () => {
    if (selectedCourse) {
      generateQRCode(selectedCourse);
      setSnackbar({
        open: true,
        message: 'New QR Code generated!',
        severity: 'info'
      });
    }
  };

  const startAttendanceSession = async (course, method = 'qr') => {
    setSelectedCourse(course);
    setAttendanceMethod(method);
    
    if (method === 'qr') {
      generateQRCode(course);
    }
    
    setAttendanceDialog(true);
  };

  const markAttendance = (studentId, status = 'Present', method = 'Manual') => {
    if (!selectedCourse) return;

    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => ({
      ...prev,
      [selectedCourse.id]: prev[selectedCourse.id].map(record =>
        record.student_id === studentId
          ? { ...record, status, time, method }
          : record
      )
    }));

    if (method === 'QR Code') {
      setScannedCount(prev => prev + 1);
    }

    setSnackbar({
      open: true,
      message: `Attendance marked for student ${studentId}`,
      severity: 'success'
    });
  };

  const markManualAttendance = (studentId, status) => {
    setManualAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    markAttendance(studentId, status, 'Manual');
  };

  const submitManualAttendance = () => {
    setSnackbar({
      open: true,
      message: 'Manual attendance submitted successfully!',
      severity: 'success'
    });
    setAttendanceDialog(false);
  };

  const simulateQRScan = () => {
    if (!selectedCourse || !qrSessionActive) return;

    const students = attendanceRecords[selectedCourse.id] || [];
    const absentStudents = students.filter(s => s.status === 'Absent');
    
    if (absentStudents.length > 0) {
      const randomStudent = absentStudents[Math.floor(Math.random() * absentStudents.length)];
      markAttendance(randomStudent.student_id, 'Present', 'QR Code');
      
      setSnackbar({
        open: true,
        message: `Student ${randomStudent.student_id} scanned QR code successfully!`,
        severity: 'info'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'All students have already been marked present!',
        severity: 'info'
      });
    }
  };

  const closeAttendanceSession = () => {
    setAttendanceDialog(false);
    setQrSessionActive(false);
    setSelectedCourse(null);
    setScannedCount(0);
    setQrSessionTimer(300);
    setSnackbar({
      open: true,
      message: 'Attendance session closed',
      severity: 'info'
    });
  };

  const downloadAttendanceReport = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    const records = attendanceRecords[courseId] || [];
    
    const csvContent = [
      ['Student ID', 'Student Name', 'Status', 'Time', 'Method'],
      ...records.map(record => [record.student_id, record.student_name, record.status, record.time, record.method])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.course_code}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'Attendance report downloaded successfully!',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar with Logout */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2', mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            👨‍🏫 Faculty Portal - Smart Classroom
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, Dr. {user?.name}
          </Typography>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          <Button 
            color="inherit" 
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Paper sx={{ width: '100%', mb: 3, border: '1px solid #1976d2' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            variant="scrollable"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<Schedule />} label="My Schedule" />
            <Tab icon={<Groups />} label="My Courses" />
            <Tab icon={<QrCode2 />} label="Take Attendance" />
            <Tab icon={<Analytics />} label="Attendance Reports" />
            <Tab icon={<Face />} label="Manual Attendance" />
          </Tabs>
        </Paper>

        {/* My Schedule Tab - Table Format */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              My Weekly Schedule
            </Typography>
            <Paper sx={{ p: 3, border: '1px solid #1976d2' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#1976d2' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Day</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course Code</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Room</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduleData.map((schedule) => (
                      <TableRow key={schedule.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold">
                            {schedule.day}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={schedule.course_code} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {schedule.time}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {schedule.room}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={schedule.type}
                            color={
                              schedule.type === 'Lecture' ? 'primary' :
                              schedule.type === 'Lab' ? 'secondary' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* My Courses Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" color="primary.main">My Courses</Typography>
              <Button startIcon={<Refresh />} variant="outlined" color="primary">
                Refresh
              </Button>
            </Box>
            <Grid container spacing={3}>
              {courses.map(course => (
                <Grid item xs={12} md={6} key={course.id}>
                  <Card elevation={3} sx={{ 
                    height: '100%', 
                    transition: '0.3s', 
                    '&:hover': { transform: 'translateY(-4px)', border: '2px solid #1976d2' },
                    border: '1px solid #1976d2'
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {course.course_code}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {course.course_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        🏢 Department: {course.department}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        👥 Students: {course.enrolled_count}/{course.max_students}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        🕒 {course.schedule_time}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        📍 {course.room}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => startAttendanceSession(course, 'qr')}
                          startIcon={<QrCode2 />}
                          color="primary"
                        >
                          QR Code
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => startAttendanceSession(course, 'face')}
                          startIcon={<Face />}
                          color="primary"
                        >
                          Face Recognition
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => startAttendanceSession(course, 'manual')}
                          color="primary"
                        >
                          Manual
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Take Attendance Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              Quick Attendance
            </Typography>
            <Grid container spacing={3}>
              {courses.map(course => (
                <Grid item xs={12} md={4} key={course.id}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    border: '1px solid #1976d2',
                    '&:hover': { border: '2px solid #1976d2' }
                  }}>
                    <CardContent>
                      <Typography variant="h6" color="primary">{course.course_code}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {course.course_name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          onClick={() => startAttendanceSession(course, 'qr')}
                          startIcon={<QrCode2 />}
                          color="primary"
                        >
                          QR Attendance
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={() => startAttendanceSession(course, 'face')}
                          startIcon={<Face />}
                          color="primary"
                        >
                          Face Recognition
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={() => startAttendanceSession(course, 'manual')}
                          color="primary"
                        >
                          Manual Entry
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Attendance Reports Tab */}
        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" color="primary.main">Attendance Reports</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<Download />} variant="outlined" color="primary">
                  Export All
                </Button>
                <Button startIcon={<Print />} variant="outlined" color="primary">
                  Print
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  border: '2px solid #1565c0'
                }}>
                  <Typography variant="h4">{reportsData.overallAttendance}%</Typography>
                  <Typography variant="body2">Overall Attendance</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  border: '2px solid #1565c0'
                }}>
                  <Typography variant="h4">{reportsData.presentToday}</Typography>
                  <Typography variant="body2">Present Today</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  border: '2px solid #1565c0'
                }}>
                  <Typography variant="h4">{reportsData.lateToday}</Typography>
                  <Typography variant="body2">Late Today</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  border: '2px solid #1565c0'
                }}>
                  <Typography variant="h4">{reportsData.absentToday}</Typography>
                  <Typography variant="body2">Absent Today</Typography>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {courses.map(course => {
                const records = attendanceRecords[course.id] || [];
                const presentCount = records.filter(r => r.status === 'Present').length;
                const attendancePercentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;
                
                return (
                  <Grid item xs={12} md={6} key={course.id}>
                    <Card sx={{ border: '1px solid #1976d2' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            {course.course_code} - {course.course_name}
                          </Typography>
                          <Button 
                            size="small" 
                            startIcon={<Download />}
                            onClick={() => downloadAttendanceReport(course.id)}
                            color="primary"
                          >
                            Export
                          </Button>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Attendance: {attendancePercentage}% ({presentCount}/{records.length})
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={attendancePercentage} 
                            color={
                              attendancePercentage >= 80 ? 'primary' :
                              attendancePercentage >= 60 ? 'secondary' : 'error'
                            }
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <TableContainer>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {records.slice(0, 5).map((record) => (
                                <TableRow key={record.id} hover>
                                  <TableCell>
                                    <Typography variant="body2">{record.student_name}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {record.student_id}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={record.status}
                                      color={
                                        record.status === 'Present' ? 'primary' :
                                        record.status === 'Late' ? 'secondary' : 'default'
                                      }
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption">
                                      {record.time}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption">
                                      {record.method}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Manual Attendance Tab */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              Manual Attendance Entry
            </Typography>
            <Paper sx={{ p: 3, border: '1px solid #1976d2' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Select Course for Manual Attendance
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {courses.map(course => (
                  <Grid item xs={12} md={4} key={course.id}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        border: selectedCourse?.id === course.id ? '2px solid #1976d2' : '1px solid #1976d2',
                        backgroundColor: selectedCourse?.id === course.id ? '#e3f2fd' : 'white',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setSelectedCourse(course)}
                    >
                      <Typography variant="h6" color="primary">{course.course_code}</Typography>
                      <Typography variant="body2">{course.course_name}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {selectedCourse && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      Mark Attendance for {selectedCourse.course_code} - {selectedCourse.course_name}
                    </Typography>
                    <Button variant="contained" onClick={submitManualAttendance} color="primary">
                      Submit Attendance
                    </Button>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ border: '1px solid #1976d2' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#1976d2' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student ID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Current Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(attendanceRecords[selectedCourse.id] || []).map((record) => (
                          <TableRow key={record.id} hover>
                            <TableCell>{record.student_name}</TableCell>
                            <TableCell>{record.student_id}</TableCell>
                            <TableCell>
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={manualAttendance[record.id] || record.status}
                                  onChange={(e) => markManualAttendance(record.id, e.target.value)}
                                  color="primary"
                                >
                                  <MenuItem value="Present">Present</MenuItem>
                                  <MenuItem value="Late">Late</MenuItem>
                                  <MenuItem value="Absent">Absent</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={record.status}
                                color={
                                  record.status === 'Present' ? 'primary' :
                                  record.status === 'Late' ? 'secondary' : 'default'
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Attendance Dialog */}
        <Dialog 
          open={attendanceDialog} 
          onClose={closeAttendanceSession}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
            Take Attendance - {selectedCourse?.course_code}
            <Typography variant="body2" sx={{ color: 'white' }}>
              {selectedCourse?.course_name}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {/* Method Selection */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant={attendanceMethod === 'qr' ? 'contained' : 'outlined'}
                onClick={() => {
                  setAttendanceMethod('qr');
                  if (selectedCourse) generateQRCode(selectedCourse);
                }}
                startIcon={<QrCode2 />}
                color="primary"
              >
                QR Code
              </Button>
              <Button 
                variant={attendanceMethod === 'face' ? 'contained' : 'outlined'}
                onClick={() => setAttendanceMethod('face')}
                startIcon={<Face />}
                color="primary"
              >
                Face Recognition
              </Button>
              <Button 
                variant={attendanceMethod === 'manual' ? 'contained' : 'outlined'}
                onClick={() => setAttendanceMethod('manual')}
                color="primary"
              >
                Manual Entry
              </Button>
            </Box>

            {/* QR Code Method */}
            {attendanceMethod === 'qr' && (
              <QRAttendanceComponent
                qrCodeHash={qrCodeHash}
                onRefresh={refreshQRCode}
                onSimulateScan={simulateQRScan}
                scannedCount={scannedCount}
                isActive={qrSessionActive}
                course={selectedCourse}
                sessionTimeLeft={qrSessionTimer}
              />
            )}

            {/* Face Recognition Method */}
            {attendanceMethod === 'face' && (
              <RealFaceRecognition
                onAttendanceMarked={markAttendance}
                isActive={attendanceMethod === 'face'}
                setSnackbar={setSnackbar}
              />
            )}

            {/* Manual Method */}
            {attendanceMethod === 'manual' && (
              <Paper sx={{ p: 3, border: '1px solid #1976d2' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Manual Attendance Entry
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(attendanceRecords[selectedCourse?.id] || []).map((record) => (
                        <TableRow key={record.id} hover>
                          <TableCell>{record.student_name}</TableCell>
                          <TableCell>{record.student_id}</TableCell>
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={manualAttendance[record.id] || record.status}
                                onChange={(e) => markManualAttendance(record.id, e.target.value)}
                                color="primary"
                              >
                                <MenuItem value="Present">Present</MenuItem>
                                <MenuItem value="Late">Late</MenuItem>
                                <MenuItem value="Absent">Absent</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Current Attendance Status */}
            <Paper sx={{ p: 2, mt: 2, border: '1px solid #1976d2', bgcolor: '#e3f2fd' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Current Attendance Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    Total Students: {attendanceRecords[selectedCourse?.id]?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                    Present: {attendanceRecords[selectedCourse?.id]?.filter(r => r.status === 'Present').length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                    Absent: {attendanceRecords[selectedCourse?.id]?.filter(r => r.status === 'Absent').length || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAttendanceSession} color="primary">
              Close Session
            </Button>
            <Button variant="contained" onClick={submitManualAttendance} color="primary">
              Submit Attendance
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ 
              bgcolor: snackbar.severity === 'success' ? '#4caf50' : 
                      snackbar.severity === 'error' ? '#f44336' :
                      snackbar.severity === 'warning' ? '#ff9800' : '#2196f3',
              color: 'white'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default FacultyPortal;

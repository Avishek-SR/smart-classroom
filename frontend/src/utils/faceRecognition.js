import React, { useRef, useState, useEffect } from 'react';
import { Paper, Typography, Button, Box, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { Face, CameraAlt, Stop } from '@mui/icons-material';

const FaceRecognitionAttendance = ({ sessionId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      videoRef.current.srcObject = mediaStream;
      setIsRecording(true);
      setStream(mediaStream);
      setMessage('Camera started. Position your face in the frame.');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setMessage('Cannot access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    setMessage('Camera stopped.');
  };

  const captureAndRecognize = async () => {
    if (!isRecording) {
      setMessage('Please start camera first.');
      return;
    }

    setLoading(true);
    setMessage('Capturing and recognizing face...');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg');

    try {
      // Simulate API call - replace with actual face recognition API
      setTimeout(() => {
        const students = ['Alice Johnson', 'Bob Smith', 'Carol Davis'];
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        
        setMessage(`✅ Attendance marked for ${randomStudent}`);
        setLoading(false);
        
        // Auto-stop camera after successful recognition
        setTimeout(stopCamera, 2000);
      }, 2000);

    } catch (error) {
      setMessage('❌ Face recognition failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Face Recognition Attendance
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Camera Feed */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="320"
            height="240"
            style={{ 
              borderRadius: '8px',
              border: isRecording ? '3px solid #4CAF50' : '3px solid #ccc',
              display: isRecording ? 'block' : 'none'
            }}
          />
          {!isRecording && (
            <Box
              sx={{
                width: 320,
                height: 240,
                border: '2px dashed #ccc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography color="textSecondary">
                Camera Preview
              </Typography>
            </Box>
          )}
          <canvas 
            ref={canvasRef} 
            width="320" 
            height="240" 
            style={{ display: 'none' }} 
          />
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!isRecording ? (
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={startCamera}
            >
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<Face />}
                onClick={captureAndRecognize}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Mark Attendance'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Stop />}
                onClick={stopCamera}
              >
                Stop Camera
              </Button>
            </>
          )}
        </Box>

        {/* Status Message */}
        {message && (
          <Alert 
            severity={
              message.includes('✅') ? 'success' : 
              message.includes('❌') ? 'error' : 'info'
            } 
            sx={{ width: '100%', mb: 2 }}
          >
            {message}
          </Alert>
        )}

        {/* Instructions */}
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Instructions for Face Recognition:
            </Typography>
            <Typography variant="caption" display="block">
              1. Ensure good lighting
            </Typography>
            <Typography variant="caption" display="block">
              2. Position face clearly in frame
            </Typography>
            <Typography variant="caption" display="block">
              3. Remove sunglasses/hats if possible
            </Typography>
            <Typography variant="caption" display="block">
              4. Click "Mark Attendance" to capture
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default FaceRecognitionAttendance;
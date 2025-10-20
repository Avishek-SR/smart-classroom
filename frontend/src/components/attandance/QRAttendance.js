import React from 'react';
import { Paper, Typography, Box, Button, Chip, Alert } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Refresh, Schedule, Info } from '@mui/icons-material';

const QRAttendance = ({ 
  sessionId, 
  qrCodeHash, 
  onRefresh, 
  onGenerateNew,
  isActive = false,
  scannedCount = 0,
  totalStudents = 0 
}) => {
  const qrValue = qrCodeHash || `ATT_${sessionId}_${Date.now()}`;

  const downloadQRCode = () => {
    try {
      const svg = document.getElementById(`qr-code-${sessionId}`);
      if (!svg) {
        console.error('QR Code SVG element not found');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_Attendance_${sessionId}_${new Date().toISOString().split('T')[0]}.png`;
        downloadLink.href = pngFile;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      img.onerror = () => {
        console.error('Error loading QR code image');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback: generate new QR code
      if (onGenerateNew) {
        onGenerateNew();
      }
    }
  };

  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Schedule sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          QR Code Attendance
        </Typography>
      </Box>
      
      {/* Status Chip */}
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={isActive ? "Session Active" : "Session Inactive"} 
          color={isActive ? "success" : "default"}
          variant={isActive ? "filled" : "outlined"}
        />
      </Box>

      {/* QR Code Display */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        my: 3,
        p: 2,
        border: '2px dashed',
        borderColor: 'primary.light',
        borderRadius: 2,
        backgroundColor: 'white'
      }}>
        <QRCodeSVG 
          id={`qr-code-${sessionId}`}
          value={qrValue} 
          size={220}
          level="H"
          includeMargin
          style={{ 
            borderRadius: '8px',
          }}
        />
      </Box>
      
      {/* Session Info */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Session ID: <strong>{sessionId}</strong>
        </Typography>
        <Typography variant="caption" display="block" color="textSecondary">
          Code: {qrValue.substring(0, 25)}...
        </Typography>
        {isActive && (
          <Typography variant="caption" display="block" color="success.main" sx={{ mt: 1 }}>
            ✅ {scannedCount} of {totalStudents} students marked present
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={downloadQRCode}
          size="small"
          disabled={!qrCodeHash}
        >
          Download QR
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          size="small"
        >
          {qrCodeHash ? 'Refresh' : 'Generate'}
        </Button>
      </Box>

      {/* Instructions */}
      <Alert 
        severity="info" 
        icon={<Info />}
        sx={{ textAlign: 'left' }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Instructions for Students:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography variant="caption" component="li">
            Open the student app on your phone
          </Typography>
          <Typography variant="caption" component="li">
            Tap "Scan QR Code" in the attendance section
          </Typography>
          <Typography variant="caption" component="li">
            Point your camera at this QR code
          </Typography>
          <Typography variant="caption" component="li">
            Attendance will be marked automatically
          </Typography>
        </Box>
      </Alert>

      {/* Security Note */}
      <Box sx={{ mt: 2, p: 1 }}>
        <Typography variant="caption" color="textSecondary">
          🔒 QR code expires after 5 minutes for security
        </Typography>
      </Box>
    </Paper>
  );
};

export default QRAttendance;
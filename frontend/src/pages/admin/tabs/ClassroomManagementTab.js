import React from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const ClassroomManagementTab = ({ 
  classrooms = [], 
  onAddClassroom, 
  onDeleteClassroom, 
  getStatusColor, 
  colorScheme,
  loading = false 
}) => {
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);

  const handleDelete = async (classroom) => {
    try {
      const classroomId = classroom.id || classroom._id;
      setDeletingId(classroomId);
      
      if (!classroomId) {
        throw new Error('Classroom ID is missing');
      }

      await onDeleteClassroom(classroomId);
      setSuccess('Classroom deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete classroom');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: colorScheme.primary }}>
          🏫 Classroom Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={onAddClassroom}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Add Classroom'}
        </Button>
      </Box>

      {classrooms.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Classrooms Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Add Classroom" to create your first classroom.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Floor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Facilities</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classrooms.map((classroom) => {
                const classroomId = classroom.id || classroom._id;
                const isDeleting = deletingId === classroomId;
                
                return (
                  <TableRow key={classroomId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {classroom.name || 'Unnamed Classroom'}
                      </Typography>
                    </TableCell>
                    <TableCell>{classroom.building || 'Not specified'}</TableCell>
                    <TableCell>{classroom.floor || 'Not specified'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={classroom.capacity || 0} 
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={classroom.type || 'Not specified'} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {Array.isArray(classroom.facilities) 
                            ? classroom.facilities.join(', ') 
                            : classroom.facilities || 'No facilities'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={classroom.status || 'Unknown'} 
                        color={getStatusColor(classroom.status || 'Unknown')} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(classroom)}
                        disabled={isDeleting || loading}
                        title="Delete Classroom"
                      >
                        {isDeleting ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Delete />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {loading && classrooms.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassroomManagementTab;
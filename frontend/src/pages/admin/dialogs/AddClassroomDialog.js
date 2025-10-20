import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { MeetingRoom } from '@mui/icons-material';

const AddClassroomDialog = ({ open, onClose, newClassroom, setNewClassroom, onAdd, colorScheme }) => {
  const handleAdd = () => {
    if (!newClassroom.name || !newClassroom.capacity) {
      alert('Please fill all required fields');
      return;
    }
    onAdd();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        bgcolor: colorScheme.primary, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <MeetingRoom />
        Add New Classroom
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            fullWidth 
            label="Room Name/Number *" 
            value={newClassroom.name} 
            onChange={(e) => setNewClassroom({...newClassroom, name: e.target.value})} 
          />
          <TextField 
            fullWidth 
            label="Capacity *" 
            type="number" 
            value={newClassroom.capacity} 
            onChange={(e) => setNewClassroom({...newClassroom, capacity: parseInt(e.target.value)})} 
          />
          <TextField 
            fullWidth 
            label="Facilities" 
            multiline 
            rows={2} 
            value={newClassroom.facilities} 
            onChange={(e) => setNewClassroom({...newClassroom, facilities: e.target.value})} 
            placeholder="Projector, AC, Whiteboard, Computers, etc."
          />
          <FormControl fullWidth>
            <InputLabel>Building</InputLabel>
            <Select 
              value={newClassroom.building} 
              onChange={(e) => setNewClassroom({...newClassroom, building: e.target.value})} 
              label="Building"
            >
              <MenuItem value="Main">Main Building</MenuItem>
              <MenuItem value="Science">Science Building</MenuItem>
              <MenuItem value="Engineering">Engineering Building</MenuItem>
              <MenuItem value="Library">Library Building</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Floor</InputLabel>
            <Select 
              value={newClassroom.floor} 
              onChange={(e) => setNewClassroom({...newClassroom, floor: e.target.value})} 
              label="Floor"
            >
              <MenuItem value="G">Ground Floor</MenuItem>
              <MenuItem value="1">1st Floor</MenuItem>
              <MenuItem value="2">2nd Floor</MenuItem>
              <MenuItem value="3">3rd Floor</MenuItem>
              <MenuItem value="4">4th Floor</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select 
              value={newClassroom.type} 
              onChange={(e) => setNewClassroom({...newClassroom, type: e.target.value})} 
              label="Type"
            >
              <MenuItem value="Lecture Hall">Lecture Hall</MenuItem>
              <MenuItem value="Computer Lab">Computer Lab</MenuItem>
              <MenuItem value="Science Lab">Science Lab</MenuItem>
              <MenuItem value="Auditorium">Auditorium</MenuItem>
              <MenuItem value="Seminar Room">Seminar Room</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleAdd}
          sx={{ bgcolor: colorScheme.primary }}
        >
          Add Classroom
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClassroomDialog;
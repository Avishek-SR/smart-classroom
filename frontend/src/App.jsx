import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminPortal from './pages/AdminPortal';
import FacultyPortal from './pages/FacultyPortal';
import StudentPortal from './pages/StudentPortal';
import { CircularProgress, Box } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to={`/${user.role}`} replace /> : <Login setUser={handleSetUser} />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            user && user.role === 'admin' ? 
            <AdminPortal user={user} setUser={handleSetUser} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/faculty" 
          element={
            user && user.role === 'faculty' ? 
            <FacultyPortal user={user} setUser={handleSetUser} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/student" 
          element={
            user && user.role === 'student' ? 
            <StudentPortal user={user} setUser={handleSetUser} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={
            user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
          } 
        />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
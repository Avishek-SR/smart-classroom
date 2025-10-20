import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  School,
  Schedule,
  People,
  Wifi,
  Speed,
  Warning
} from '@mui/icons-material';

const OverviewTab = ({ 
  systemStats = {}, 
  realtimeData = {}, 
  onStatClick, 
  onAddUser, 
  onGenerateTimetable, 
  colorScheme, 
  loading = false 
}) => {
  
  // Default stats data to prevent undefined errors
  const defaultStats = {
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalClassrooms: 0,
    averageAttendance: 0,
    systemUptime: '0%',
    activeSessions: 0
  };

  const stats = { ...defaultStats, ...systemStats };
  const realtime = { activeSessions: 0, serverLoad: 0, onlineUsers: 0, ...realtimeData };

  // Advanced Quick Stats Data
  const advancedStats = [
    { 
      icon: <People sx={{ fontSize: 40, mb: 1 }} />, 
      value: stats.totalStudents?.toString() || "0", 
      label: "Total Students",
      color: colorScheme.primary,
      change: "+0%",
      trend: "stable",
      description: "Active enrolled students"
    },
    { 
      icon: <People sx={{ fontSize: 40, mb: 1 }} />, 
      value: stats.totalFaculty?.toString() || "0", 
      label: "Faculty Members",
      color: colorScheme.info,
      change: "+0",
      trend: "stable",
      description: "Teaching staff"
    },
    { 
      icon: <School sx={{ fontSize: 40, mb: 1 }} />, 
      value: stats.totalCourses?.toString() || "0", 
      label: "Active Courses",
      color: colorScheme.success,
      change: "+0",
      trend: "stable",
      description: "This semester"
    },
    { 
      icon: <School sx={{ fontSize: 40, mb: 1 }} />, 
      value: stats.totalClassrooms?.toString() || "0", 
      label: "Classrooms",
      color: colorScheme.warning,
      change: "0%",
      trend: "stable",
      description: "Available rooms"
    },
    { 
      icon: <People sx={{ fontSize: 40, mb: 1 }} />, 
      value: `${stats.averageAttendance || 0}%`, 
      label: "Attendance",
      color: colorScheme.secondary,
      change: "+0%",
      trend: "stable",
      description: "Average weekly"
    },
    { 
      icon: <Speed sx={{ fontSize: 40, mb: 1 }} />, 
      value: stats.systemUptime || "0%", 
      label: "System Uptime",
      color: colorScheme.error,
      change: "+0%",
      trend: "stable",
      description: "Server availability"
    }
  ];

  const systemHealthStats = [
    {
      icon: <Wifi sx={{ fontSize: 30 }} />,
      label: "Server Uptime",
      value: stats.systemUptime || "0%",
      status: "healthy",
      color: colorScheme.success
    },
    {
      icon: <Speed sx={{ fontSize: 30 }} />,
      label: "Server Load",
      value: `${realtime.serverLoad}%`,
      status: realtime.serverLoad > 80 ? "warning" : "healthy",
      color: realtime.serverLoad > 80 ? colorScheme.warning : colorScheme.success,
      description: "Current load"
    },
    {
      icon: <People sx={{ fontSize: 30 }} />,
      label: "Active Sessions",
      value: realtime.activeSessions?.toString() || "0",
      status: "healthy",
      color: colorScheme.success
    },
    {
      icon: <People sx={{ fontSize: 30 }} />,
      label: "Online Users",
      value: realtime.onlineUsers?.toString() || "0",
      status: "healthy",
      color: colorScheme.success
    }
  ];

  // Default notifications and activities
  const notifications = [];
  const recentActivities = [];

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: colorScheme.primary }}>
          📊 System Overview Dashboard
        </Typography>
        <LinearProgress />
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: colorScheme.primary, fontWeight: 'bold' }}>
        📊 System Overview Dashboard
      </Typography>

      {/* Advanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {advancedStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: stat.color, 
                color: 'white', 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => onStatClick && onStatClick(stat)}
            >
              {stat.icon}
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                {stat.description}
              </Typography>
              {onStatClick && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Click for details →
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${colorScheme.primaryLight}` }}>
            <Typography variant="h6" gutterBottom sx={{ color: colorScheme.primary }}>
              🚀 Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Add />} 
                  onClick={onAddUser} 
                  sx={{ 
                    height: 80,
                    bgcolor: colorScheme.primary,
                    '&:hover': { bgcolor: colorScheme.primaryDark }
                  }}
                >
                  Add New User
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<School />} 
                  sx={{ 
                    height: 80,
                    bgcolor: colorScheme.info,
                    '&:hover': { bgcolor: '#0276aa' }
                  }}
                >
                  Manage Courses
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Schedule />} 
                  onClick={onGenerateTimetable} 
                  sx={{ 
                    height: 80,
                    bgcolor: colorScheme.success,
                    '&:hover': { bgcolor: '#1b5e20' }
                  }}
                >
                  Generate Timetable
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* System Health */}
          <Paper sx={{ p: 3, borderRadius: 2, mt: 3, border: `1px solid ${colorScheme.primaryLight}` }}>
            <Typography variant="h6" gutterBottom sx={{ color: colorScheme.primary }}>
              🏥 System Health Monitor
            </Typography>
            <Grid container spacing={2}>
              {systemHealthStats.map((stat, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    borderLeft: `4px solid ${stat.color}`
                  }}>
                    <Box sx={{ color: stat.color }}>
                      {stat.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {stat.label}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {stat.value} {stat.description && `• ${stat.description}`}
                      </Typography>
                    </Box>
                    <Chip 
                      label={stat.status} 
                      color={stat.status === 'healthy' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Notifications and Activities */}
        <Grid item xs={12} md={4}>
          {/* Real-time Stats */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3, border: `1px solid ${colorScheme.primaryLight}` }}>
            <Typography variant="h6" gutterBottom sx={{ color: colorScheme.primary }}>
              ⚡ Live Statistics
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <People sx={{ color: colorScheme.primary }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Active Sessions"
                  secondary={(realtime.activeSessions || 0) + " users"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Wifi sx={{ color: colorScheme.success }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Online Users"
                  secondary={(realtime.onlineUsers || 0) + " connected"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Speed sx={{ color: colorScheme.warning }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Server Load"
                  secondary={(realtime.serverLoad || 0) + "%"}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Notifications */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3, border: `1px solid ${colorScheme.primaryLight}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: colorScheme.primary }}>🔔 Notifications</Typography>
              <Chip label={notifications.filter(n => !n.read).length} color="error" size="small" />
            </Box>
            <List dense>
              {notifications.length > 0 ? (
                notifications.slice(0, 4).map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemIcon>
                      <Warning color={notification.type} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={notification.message}
                      secondary={notification.time}
                    />
                    {!notification.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />}
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No new notifications"
                    secondary="Everything is running smoothly"
                  />
                </ListItem>
              )}
            </List>
          </Paper>

          {/* Recent Activities */}
          <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${colorScheme.primaryLight}` }}>
            <Typography variant="h6" gutterBottom sx={{ color: colorScheme.primary }}>
              📈 Recent Activities
            </Typography>
            <List dense>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon sx={{ color: colorScheme.primary }}>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={activity.action}
                      secondary={`${activity.user} • ${activity.time}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No recent activities"
                    secondary="System activities will appear here"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewTab;
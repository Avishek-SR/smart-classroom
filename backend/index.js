const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.qsefb44.mongodb.net/smartclassroom?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  department: String,
  phone: String,
  semester: Number,
  status: { type: String, default: 'Active' },
  studentId: String,
  facultyId: String,
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  faculty: String,
  facultyId: String,
  enrolled: { type: Number, default: 0 },
  maxStudents: Number,
  department: String,
  semester: String,
  courseType: String,
  description: String
}, { timestamps: true });

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  facilities: [String],
  building: String,
  floor: String,
  type: String,
  status: { type: String, default: 'Available' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Classroom = mongoose.model('Classroom', classroomSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize admin user
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@college.edu' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin',
        department: 'Administration'
      });
      await adminUser.save();
      console.log('👤 Admin user created: admin@college.edu / admin123');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      }, 
      process.env.JWT_SECRET || 'fallback-secret-key', 
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status
    };

    res.json({ 
      success: true, 
      data: { 
        token, 
        user: userResponse
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Users API
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { name, email, password, role, department, phone, semester } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let userData = {
      name,
      email,
      password: hashedPassword,
      role,
      department,
      phone,
      semester
    };

    // Generate IDs based on role
    if (role === 'student') {
      const studentCount = await User.countDocuments({ role: 'student' });
      userData.studentId = `S${new Date().getFullYear()}${String(studentCount + 1).padStart(3, '0')}`;
    } else if (role === 'faculty') {
      const facultyCount = await User.countDocuments({ role: 'faculty' });
      userData.facultyId = `F${String(facultyCount + 1).padStart(3, '0')}`;
    }

    const user = new User(userData);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Courses API
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/courses', authenticateToken, async (req, res) => {
  try {
    const { code, name, credits, maxStudents, department, courseType, description } = req.body;

    if (!code || !name || !credits) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    const course = new Course({
      code,
      name,
      credits,
      maxStudents: maxStudents || 50,
      department: department || 'Computer Science',
      courseType: courseType || 'Theory',
      description: description || ''
    });

    await course.save();
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Course code already exists' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Classrooms API
app.get('/api/classrooms', authenticateToken, async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort({ createdAt: -1 });
    res.json({ success: true, data: classrooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/classrooms', authenticateToken, async (req, res) => {
  try {
    const { name, capacity, facilities, building, floor, type } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const classroom = new Classroom({
      name,
      capacity,
      facilities: facilities || [],
      building: building || 'Main',
      floor: floor || '1',
      type: type || 'Lecture Hall'
    });

    await classroom.save();
    res.status(201).json({ success: true, data: classroom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/classrooms/:id', authenticateToken, async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    res.json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// System Stats
app.get('/api/system/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalClassrooms,
      activeUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'student', status: 'Active' }),
      User.countDocuments({ role: 'faculty', status: 'Active' }),
      Course.countDocuments(),
      Classroom.countDocuments({ status: 'Available' }),
      User.countDocuments({ status: 'Active' })
    ]);

    const stats = {
      totalStudents,
      totalFaculty,
      totalCourses,
      totalClassrooms,
      activeUsers,
      systemUptime: '100%',
      serverLoad: '45%',
      responseTime: '120ms'
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Course-Faculty Mapping
app.post('/api/courses/map-faculty', authenticateToken, async (req, res) => {
  try {
    const { courseId, facultyId } = req.body;

    if (!courseId || !facultyId) {
      return res.status(400).json({ success: false, message: 'Course ID and Faculty ID required' });
    }

    const [course, faculty] = await Promise.all([
      Course.findById(courseId),
      User.findById(facultyId)
    ]);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    course.faculty = faculty.name;
    course.facultyId = faculty.facultyId || faculty._id.toString();
    await course.save();

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5001;

// Initialize admin and start server
initializeAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
});

module.exports = app;
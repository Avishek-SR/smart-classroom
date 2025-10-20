const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users
app.get('/api/users', (req, res) => {
    const query = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch users' 
            });
        }
        res.json({ 
            success: true, 
            users: results 
        });
    });
});

// Add new user
app.post('/api/users', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
        return res.status(400).json({ 
            success: false,
            error: 'All fields are required' 
        });
    }

    try {
        // Check if user already exists
        const checkQuery = "SELECT id FROM users WHERE email = ?";
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ 
                    success: false,
                    error: 'Database error' 
                });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'User with this email already exists' 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const insertQuery = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            db.query(insertQuery, [name, email, hashedPassword, role], (err, results) => {
                if (err) {
                    console.error('Error creating user:', err);
                    return res.status(500).json({ 
                        success: false,
                        error: 'Failed to create user' 
                    });
                }

                // Get the newly created user (without password)
                const selectQuery = "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
                db.query(selectQuery, [results.insertId], (err, userResults) => {
                    if (err) {
                        console.error('Error fetching new user:', err);
                        return res.status(500).json({ 
                            success: false,
                            error: 'User created but failed to fetch details' 
                        });
                    }

                    res.json({
                        success: true,
                        message: 'User created successfully',
                        user: userResults[0]
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// Update user
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ 
            success: false,
            error: 'All fields are required' 
        });
    }

    const query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
    db.query(query, [name, email, role, id], (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to update user' 
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'User updated successfully' 
        });
    });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM users WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to delete user' 
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
    });
});

// ==================== AUTHENTICATION ROUTES ====================

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ 
                success: false,
                error: 'Email, password and role are required' 
            });
        }

        // Find user in database
        const query = "SELECT * FROM users WHERE email = ? AND role = ?";
        db.query(query, [email, role], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false,
                    error: 'Server error' 
                });
            }

            if (results.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid credentials' 
                });
            }

            const user = results[0];

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid credentials' 
                });
            }

            // Return user data (without password)
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error during login' 
        });
    }
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
    // This is a simplified version - in real app, you'd verify JWT token
    res.json({
        user: {
            id: 1,
            name: "Admin User",
            email: "admin@school.com",
            role: "admin"
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false,
        error: 'Something went wrong!' 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
});
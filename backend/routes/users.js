const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, name, email, role, department,
        student_id as studentId,
        faculty_id as facultyId,
        admin_id as adminId,
        staff_id as staffId,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users 
      ORDER BY 
        FIELD(role, 'admin', 'hod', 'faculty', 'staff', 'student'),
        name
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add new user
router.post('/', async (req, res) => {
  try {
    const { name, email, role, department, studentId, facultyId, adminId, staffId, status } = req.body;
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (id, name, email, role, department, student_id, faculty_id, admin_id, staff_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [id, name, email, role, department, studentId, facultyId, adminId, staffId, status || 'Active'];
    
    const [result] = await pool.execute(query, values);
    res.json({ message: 'User added successfully', userId: id });
  } catch (error) {
    console.error('Error adding user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Update user status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, studentId, facultyId, adminId, staffId, status } = req.body;
    
    const query = `
      UPDATE users 
      SET name = ?, email = ?, role = ?, department = ?, 
          student_id = ?, faculty_id = ?, admin_id = ?, staff_id = ?, status = ?
      WHERE id = ?
    `;
    
    const values = [name, email, role, department, studentId, facultyId, adminId, staffId, status, id];
    
    const [result] = await pool.execute(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
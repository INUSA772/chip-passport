// backend/Server/controllers/authController.js
//
// Handles staff login, registration, and staff listing (admin only).
// Matches Process 1.0 "Authenticate staff" from our DFD Level 1.

const jwt = require('jsonwebtoken');
const StaffUser = require('../models/StaffUser');

async function register(req, res) {
  try {
    const { staffId, fullName, role, password } = req.body;

    const existing = await StaffUser.findOne({ staffId });
    if (existing) {
      return res.status(409).json({ message: 'Staff ID already registered.' });
    }

    const staffUser = await StaffUser.create({ staffId, fullName, role, password });

    return res.status(201).json({
      message: 'Staff account created.',
      staffId: staffUser.staffId,
      role: staffUser.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { staffId, password } = req.body;

    const staffUser = await StaffUser.findOne({ staffId });
    if (!staffUser) {
      return res.status(401).json({ message: 'Invalid staff ID or password.' });
    }

    const isMatch = await staffUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid staff ID or password.' });
    }

    const token = jwt.sign(
      { staffId: staffUser.staffId, role: staffUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      staffId: staffUser.staffId,
      fullName: staffUser.fullName,
      role: staffUser.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
}

/**
 * GET /api/auth/staff
 * Admin-only: lists all staff accounts. Excludes passwords —
 * never send hashed passwords to the frontend, even hashed ones.
 */
async function getAllStaff(req, res) {
  try {
    const staffList = await StaffUser.find().select('-password');
    return res.status(200).json({ staffList });
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ message: 'Failed to fetch staff list.', error: error.message });
  }
}

module.exports = { register, login, getAllStaff };
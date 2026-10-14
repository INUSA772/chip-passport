const jwt = require('jsonwebtoken');
const StaffUser = require('../models/StaffUser');
const { sendStaffCredentials } = require('../services/emailService');

async function register(req, res) {
  try {
    const { staffId, fullName, role, password, email } = req.body;

    if (!staffId || !fullName || !role || !password) {
      return res.status(400).json({ message: 'Staff ID, full name, role and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const allowedRoles = ['records_clerk', 'nurse', 'clinician', 'dentist', 'it_admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    const existing = await StaffUser.findOne({ staffId: staffId.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Staff ID already registered.' });
    }

    const staffUser = await StaffUser.create({
      staffId: staffId.trim(),
      fullName: fullName.trim(),
      role,
      password,
    });

    // Send credentials by email (only if an email was provided)
    let emailSent = false;
    let emailError = null;

    if (email && String(email).trim()) {
      try {
        await sendStaffCredentials({
          toEmail: String(email).trim(),
          fullName: staffUser.fullName,
          staffId: staffUser.staffId,
          password, // plain password, available only here before the response
          role: staffUser.role,
        });
        emailSent = true;
      } catch (err) {
        console.error('Email send failed:', err.message);
        emailError = err.message;
      }
    }

    return res.status(201).json({
      message: emailSent
        ? 'Staff account created and credentials sent by email.'
        : email
          ? 'Staff account created, but email could not be sent.'
          : 'Staff account created. No email was provided.',
      staffId: staffUser.staffId,
      fullName: staffUser.fullName,
      role: staffUser.role,
      emailSent,
      emailError,
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

async function getAllStaff(req, res) {
  try {
    const staffList = await StaffUser.find().select('-password');
    return res.status(200).json({ staffList });
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ message: 'Failed to fetch staff list.', error: error.message });
  }
}

// Self-service password reset (no admin needed)
async function resetPassword(req, res) {
  try {
    const { staffId, newPassword } = req.body;

    if (!staffId || !newPassword) {
      return res.status(400).json({ message: 'Staff ID and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const staffUser = await StaffUser.findOne({ staffId: String(staffId).trim() });
    if (!staffUser) {
      return res.status(404).json({ message: 'Staff ID not found.' });
    }

    staffUser.password = newPassword; // pre-save hook hashes it
    await staffUser.save();

    return res.status(200).json({ message: 'Password updated successfully. You can sign in now.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Password reset failed.', error: error.message });
  }
}

module.exports = { register, login, getAllStaff, resetPassword };
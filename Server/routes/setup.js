// Server/routes/setup.js
//
// First-run setup + safe "Reset for Demo" endpoint

const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const StaffUser = require('../models/StaffUser');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Per-IP limit: at most 5 setup attempts per 15 minutes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

// Global lockout for wrong setup keys
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_MS = 60 * 60 * 1000;
let failedAttempts = 0;
let lockedUntil = 0;

const keyMatches = (given = '', expected = '') => {
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
};

// --------------------------------------------------
// GET /api/setup/status
// --------------------------------------------------
router.get('/status', async (req, res) => {
  const count = await StaffUser.countDocuments();

  if (count === 0) {
    return res.json({ needsSetup: true });
  }

  const hospital = await Hospital.findOne();
  res.json({
    needsSetup: false,
    hospitalName: hospital?.name || '',
    contactEmail: hospital?.contactEmail || '',
    contactPhone: hospital?.contactPhone || '',
  });
});

// --------------------------------------------------
// POST /api/setup  (first-time setup)
// --------------------------------------------------
router.post('/', limiter, async (req, res) => {
  try {
    if (!process.env.SETUP_KEY) {
      return res.status(503).json({ message: 'Setup is not enabled' });
    }

    if ((await StaffUser.countDocuments()) > 0) {
      return res.status(403).json({ message: 'Setup already completed' });
    }

    if (lockedUntil && Date.now() >= lockedUntil) {
      lockedUntil = 0;
      failedAttempts = 0;
    }

    if (Date.now() < lockedUntil) {
      const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        message: `Setup is temporarily locked. Try again in ${minutes} minute(s).`,
      });
    }

    const {
      setupKey,
      hospitalName,
      fullName,
      staffId,
      password,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!keyMatches(setupKey, process.env.SETUP_KEY)) {
      failedAttempts += 1;

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = Date.now() + LOCKOUT_MS;
        failedAttempts = 0;
        return res.status(429).json({
          message: 'Too many wrong keys. Setup is locked for 60 minutes.',
        });
      }

      return res.status(401).json({ message: 'Invalid setup key' });
    }

    if (!hospitalName || !fullName || !staffId || !password || password.length < 8) {
      return res
        .status(400)
        .json({ message: 'All fields are required. Password must be at least 8 characters.' });
    }

    if (!contactEmail && !contactPhone) {
      return res
        .status(400)
        .json({ message: 'Provide a contact email or phone number for staff to reach the admin.' });
    }

    await Hospital.create({
      name: hospitalName,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
    });

    await StaffUser.create({
      staffId,
      fullName,
      role: 'it_admin',
      facility: hospitalName,
      password,
    });

    failedAttempts = 0;
    res.status(201).json({ message: 'Setup complete. You can now sign in.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(403).json({ message: 'Setup already completed' });
    }
    console.error(err);
    res.status(500).json({ message: 'Setup failed' });
  }
});

// --------------------------------------------------
// POST /api/setup/reset-demo
// Only IT Admin can call this.
// Clears all data so the Setup page appears again.
// Perfect for presentation / demo.
// --------------------------------------------------
router.post('/reset-demo', protect, restrictTo('it_admin'), async (req, res) => {
  try {
    const { confirm } = req.body;

    if (confirm !== 'RESET') {
      return res.status(400).json({
        message: 'You must type RESET to confirm.',
      });
    }

    // Delete everything
    await StaffUser.deleteMany({});
    await Hospital.deleteMany({});
    await Patient.deleteMany({});
    await Visit.deleteMany({});

    res.status(200).json({
      message: 'System has been reset. You can now open the Setup page.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Reset failed' });
  }
});

module.exports = router;
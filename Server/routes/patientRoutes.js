const express = require('express');
const router = express.Router();

const {
  scanCard,
  generateCard,
  registerPatient,
  linkRfid,
  lookupByRfid,
} = require('../controllers/patientController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

// Who can read a patient card (everyone except IT admin)
const canScan = ['records_clerk', 'nurse', 'clinician', 'dentist'];

// Registration desk only
const canRegister = ['records_clerk'];

// Scan a QR card
router.post('/scan', protect, restrictTo(...canScan), scanCard);

// Look up a patient by tapping an RFID card
router.post('/lookup-rfid', protect, restrictTo(...canScan), lookupByRfid);

// Register a new patient (records clerk only)
router.post('/register', protect, restrictTo(...canRegister), registerPatient);

// Issue or replace a card (records clerk only)
router.post('/generate-card', protect, restrictTo(...canRegister), generateCard);

// Link an RFID card to a patient (records clerk only)
router.post('/link-rfid', protect, restrictTo(...canRegister), linkRfid);

module.exports = router;
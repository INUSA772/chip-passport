
// Maps patient/card URLs to patientController functions.
// protect ensures only logged-in staff can scan or generate cards.

const express = require('express');
const router = express.Router();

const { scanCard, generateCard, registerPatient } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scan', protect, scanCard);
router.post('/generate-card', protect, generateCard);
router.post('/register', protect, registerPatient);

module.exports = router;
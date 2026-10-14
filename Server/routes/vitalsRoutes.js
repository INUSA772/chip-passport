const express = require('express');
const router = express.Router();

const {
  recordVitals,
  getVitalsHistory,
  getMyTriageToday,
  getWaitingQueue,
} = require('../controllers/vitalsController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/record', protect, restrictTo('nurse'), recordVitals);

router.get('/my-triage-today', protect, restrictTo('nurse'), getMyTriageToday);

router.get('/waiting-queue', protect, restrictTo('clinician', 'dentist'), getWaitingQueue);

router.get(
  '/history/:nationalId',
  protect,
  restrictTo('nurse', 'clinician', 'dentist'),
  getVitalsHistory
);

module.exports = router;
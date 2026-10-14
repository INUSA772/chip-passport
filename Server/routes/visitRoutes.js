const express = require('express');
const router = express.Router();

const { recordVisit, getVisitHistory, getAuditLog } = require('../controllers/visitController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const canRecordVisit = ['clinician', 'dentist'];

const canViewHistory = ['nurse', 'clinician', 'dentist'];

router.post('/record', protect, restrictTo(...canRecordVisit), recordVisit);

router.get('/history/:nationalId', protect, restrictTo(...canViewHistory), getVisitHistory);

router.get('/audit-log', protect, restrictTo('it_admin'), getAuditLog);

module.exports = router;
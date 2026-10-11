// backend/Server/routes/visitRoutes.js
//
// Maps visit URLs to visitController functions.
// protect ensures only logged-in staff can access these; the
// audit log is further restricted to IT admins only.

const express = require('express');
const router = express.Router();

const { recordVisit, getVisitHistory, getAuditLog } = require('../controllers/visitController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/record', protect, recordVisit);
router.get('/history/:nationalId', protect, getVisitHistory);
router.get('/audit-log', protect, restrictTo('it_admin'), getAuditLog);

module.exports = router;
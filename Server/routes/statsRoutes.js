// backend/Server/routes/statsRoutes.js
//
// Admin-only route for dashboard analytics.

const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/statsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, restrictTo('it_admin'), getStats);

module.exports = router;
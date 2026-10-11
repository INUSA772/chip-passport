// backend/Server/routes/authRoutes.js
//
// Maps auth URLs to authController functions.
// Registration and staff listing are restricted to logged-in IT
// admins only — login stays open to everyone.

const express = require('express');
const router = express.Router();

const { register, login, getAllStaff } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', protect, restrictTo('it_admin'), register);
router.post('/login', login);
router.get('/staff', protect, restrictTo('it_admin'), getAllStaff);

module.exports = router;
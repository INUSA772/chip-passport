const express = require('express');
const router = express.Router();

const { register, login, getAllStaff, resetPassword } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', protect, restrictTo('it_admin'), register);
router.post('/login', login);
router.post('/reset-password', resetPassword); // public — staff resets own password
router.get('/staff', protect, restrictTo('it_admin'), getAllStaff);

module.exports = router;
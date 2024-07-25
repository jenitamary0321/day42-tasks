// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, verifyEmail } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;

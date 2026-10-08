const express = require('express');
const router = express.Router();
const { register, login, requestPasswordReset, resetPassword, getMe } = require('../controllers/Authcontroller');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset
} = require('../middleware/validator');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, validatePasswordResetRequest, requestPasswordReset);
router.post('/reset-password', authLimiter, validatePasswordReset, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/Authcontroller');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validator');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);

// Password Reset Routes
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// Link GitHub account to existing user (manual link only, no OAuth)
router.post('/github/link', protect, async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername || !githubUsername.trim()) {
      return res.status(400).json({ message: 'GitHub username is required' });
    }

    const cleanUsername = githubUsername.trim().replace(/^@/, '');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store GitHub username and public links
    user.github = user.github || {};
    user.github.username = cleanUsername;
    user.github.profileUrl = `https://github.com/${cleanUsername}`;
    if (!user.github.avatarUrl) {
      user.github.avatarUrl = `https://github.com/${cleanUsername}.png`;
    }
    await user.save();

    res.json({
      message: 'GitHub account linked successfully',
      github: {
        username: user.github.username,
        profileUrl: user.github.profileUrl,
        avatarUrl: user.github.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to link GitHub account', error: error.message });
  }
});

// Unlink GitHub account
router.post('/github/unlink', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.github = undefined;
    await user.save();

    res.json({ message: 'GitHub account unlinked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink GitHub account', error: error.message });
  }
});

module.exports = router;
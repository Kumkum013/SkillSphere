const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const PASSWORD_RESET_RESPONSE = {
  message: 'If an account exists for that email, password reset instructions will be sent.'
};

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findUserByEmail = (email) => User.findOne({
  email: { $regex: `^\\s*${escapeRegex(email)}\\s*$`, $options: 'i' }
});

const register = async (req, res) => {
  try {
    const { name, email, password, role, branch, year } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      branch,
      year
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json(PASSWORD_RESET_RESPONSE);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('token', resetToken);
    const delivery = await sendPasswordResetEmail({ recipient: user, resetUrl: resetUrl.toString() });
    if (!delivery.sent) {
      await User.updateOne(
        { _id: user._id, passwordResetTokenHash: user.passwordResetTokenHash },
        { $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 } }
      );
      console.error('Password reset email was not delivered:', delivery.reason || delivery.error || 'SMTP delivery failed');
    }

    return res.status(200).json(PASSWORD_RESET_RESPONSE);
  } catch (err) {
    console.error('Password reset request failed:', err.message);
    return res.status(500).json({ message: 'Could not process password reset request. Please try again later.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() }
      },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'This password reset link is invalid or expired. Request a new one.' });
    }

    return res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('Password reset failed:', err.message);
    return res.status(500).json({ message: 'Could not reset password. Please request a new link.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

module.exports = { register, login, requestPasswordReset, resetPassword, getMe };
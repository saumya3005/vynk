const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Password strength validator
function validatePassword(password) {
  const rules = [];
  if (password.length < 8) rules.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) rules.push('an uppercase letter');
  if (!/[a-z]/.test(password)) rules.push('a lowercase letter');
  if (!/[0-9]/.test(password)) rules.push('a number');
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) rules.push('a special character');
  return rules;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    // Password strength validation
    const passwordIssues = validatePassword(password);
    if (passwordIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Password must contain ${passwordIssues.join(', ')}`
      });
    }

    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ success: false, message: 'Username is already taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Student'
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      token,
      user: { _id: user.id, id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // 2FA check
    if (user.twoFactorEnabled) {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
      user.twoFactorExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
      console.log(`[2FA] Code for ${user.email}: ${code}`);

      return res.json({
        success: true,
        requires2FA: true,
        userId: user.id,
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined
      });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: { _id: user.id, id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ success: false, message: 'User ID and code are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (user.twoFactorCode !== hashedCode || user.twoFactorExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Clear 2FA code
    user.twoFactorCode = undefined;
    user.twoFactorExpire = undefined;
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: { _id: user.id, id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    console.error('2FA verify error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send 2FA code (for re-send)
router.post('/send-2fa', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
    user.twoFactorExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log(`[2FA] Resend code for ${user.email}: ${code}`);

    res.json({
      success: true,
      message: 'Verification code sent',
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change Password (authenticated)
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    const passwordIssues = validatePassword(newPassword);
    if (passwordIssues.length > 0) {
      return res.status(400).json({ success: false, message: `Password must contain ${passwordIssues.join(', ')}` });
    }
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been generated.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Use CLIENT_URL env var for production reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    res.json({
      success: true,
      message: 'If this email exists, a reset link has been generated.',
      resetUrl
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

    const passwordIssues = validatePassword(password);
    if (passwordIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Password must contain ${passwordIssues.join(', ')}`
      });
    }

    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match' });

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

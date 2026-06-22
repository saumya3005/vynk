const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Provide defaults if settings don't exist yet
    const settings = user.settings || {
      theme: 'dark',
      accentColor: '#FF5F45',
      reduceMotion: false,
      notifications: {
        likes: true, comments: true, follows: true, messages: true, email: true, push: true
      },
      privacy: {
        isPrivate: false, showActivityStatus: true, allowMessagesFrom: 'everyone'
      }
    };
    
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update basic settings
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.settings) user.settings = {};
    
    // Deep merge settings
    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();
    
    res.json(user.settings);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update privacy settings
router.put('/privacy', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.settings) user.settings = {};
    if (!user.settings.privacy) user.settings.privacy = {};
    
    user.settings.privacy = { ...user.settings.privacy, ...req.body };
    
    // Also sync with root user properties for legacy compatibility
    if (req.body.isPrivate !== undefined) {
      user.profileVisibility = req.body.isPrivate ? 'private' : 'public';
    }
    if (req.body.allowMessagesFrom !== undefined) {
      user.allowMessagesFrom = req.body.allowMessagesFrom;
    }
    
    await user.save();
    res.json(user.settings.privacy);
  } catch (err) {
    console.error('Update privacy settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notifications settings
router.put('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.settings) user.settings = {};
    if (!user.settings.notifications) user.settings.notifications = {};
    
    user.settings.notifications = { ...user.settings.notifications, ...req.body };
    await user.save();
    
    res.json(user.settings.notifications);
  } catch (err) {
    console.error('Update notifications settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appearance settings
router.put('/appearance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.settings) user.settings = {};
    
    if (req.body.theme !== undefined) user.settings.theme = req.body.theme;
    if (req.body.accentColor !== undefined) user.settings.accentColor = req.body.accentColor;
    if (req.body.reduceMotion !== undefined) user.settings.reduceMotion = req.body.reduceMotion;
    
    await user.save();
    
    res.json({
      theme: user.settings.theme,
      accentColor: user.settings.accentColor,
      reduceMotion: user.settings.reduceMotion
    });
  } catch (err) {
    console.error('Update appearance settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update security settings (e.g. 2FA)
router.put('/security', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (req.body.twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = req.body.twoFactorEnabled;
    }
    
    await user.save();
    
    res.json({
      twoFactorEnabled: user.twoFactorEnabled
    });
  } catch (err) {
    console.error('Update security settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json([]);

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { skills: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    }).select('username avatar role location skills profileVisibility').limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get suggested users (not already following)
router.get('/suggestions', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('following');
    const exclude = [...(me.following || []).map(id => id.toString()), req.user.id];

    const users = await User.find({
      _id: { $nin: exclude },
      profileVisibility: 'public'
    }).select('username avatar role location skills').limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get user followers list
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get user following list
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username avatar role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get user profile by ID (respects privacy)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // If private, only show limited info to non-followers
    if (user.profileVisibility === 'private') {
      const isFollower = user.followers.some(f => f.toString() === req.user.id);
      const isOwner = user._id.toString() === req.user.id;
      if (!isOwner && !isFollower) {
        return res.json({
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          profileVisibility: 'private',
          followersCount: user.followers.length,
          followingCount: user.following.length,
          isPrivate: true
        });
      }
    }

    res.json(user);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Follow / Unfollow user (toggle)
router.put('/:id/follow', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUser.following.map(id => id.toString()).includes(req.params.id);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
    } else {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);
      
      const Notification = require('../models/Notification');
      await Notification.create({
        user: req.params.id,
        type: 'follow',
        message: `${currentUser.username} started following you.`,
        link: `/profile/${currentUser._id}`
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ following: currentUser.following, isFollowing: !isFollowing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, location, role, skills, github, linkedin, portfolio, resume, avatar, coverImage } = req.body;

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (role) user.role = role;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (resume !== undefined) user.resume = resume;
    if (avatar !== undefined) user.avatar = avatar;
    if (coverImage !== undefined) user.coverImage = coverImage;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Update Avatar (JSON base64)
router.put('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.avatar) user.avatar = req.body.avatar;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Update Privacy Settings
router.put('/privacy', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.profileVisibility) user.profileVisibility = req.body.profileVisibility;
    if (req.body.allowMessagesFrom) user.allowMessagesFrom = req.body.allowMessagesFrom;
    if (typeof req.body.twoFactorEnabled === 'boolean') user.twoFactorEnabled = req.body.twoFactorEnabled;

    await user.save();
    res.json({ success: true, profileVisibility: user.profileVisibility, allowMessagesFrom: user.allowMessagesFrom, twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Change Password
router.put('/change-password', auth, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

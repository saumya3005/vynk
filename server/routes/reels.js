const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const auth = require('../middleware/auth');

// Create reel
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.videoUrl) {
      return res.status(400).json({ success: false, message: 'videoUrl is required' });
    }
    const newReel = new Reel({
      videoUrl: req.body.videoUrl,
      caption: req.body.caption || '',
      audioTitle: req.body.audioTitle || '',
      audioUrl: req.body.audioUrl || '',
      musicName: req.body.musicName || '',
      musicArtist: req.body.musicArtist || '',
      filter: req.body.filter || 'Original',
      trimStart: req.body.trimStart || 0,
      trimEnd: req.body.trimEnd || 15,
      thumbnail: req.body.thumbnail || '',
      author: req.user.id
    });
    const savedReel = await newReel.save();
    const populated = await savedReel.populate('author', 'username avatar');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create reel error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get all reels
router.get('/', auth, async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get reel by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });
    res.json(reel);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Like/Unlike reel
router.put('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

    const index = reel.likes.map(id => id.toString()).indexOf(req.user.id);
    if (index === -1) {
      reel.likes.push(req.user.id);
      
      if (reel.author.toString() !== req.user.id) {
        const Notification = require('../models/Notification');
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        await Notification.create({
          user: reel.author,
          type: 'like',
          message: `${user.username} liked your reel.`,
          link: `/reels`
        });
      }
    } else {
      reel.likes.splice(index, 1);
    }
    await reel.save();
    res.json(reel.likes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Save/Unsave reel
router.put('/:id/save', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

    const index = reel.saves.map(id => id.toString()).indexOf(req.user.id);
    if (index === -1) {
      reel.saves.push(req.user.id);
    } else {
      reel.saves.splice(index, 1);
    }
    await reel.save();
    res.json(reel.saves);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

    reel.comments.push({ author: req.user.id, text: req.body.text });
    await reel.save();

    if (reel.author.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      await Notification.create({
        user: reel.author,
        type: 'comment',
        message: `${user.username} commented on your reel.`,
        link: `/reels`
      });
    }

    const populated = await Reel.findById(req.params.id).populate('comments.author', 'username avatar');
    res.json(populated.comments);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Share reel
router.post('/:id/share', auth, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });
    res.json({ shares: reel.shares });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// View reel
router.post('/:id/view', auth, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json(reel?.views || 0);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Delete reel
router.delete('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });
    if (reel.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    await reel.deleteOne();
    res.json({ success: true, message: 'Reel deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

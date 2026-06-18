const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Create reel
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.videoUrl) {
      return res.status(400).json({ success: false, message: 'videoUrl is required' });
    }
    const newReel = new Reel({
      videoUrl: req.body.videoUrl,
      caption: req.body.caption || '',
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike reel
router.put('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const index = reel.likes.indexOf(req.user.id);
    if (index === -1) {
      reel.likes.push(req.user.id);
    } else {
      reel.likes.splice(index, 1);
    }
    
    await reel.save();
    res.json(reel.likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave reel
router.put('/:id/save', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const index = reel.saves.indexOf(req.user.id);
    if (index === -1) {
      reel.saves.push(req.user.id);
    } else {
      reel.saves.splice(index, 1);
    }
    
    await reel.save();
    res.json(reel.saves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const newComment = {
      author: req.user.id,
      text: req.body.text
    };

    reel.comments.push(newComment);
    await reel.save();

    const populatedReel = await Reel.findById(req.params.id)
      .populate('comments.author', 'username avatar');
      
    res.json(populatedReel.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    res.json({ views: reel.views });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reel
router.delete('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    if (reel.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (reel.publicId) {
      await cloudinary.uploader.destroy(reel.publicId, { resource_type: 'video' });
    }
    if (reel.thumbnailPublicId) {
      await cloudinary.uploader.destroy(reel.thumbnailPublicId, { resource_type: 'image' });
    }

    await reel.deleteOne();
    res.json({ message: 'Reel removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

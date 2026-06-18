const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Create story
router.post('/', auth, async (req, res) => {
  try {
    console.log('story body keys:', Object.keys(req.body));
    console.log('auth user:', req.user);

    if (!req.body.mediaUrl) {
      return res.status(400).json({ success: false, message: 'mediaUrl is required' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newStory = new Story({
      mediaUrl: req.body.mediaUrl,
      mediaType: req.body.mediaType || 'image',
      caption: req.body.caption || '',
      author: req.user.id,
      expiresAt
    });

    const savedStory = await newStory.save();
    const populated = await savedStory.populate('author', 'username avatar');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create story error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get all stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// View story
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!story.viewers.includes(req.user.id)) {
      story.viewers.push(req.user.id);
      await story.save();
    }
    res.json(story.viewers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (story.publicId) {
      // For video, we might need resource_type: 'video', but cloudinary destroy tries image first
      // Let's explicitly check mediaType
      await cloudinary.uploader.destroy(story.publicId, { resource_type: story.mediaType === 'video' ? 'video' : 'image' });
    }

    await story.deleteOne();
    res.json({ message: 'Story removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

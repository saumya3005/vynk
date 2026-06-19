const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// Create story
router.post('/', auth, async (req, res) => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const {
      mediaUrl,
      mediaType,
      caption,
      background,
      textOverlays,
      stickers,
      musicName,
      musicArtist,
      musicUrl,
      privacy
    } = req.body;

    const newStory = new Story({
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'image',
      caption: caption || '',
      background: background || 'linear-gradient(to right, #FF5A3D, #7C3AED)',
      textOverlays: textOverlays || [],
      stickers: stickers || [],
      musicName: musicName || '',
      musicArtist: musicArtist || '',
      musicUrl: musicUrl || '',
      privacy: privacy || 'Everyone',
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

// Get all stories (filter based on privacy later if needed)
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

// Like story
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.likes.includes(req.user.id)) {
      story.likes = story.likes.filter(id => id.toString() !== req.user.id);
    } else {
      story.likes.push(req.user.id);
    }
    await story.save();
    res.json(story.likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to story
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    story.replies.push({
      user: req.user.id,
      message: req.body.message
    });
    
    await story.save();
    
    // In a real app, you'd also create a Message or Notification here
    
    res.json(story.replies);
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
      await cloudinary.uploader.destroy(story.publicId, { resource_type: story.mediaType === 'video' ? 'video' : 'image' });
    }

    await story.deleteOne();
    res.json({ message: 'Story removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

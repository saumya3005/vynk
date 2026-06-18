const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const auth = require('../middleware/auth');

// Get all reels
router.get('/', auth, async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('author', 'username avatar role')
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a reel
router.post('/', auth, async (req, res) => {
  try {
    const newReel = new Reel({
      ...req.body,
      author: req.user.id
    });
    const savedReel = await newReel.save();
    res.status(201).json(savedReel);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Like/Unlike a reel
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
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

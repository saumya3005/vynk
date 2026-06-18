const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiverId: req.params.userId },
        { sender: req.params.userId, receiverId: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const newMessage = new Message({
      ...req.body,
      mediaUrl: req.file ? req.file.path : req.body.mediaUrl,
      publicId: req.file ? req.file.filename : req.body.publicId,
      mediaType: req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : req.body.mediaType,
      sender: req.user.id
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as seen
router.put('/:id/seen', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    if (message.receiverId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    message.seen = true;
    await message.save();
    
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users we have chatted with
router.get('/users/active', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiverId: req.user.id }]
    }).populate('sender', 'username avatar role isOnline').populate('receiverId', 'username avatar role isOnline');

    const usersMap = new Map();
    messages.forEach(m => {
      const otherUser = m.sender._id.toString() === req.user.id ? m.receiverId : m.sender;
      if (otherUser && !usersMap.has(otherUser._id.toString())) {
        usersMap.set(otherUser._id.toString(), otherUser);
      }
    });

    res.json(Array.from(usersMap.values()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get users we have chatted with + all users for search
router.get('/users/active', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiverId: req.user.id }]
    }).sort({ createdAt: -1 });

    const usersMap = new Map();
    messages.forEach(m => {
      const otherId = m.sender.toString() === req.user.id ? m.receiverId.toString() : m.sender.toString();
      if (!usersMap.has(otherId)) {
        usersMap.set(otherId, { lastMessage: m });
      }
    });

    const userIds = Array.from(usersMap.keys());
    const users = await User.find({ _id: { $in: userIds } }).select('username avatar role');

    const result = users.map(u => ({
      ...u.toObject(),
      lastMessage: usersMap.get(u._id.toString())?.lastMessage
    }));

    // Sort by last message time
    result.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

    res.json(result);
  } catch (err) {
    console.error('Get active users error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Search all users
router.get('/users/search', auth, async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await User.find({
      _id: { $ne: req.user.id },
      username: { $regex: query, $options: 'i' }
    }).select('username avatar role').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiverId: req.params.userId },
        { sender: req.params.userId, receiverId: req.user.id }
      ]
    })
    .populate('replyTo', 'text sender')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.receiverId) {
      return res.status(400).json({ success: false, message: 'receiverId is required' });
    }
    if (!req.body.text && !req.body.mediaUrl && !req.body.sticker) {
      return res.status(400).json({ success: false, message: 'Message must have text, media, or sticker' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiverId: req.body.receiverId,
      text: req.body.text || '',
      mediaUrl: req.body.mediaUrl || '',
      mediaType: req.body.mediaType || 'text',
      fileName: req.body.fileName || '',
      fileSize: req.body.fileSize || 0,
      sticker: req.body.sticker || '',
      replyTo: req.body.replyTo || null,
      delivered: true
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Mark message as seen
router.put('/:id/seen', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    
    message.seen = true;
    await message.save();
    
    res.json(message);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Add reaction to message
router.put('/:id/reaction', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(r => r.user.toString() !== req.user.id);
    
    // Add new reaction if emoji provided
    if (req.body.emoji) {
      message.reactions.push({ user: req.user.id, emoji: req.body.emoji });
    }
    
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    
    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

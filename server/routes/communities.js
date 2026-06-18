const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Get all communities
router.get('/', auth, async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'username avatar role')
      .populate('admins', 'username avatar role')
      .sort({ createdAt: -1 });
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get community by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members', 'username avatar role')
      .populate('admins', 'username avatar role')
      .populate('posts.author', 'username avatar role')
      .populate('posts.comments.author', 'username avatar');
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create community
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }
    const newCommunity = new Community({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category || 'General',
      banner: req.body.banner || '',
      admins: [req.user.id],
      members: [req.user.id]
    });
    const savedCommunity = await newCommunity.save();
    res.status(201).json(savedCommunity);
  } catch (err) {
    console.error('Create community error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Join community
router.put('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    if (!community.members.includes(req.user.id)) {
      community.members.push(req.user.id);
      await community.save();
    }
    
    res.json(community.members);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave community
router.put('/:id/leave', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    community.members = community.members.filter(id => id.toString() !== req.user.id);
    await community.save();
    
    res.json(community.members);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add post
router.post('/:id/posts', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const newPost = {
      author: req.user.id,
      content: req.body.content
    };

    community.posts.push(newPost);
    await community.save();

    const populatedCommunity = await Community.findById(req.params.id)
      .populate('posts.author', 'username avatar');

    res.json(populatedCommunity.posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like post
router.put('/:communityId/posts/:postId/like', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const post = community.posts.id(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }

    await community.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on post
router.post('/:communityId/posts/:postId/comment', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const post = community.posts.id(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      author: req.user.id,
      text: req.body.text
    });

    await community.save();
    
    const populatedCommunity = await Community.findById(req.params.communityId)
      .populate('posts.comments.author', 'username avatar');
      
    res.json(populatedCommunity.posts.id(req.params.postId).comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

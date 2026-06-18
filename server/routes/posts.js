const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Create post
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.content && !req.body.mediaUrl) {
      return res.status(400).json({ success: false, message: 'Post must have content or media' });
    }
    const newPost = new Post({
      content: req.body.content || '',
      mediaUrl: req.body.mediaUrl || '',
      mediaType: req.body.mediaType || 'text',
      category: req.body.category || 'General',
      tags: req.body.tags || [],
      author: req.user.id
    });
    const savedPost = await newPost.save();
    const populated = await savedPost.populate('author', 'username avatar role');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar role')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar role')
      .populate('comments.author', 'username avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }
    
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave post
router.put('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.saves.indexOf(req.user.id);
    if (index === -1) {
      post.saves.push(req.user.id);
    } else {
      post.saves.splice(index, 1);
    }
    
    await post.save();
    res.json(post.saves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      author: req.user.id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'username avatar');
      
    res.json(populatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (post.publicId) {
      await cloudinary.uploader.destroy(post.publicId, { resource_type: post.mediaType === 'video' ? 'video' : 'image' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.find(c => c.id === req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    post.comments = post.comments.filter(c => c.id !== req.params.commentId);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

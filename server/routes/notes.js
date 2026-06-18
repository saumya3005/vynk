const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploader', 'username avatar role')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get note by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploader', 'username avatar role')
      .populate('reviews.user', 'username avatar');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload note
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const newNote = new Note({
      title: req.body.title,
      description: req.body.description || '',
      subject: req.body.subject || '',
      semester: req.body.semester || '',
      branch: req.body.branch || '',
      college: req.body.college || '',
      difficulty: req.body.difficulty || 'Beginner',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fileUrl: req.body.fileUrl || '',
      fileName: req.body.fileName || '',
      fileType: req.body.fileType || '',
      uploader: req.user.id
    });
    const savedNote = await newNote.save();
    const populated = await savedNote.populate('uploader', 'username avatar role');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Upload note error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Save/Bookmark note
router.put('/:id/save', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (note.saves.includes(req.user.id)) {
      note.saves = note.saves.filter(id => id.toString() !== req.user.id);
    } else {
      note.saves.push(req.user.id);
    }
    
    await note.save();
    res.json(note.saves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download note (increment downloads count)
router.put('/:id/download', auth, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json(note.downloads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Review note
router.post('/:id/review', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const newReview = {
      user: req.user.id,
      rating: req.body.rating,
      text: req.body.text
    };

    note.reviews.push(newReview);
    await note.save();

    const populatedNote = await Note.findById(req.params.id)
      .populate('reviews.user', 'username avatar');
      
    res.json(populatedNote.reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.uploader.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (note.publicId) {
      // Notes are stored as raw if they are documents, but if they are images, they are image.
      // the middleware set resource_type to raw if pdf/doc.
      const resource_type = (note.fileType === 'application/pdf' || (note.fileType && note.fileType.includes('document'))) ? 'raw' : 'image';
      await cloudinary.uploader.destroy(note.publicId, { resource_type });
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'username avatar role')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username avatar role')
      .populate('comments.author', 'username avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    const newProject = new Project({
      title: req.body.title,
      description: req.body.description,
      problemStatement: req.body.problemStatement || '',
      solution: req.body.solution || '',
      techStack: Array.isArray(req.body.techStack) ? req.body.techStack : [],
      githubLink: req.body.githubLink || '',
      demoLink: req.body.demoLink || '',
      category: req.body.category || 'Web App',
      collaborationOpen: req.body.collaborationOpen || false,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      owner: req.user.id
    });
    const savedProject = await newProject.save();
    const populated = await savedProject.populate('owner', 'username avatar role');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create project error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Like project
router.put('/:id/like', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.likes.includes(req.user.id)) {
      project.likes = project.likes.filter(id => id.toString() !== req.user.id);
    } else {
      project.likes.push(req.user.id);
    }
    
    await project.save();
    res.json(project.likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save project
router.put('/:id/save', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.saves.includes(req.user.id)) {
      project.saves = project.saves.filter(id => id.toString() !== req.user.id);
    } else {
      project.saves.push(req.user.id);
    }
    
    await project.save();
    res.json(project.saves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request collaboration
router.post('/:id/collaborate', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (!project.collaborationRequests.includes(req.user.id)) {
      project.collaborationRequests.push(req.user.id);
      await project.save();
    }
    
    res.json(project.collaborationRequests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newComment = {
      author: req.user.id,
      text: req.body.text
    };

    project.comments.push(newComment);
    await project.save();
    
    const populatedProject = await Project.findById(req.params.id)
      .populate('comments.author', 'username avatar');
      
    res.json(populatedProject.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// View project (increment view count)
router.post('/:id/view', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json(project.views);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (project.publicIds && project.publicIds.length > 0) {
      for (const pid of project.publicIds) {
        await cloudinary.uploader.destroy(pid);
      }
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

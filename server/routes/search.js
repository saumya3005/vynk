const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Note = require('../models/Note');
const Community = require('../models/Community');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json({ users: [], projects: [], notes: [], communities: [] });

    const regex = new RegExp(q, 'i');

    const [users, projects, notes, communities] = await Promise.all([
      User.find({
        _id: { $ne: req.user.id },
        $or: [
          { username: regex },
          { role: regex },
          { skills: { $elemMatch: { $regex: regex } } }
        ]
      }).select('username avatar role').limit(5),
      
      Project.find({
        $or: [
          { title: regex },
          { techStack: { $elemMatch: { $regex: regex } } }
        ]
      }).select('title techStack').limit(5),

      Note.find({
        $or: [
          { title: regex },
          { subject: regex },
          { tags: { $elemMatch: { $regex: regex } } }
        ]
      }).select('title subject').limit(5),

      Community.find({
        name: regex
      }).select('name banner').limit(5)
    ]);

    res.json({ users, projects, notes, communities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.get('/trending', auth, async (req, res) => {
  try {
    const [users, projects, notes, communities] = await Promise.all([
      User.find({ profileVisibility: 'public' })
        .sort({ followers: -1 })
        .limit(10)
        .select('username avatar role skills'),
        
      Project.find()
        .sort({ views: -1, 'upvotes': -1 })
        .limit(10)
        .select('title techStack views owner'),
        
      Note.find()
        .sort({ downloads: -1 })
        .limit(10)
        .select('title subject downloads uploader'),
        
      Community.find()
        .sort({ members: -1 })
        .limit(10)
        .select('name banner membersCount')
    ]);

    res.json({ users, projects, notes, communities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

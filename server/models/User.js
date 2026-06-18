const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Student', 'Developer', 'Recruiter', 'Teacher', 'Creator', 'Professional'],
    default: 'Student'
  },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  education: [{
    institution: String,
    degree: String,
    startYear: String,
    endYear: String
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  location: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  resume: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

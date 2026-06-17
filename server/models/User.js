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
  profilePicture: { type: String, default: '' },
  coverBanner: { type: String, default: '' },
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
  githubLink: { type: String, default: '' },
  linkedinLink: { type: String, default: '' },
  points: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

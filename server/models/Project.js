const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  problemStatement: { type: String },
  solution: { type: String },
  techStack: [{ type: String }],
  githubLink: { type: String },
  demoLink: { type: String },
  images: [{ type: String }],
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  collaborationOpen: { type: Boolean, default: false },
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

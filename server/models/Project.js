const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

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
  publicIds: [{ type: String }],
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  collaborationOpen: { type: Boolean, default: false },
  collaborationRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

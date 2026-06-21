const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'text', 'none', 'poll', 'code', 'carousel'], default: 'text' },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares: { type: Number, default: 0 },
  
  // Interactive additions
  postType: { type: String, enum: ['text', 'image', 'video', 'poll', 'code', 'carousel'], default: 'text' },
  pollOptions: [{
    optionText: { type: String },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  codeBlock: {
    code: { type: String },
    language: { type: String }
  },
  carouselMedia: [{
    url: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

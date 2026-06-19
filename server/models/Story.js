const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'text'], default: 'image' },
  caption: { type: String, default: '' },
  
  // Instagram-like features
  background: { type: String, default: 'linear-gradient(to right, #FF5A3D, #7C3AED)' },
  textOverlays: [{
    text: String,
    x: Number,
    y: Number,
    fontSize: Number,
    color: String,
    fontFamily: String
  }],
  stickers: [{
    url: String,
    x: Number,
    y: Number,
    scale: Number,
    rotation: Number
  }],
  musicName: { type: String, default: '' },
  musicArtist: { type: String, default: '' },
  musicUrl: { type: String, default: '' },
  privacy: { type: String, enum: ['Everyone', 'Followers', 'Close Friends'], default: 'Everyone' },
  
  // Interactions
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index to automatically delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);

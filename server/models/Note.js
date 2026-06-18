const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const noteSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  semester: { type: String },
  branch: { type: String },
  college: { type: String },
  fileUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  fileName: { type: String },
  fileType: { type: String },
  tags: [{ type: String }],
  difficulty: { type: String },
  downloads: { type: Number, default: 0 },
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);

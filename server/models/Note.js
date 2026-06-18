const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  semester: { type: String },
  branch: { type: String },
  college: { type: String },
  fileUrl: { type: String, required: true },
  tags: [{ type: String }],
  downloads: { type: Number, default: 0 },
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);

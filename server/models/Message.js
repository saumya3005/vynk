const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, enum: ['text', 'image', 'video', 'file', 'sticker', 'emoji', 'audio'], default: 'text' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  sticker: { type: String, default: '' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  reactions: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    emoji: { type: String } 
  }],
  seen: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

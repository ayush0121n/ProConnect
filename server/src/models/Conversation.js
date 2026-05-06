const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage:  { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isGroup:      { type: Boolean, default: false },
  groupName:    String,
  groupAvatar:  { url: String, publicId: String }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:  { type: String, required: true, trim: true, maxlength: 2000 },

  attachments: [{
    type:      { type: String, enum: ['image', 'video', 'document'], required: true },
    url:       { type: String, required: true },
    publicId:  String,
    filename:  String,
    size:      Number
  }],

  isRead:    { type: Boolean, default: false },
  readAt:    Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);

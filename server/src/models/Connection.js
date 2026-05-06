const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:    { type: String, enum: ['pending', 'accepted', 'rejected', 'blocked'], default: 'pending' },
  message:   { type: String, maxlength: 300 },
  respondedAt: Date
}, { timestamps: true });

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);

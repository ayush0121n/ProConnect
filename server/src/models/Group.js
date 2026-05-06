const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'Group name is required'], trim: true, maxlength: 100 },
  description: { type: String, maxlength: 1000 },
  avatar:      { url: String, publicId: String },
  coverImage:  { url: String, publicId: String },

  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admins:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  members: [{
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role:     { type: String, enum: ['member', 'moderator'], default: 'member' }
  }],
  membersCount: { type: Number, default: 0 },

  privacy:  { type: String, enum: ['public', 'private'], default: 'public' },
  settings: {
    requireApproval:   { type: Boolean, default: false },
    allowMemberPosts:  { type: Boolean, default: true }
  },
  category: { type: String, enum: ['technology', 'business', 'science', 'arts', 'sports', 'other'] },
  tags:     [String]
}, { timestamps: true });

groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1 });
groupSchema.index({ privacy: 1 });

module.exports = mongoose.model('Group', groupSchema);

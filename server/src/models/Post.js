const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: [true, 'Post content is required'], maxlength: 3000 },
  
  media: [{
    type:      { type: String, enum: ['image', 'video', 'document'], required: true },
    url:       { type: String, required: true },
    publicId:  String,
    thumbnail: String
  }],

  likes: [{
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likedAt: { type: Date, default: Date.now }
  }],
  likesCount: { type: Number, default: 0 },

  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:      { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }
  }],
  commentsCount: { type: Number, default: 0 },

  shares: [{
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedAt: { type: Date, default: Date.now }
  }],
  sharesCount: { type: Number, default: 0 },

  visibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
  hashtags:   [String],
  mentions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEdited:   { type: Boolean, default: false },
  editedAt:   Date
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);

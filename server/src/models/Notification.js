const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['connection_request', 'connection_accepted', 'post_like', 'post_comment', 'post_share',
           'job_application', 'message', 'group_invite', 'skill_endorsement', 'profile_view'],
    required: true
  },
  content:  { type: String, required: true, maxlength: 500 },
  relatedEntity: {
    entityType: { type: String, enum: ['post', 'job', 'user', 'group', 'message'] },
    entityId:   mongoose.Schema.Types.ObjectId
  },
  isRead: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
// Auto-delete after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);

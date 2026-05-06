const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Notification.countDocuments({ recipient: req.user._id });
    res.json({ success: true, data: notifications, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) { next(error); }
};

exports.getUnread = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id, isRead: false })
      .populate('sender', 'firstName lastName profilePicture').sort({ createdAt: -1 }).limit(10);
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, data: { notifications, count } });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true, readAt: Date.now() });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: Date.now() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) { next(error); }
};

exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) { next(error); }
};

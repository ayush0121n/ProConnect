const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { getIO } = require('../config/socket');

exports.getConversations = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'firstName lastName profilePicture isOnline lastActive')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: convs });
  } catch (error) { next(error); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const messages = await Message.find({ conversation: req.params.conversationId, isDeleted: false })
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    await Message.updateMany({ conversation: req.params.conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: Date.now() });
    res.json({ success: true, data: messages.reverse() });
  } catch (error) { next(error); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    let conversation = await Conversation.findOne({ participants: { $all: [req.user._id, req.params.userId], $size: 2 } });
    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, req.params.userId] });
    }
    const message = await Message.create({ conversation: conversation._id, sender: req.user._id, receiver: req.params.userId, content });
    await Conversation.findByIdAndUpdate(conversation._id, { lastMessage: message._id, updatedAt: Date.now() });
    const populated = await Message.findById(message._id).populate('sender', 'firstName lastName profilePicture');
    try {
      const io = getIO();
      io.to(`user_${req.params.userId}`).emit('newMessage', populated);
    } catch (e) {}
    res.status(201).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });
    if (msg.sender.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Not authorized' });
    msg.isDeleted = true;
    msg.deletedBy.push(req.user._id);
    await msg.save();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) { next(error); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false, isDeleted: false });
    res.json({ success: true, data: { count } });
  } catch (error) { next(error); }
};

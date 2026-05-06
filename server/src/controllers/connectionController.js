const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({ $or: [{ requester: req.user._id }, { recipient: req.user._id }], status: 'accepted' })
      .populate('requester recipient', 'firstName lastName profilePicture headline company isOnline');
    const list = connections.map(c => c.requester._id.toString() === req.user._id.toString() ? c.recipient : c.requester);
    res.json({ success: true, data: list });
  } catch (error) { next(error); }
};

exports.getConnectionRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({ recipient: req.user._id, status: 'pending' })
      .populate('requester', 'firstName lastName profilePicture headline company connectionsCount');
    res.json({ success: true, data: requests });
  } catch (error) { next(error); }
};

exports.sendConnectionRequest = async (req, res, next) => {
  try {
    if (req.params.userId === req.user._id.toString()) return res.status(400).json({ success: false, error: 'Cannot connect with yourself' });
    const existing = await Connection.findOne({ $or: [{ requester: req.user._id, recipient: req.params.userId }, { requester: req.params.userId, recipient: req.user._id }] });
    if (existing) return res.status(409).json({ success: false, error: 'Connection already exists' });
    const connection = await Connection.create({ requester: req.user._id, recipient: req.params.userId, message: req.body.message });
    Notification.create({ recipient: req.params.userId, sender: req.user._id, type: 'connection_request', content: `${req.user.firstName} ${req.user.lastName} sent you a connection request`, relatedEntity: { entityType: 'user', entityId: req.user._id } }).catch(() => {});
    res.status(201).json({ success: true, data: connection, message: 'Connection request sent' });
  } catch (error) { next(error); }
};

exports.acceptConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findOne({ _id: req.params.id, recipient: req.user._id, status: 'pending' });
    if (!connection) return res.status(404).json({ success: false, error: 'Request not found' });
    connection.status = 'accepted';
    connection.respondedAt = Date.now();
    await connection.save();
    await User.findByIdAndUpdate(connection.requester, { $addToSet: { connections: req.user._id }, $inc: { connectionsCount: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { connections: connection.requester }, $inc: { connectionsCount: 1 } });
    Notification.create({ recipient: connection.requester, sender: req.user._id, type: 'connection_accepted', content: `${req.user.firstName} ${req.user.lastName} accepted your connection request`, relatedEntity: { entityType: 'user', entityId: req.user._id } }).catch(() => {});
    res.json({ success: true, message: 'Connection accepted' });
  } catch (error) { next(error); }
};

exports.rejectConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id, status: 'pending' }, { status: 'rejected', respondedAt: Date.now() }, { new: true });
    if (!connection) return res.status(404).json({ success: false, error: 'Request not found' });
    res.json({ success: true, message: 'Connection rejected' });
  } catch (error) { next(error); }
};

exports.removeConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findOneAndDelete({ $or: [{ requester: req.user._id, recipient: req.params.id }, { requester: req.params.id, recipient: req.user._id }], status: 'accepted' });
    if (!connection) return res.status(404).json({ success: false, error: 'Connection not found' });
    await User.findByIdAndUpdate(req.user._id, { $pull: { connections: req.params.id }, $inc: { connectionsCount: -1 } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { connections: req.user._id }, $inc: { connectionsCount: -1 } });
    res.json({ success: true, message: 'Connection removed' });
  } catch (error) { next(error); }
};

exports.getConnectionSuggestions = async (req, res, next) => {
  try {
    const connections = await Connection.find({ $or: [{ requester: req.user._id }, { recipient: req.user._id }] });
    const connectedIds = connections.flatMap(c => [c.requester.toString(), c.recipient.toString()]);
    const excludeIds = [...new Set([...connectedIds, req.user._id.toString()])];
    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('firstName lastName profilePicture headline company connectionsCount')
      .limit(10).lean();
    res.json({ success: true, data: suggestions });
  } catch (error) { next(error); }
};

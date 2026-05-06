const User = require('../models/User');
const Post = require('../models/Post');
const Connection = require('../models/Connection');

// @desc    Get all users (paginated)
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;

    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('firstName lastName headline profilePicture company location connectionsCount isOnline')
      .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const total = await User.countDocuments({ _id: { $ne: req.user._id } });
    res.json({ success: true, data: users, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) { next(error); }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }

    const allowedFields = ['firstName', 'lastName', 'headline', 'bio', 'location', 'phone',
      'website', 'socialLinks', 'currentPosition', 'company', 'industry',
      'profileVisibility', 'preferences'];

    const updateData = {};
    allowedFields.forEach(field => { if (req.body[field] !== undefined) updateData[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .select('-password');
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) { next(error); }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) { next(error); }
};

// @desc    Get user's posts
// @route   GET /api/users/:id/posts
exports.getUserPosts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'firstName lastName profilePicture headline')
      .sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Post.countDocuments({ author: req.params.id });
    res.json({ success: true, data: posts, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) { next(error); }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot follow yourself' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, error: 'User not found' });

    const alreadyFollowing = req.user.following.includes(req.params.id);
    if (alreadyFollowing) return res.status(400).json({ success: false, error: 'Already following this user' });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: req.params.id },
      $inc: { followingCount: 1 }
    });
    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { followers: req.user._id },
      $inc: { followersCount: 1 }
    });
    res.json({ success: true, message: `You are now following ${target.firstName}` });
  } catch (error) { next(error); }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
exports.unfollowUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
      $inc: { followingCount: -1 }
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
      $inc: { followersCount: -1 }
    });
    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) { next(error); }
};

// @desc    Get user's connections
// @route   GET /api/users/:id/connections
exports.getUserConnections = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('connections', 'firstName lastName headline profilePicture company isOnline')
      .select('connections connectionsCount');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user.connections });
  } catch (error) { next(error); }
};

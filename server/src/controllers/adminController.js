const User = require('../models/User');
const Job = require('../models/Job');
const Post = require('../models/Post');
const Connection = require('../models/Connection');

// @desc    Get system statistics
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const postCount = await Post.countDocuments();
    const connectionCount = await Connection.countDocuments();

    res.json({
      success: true,
      data: {
        users: userCount,
        jobs: jobCount,
        posts: postCount,
        connections: connectionCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    // We include password field here as requested, but it will be hashed
    const users = await User.find().select('+password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user
// @route   POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own admin account' });
    }

    await user.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

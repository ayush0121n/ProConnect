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

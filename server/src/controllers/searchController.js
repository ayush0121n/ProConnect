const User = require('../models/User');
const Job = require('../models/Job');
const Post = require('../models/Post');
const Group = require('../models/Group');

exports.globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query is required' });
    const [users, jobs, posts, groups] = await Promise.all([
      User.find({ $text: { $search: q } }).select('firstName lastName headline profilePicture company').limit(parseInt(limit)),
      Job.find({ $text: { $search: q }, status: 'active' }).select('title company location jobType').limit(parseInt(limit)),
      Post.find({ $text: { $search: q } }).populate('author', 'firstName lastName profilePicture').select('content createdAt').limit(parseInt(limit)),
      Group.find({ $text: { $search: q } }).select('name description avatar membersCount').limit(parseInt(limit))
    ]);
    res.json({ success: true, data: { users, jobs, posts, groups } });
  } catch (error) { next(error); }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Query required' });
    const users = await User.find({ $text: { $search: q } })
      .select('firstName lastName headline profilePicture company location connectionsCount')
      .skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    const total = await User.countDocuments({ $text: { $search: q } });
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

exports.searchJobs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10, jobType, workplaceType, experienceLevel } = req.query;
    const query = { status: 'active' };
    if (q) query.$text = { $search: q };
    if (jobType) query.jobType = jobType;
    if (workplaceType) query.workplaceType = workplaceType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    const jobs = await Job.find(query).populate('postedBy', 'firstName lastName profilePicture').sort({ createdAt: -1 }).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    const total = await Job.countDocuments(query);
    res.json({ success: true, data: jobs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

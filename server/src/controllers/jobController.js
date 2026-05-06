const Job = require('../models/Job');
const User = require('../models/User');

exports.getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { jobType, workplaceType, experienceLevel, location, search } = req.query;
    const query = { status: 'active' };
    if (jobType) query.jobType = jobType;
    if (workplaceType) query.workplaceType = workplaceType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query['location.country'] = { $regex: location, $options: 'i' };
    if (search) query.$text = { $search: search };
    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName profilePicture company')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Job.countDocuments(query);
    res.json({ success: true, data: jobs, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) { next(error); }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'firstName lastName profilePicture company headline');
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, data: job, message: 'Job posted successfully' });
  } catch (error) { next(error); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) { next(error); }
};

exports.applyForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ success: false, error: 'Job is no longer active' });
    const alreadyApplied = job.applications.some(a => a.applicant.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ success: false, error: 'Already applied to this job' });
    job.applications.push({ applicant: req.user._id, coverLetter: req.body.coverLetter || '' });
    job.applicationsCount = job.applications.length;
    await job.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (error) { next(error); }
};

exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applications.applicant', 'firstName lastName profilePicture headline resume');
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });
    res.json({ success: true, data: job.applications });
  } catch (error) { next(error); }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Not authorized' });
    const app = job.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });
    app.status = req.body.status;
    await job.save();
    res.json({ success: true, message: 'Application status updated' });
  } catch (error) { next(error); }
};

exports.saveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.savedJobs.includes(req.params.id)) return res.status(400).json({ success: false, error: 'Job already saved' });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedJobs: req.params.id } });
    res.json({ success: true, message: 'Job saved' });
  } catch (error) { next(error); }
};

exports.unsaveJob = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedJobs: req.params.id } });
    res.json({ success: true, message: 'Job removed from saved' });
  } catch (error) { next(error); }
};

exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'savedJobs', populate: { path: 'postedBy', select: 'firstName lastName profilePicture' } });
    res.json({ success: true, data: user.savedJobs });
  } catch (error) { next(error); }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const jobs = await Job.find({ 'applications.applicant': req.user._id })
      .select('title company location jobType applications.$ applications.status applications.appliedAt')
      .populate('postedBy', 'firstName lastName');
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};

exports.getMyJobPosts = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};

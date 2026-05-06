const User = require('../models/User');

// @desc    Update profile (experience, education, skills, certifications)
// @route   PUT /api/profile/update
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['firstName','lastName','headline','bio','location','phone','website','socialLinks','currentPosition','company','industry','profileVisibility','preferences'];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) { next(error); }
};

// Experience CRUD
exports.addExperience = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { experience: req.body } }, { new: true }).select('experience');
    res.status(201).json({ success: true, data: user.experience });
  } catch (error) { next(error); }
};

exports.updateExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const exp = user.experience.id(req.params.id);
    if (!exp) return res.status(404).json({ success: false, error: 'Experience not found' });
    Object.assign(exp, req.body);
    await user.save();
    res.json({ success: true, data: user.experience });
  } catch (error) { next(error); }
};

exports.deleteExperience = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { experience: { _id: req.params.id } } }, { new: true }).select('experience');
    res.json({ success: true, data: user.experience });
  } catch (error) { next(error); }
};

// Education CRUD
exports.addEducation = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { education: req.body } }, { new: true }).select('education');
    res.status(201).json({ success: true, data: user.education });
  } catch (error) { next(error); }
};

exports.updateEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const edu = user.education.id(req.params.id);
    if (!edu) return res.status(404).json({ success: false, error: 'Education not found' });
    Object.assign(edu, req.body);
    await user.save();
    res.json({ success: true, data: user.education });
  } catch (error) { next(error); }
};

exports.deleteEducation = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { education: { _id: req.params.id } } }, { new: true }).select('education');
    res.json({ success: true, data: user.education });
  } catch (error) { next(error); }
};

// Skills
exports.addSkill = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (user.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return res.status(400).json({ success: false, error: 'Skill already added' });
    user.skills.push({ name });
    await user.save();
    res.status(201).json({ success: true, data: user.skills });
  } catch (error) { next(error); }
};

exports.removeSkill = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { skills: { name: req.params.name } } }, { new: true }).select('skills');
    res.json({ success: true, data: user.skills });
  } catch (error) { next(error); }
};

exports.endorseSkill = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const skill = user.skills.find(s => s.name === req.params.name);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });
    const already = skill.endorsements.some(e => e.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, error: 'Already endorsed' });
    skill.endorsements.push({ user: req.user._id });
    await user.save();
    res.json({ success: true, message: 'Skill endorsed' });
  } catch (error) { next(error); }
};

// Certifications
exports.addCertification = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { certifications: req.body } }, { new: true }).select('certifications');
    res.status(201).json({ success: true, data: user.certifications });
  } catch (error) { next(error); }
};

exports.deleteCertification = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { certifications: { _id: req.params.id } } }, { new: true }).select('certifications');
    res.json({ success: true, data: user.certifications });
  } catch (error) { next(error); }
};

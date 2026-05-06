const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// Get all groups
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const query = { privacy: 'public' };
    if (category) query.category = category;
    const groups = await Group.find(query).populate('creator', 'firstName lastName profilePicture').sort({ createdAt: -1 }).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    const total = await Group.countDocuments(query);
    res.json({ success: true, data: groups, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
});

// Get my groups
router.get('/my-groups', protect, async (req, res, next) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id }).populate('creator', 'firstName lastName profilePicture');
    res.json({ success: true, data: groups });
  } catch (error) { next(error); }
});

// Get single group
router.get('/:id', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('creator', 'firstName lastName profilePicture').populate('members.user', 'firstName lastName profilePicture headline');
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (error) { next(error); }
});

// Create group
router.post('/', protect, async (req, res, next) => {
  try {
    const group = await Group.create({ ...req.body, creator: req.user._id, admins: [req.user._id], members: [{ user: req.user._id, role: 'moderator' }], membersCount: 1 });
    res.status(201).json({ success: true, data: group, message: 'Group created successfully' });
  } catch (error) { next(error); }
});

// Join group
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ success: false, error: 'Already a member' });
    group.members.push({ user: req.user._id });
    group.membersCount = group.members.length;
    await group.save();
    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) { next(error); }
});

// Leave group
router.delete('/:id/leave', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
    group.members = group.members.filter(m => m.user.toString() !== req.user._id.toString());
    group.membersCount = group.members.length;
    await group.save();
    res.json({ success: true, message: 'Left group' });
  } catch (error) { next(error); }
});

// Delete group
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
    if (group.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });
    await group.deleteOne();
    res.json({ success: true, message: 'Group deleted' });
  } catch (error) { next(error); }
});

module.exports = router;

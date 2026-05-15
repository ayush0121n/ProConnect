const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob, applyForJob, getJobApplications, updateApplicationStatus, saveJob, unsaveJob, getSavedJobs, getMyApplications, getMyJobPosts } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/my-posts', protect, getMyJobPosts);
router.post('/', protect, createJob);
router.get('/:id', protect, getJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, applyForJob);
router.get('/:id/applications', protect, getJobApplications);
router.put('/:id/applications/:appId', protect, updateApplicationStatus);
router.post('/:id/save', protect, saveJob);
router.delete('/:id/save', protect, unsaveJob);

module.exports = router;

const express = require('express');
const router = express.Router();
const { updateProfile, addExperience, updateExperience, deleteExperience, addEducation, updateEducation, deleteEducation, addSkill, removeSkill, endorseSkill, addCertification, deleteCertification } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.put('/update', protect, updateProfile);
router.post('/experience', protect, addExperience);
router.put('/experience/:id', protect, updateExperience);
router.delete('/experience/:id', protect, deleteExperience);
router.post('/education', protect, addEducation);
router.put('/education/:id', protect, updateEducation);
router.delete('/education/:id', protect, deleteEducation);
router.post('/skills', protect, addSkill);
router.delete('/skills/:name', protect, removeSkill);
router.post('/skills/:userId/:name/endorse', protect, endorseSkill);
router.post('/certification', protect, addCertification);
router.delete('/certification/:id', protect, deleteCertification);

module.exports = router;

const express = require('express');
const router = express.Router();
const { globalSearch, searchUsers, searchJobs } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.get('/global', protect, globalSearch);
router.get('/users', protect, searchUsers);
router.get('/jobs', protect, searchJobs);

module.exports = router;

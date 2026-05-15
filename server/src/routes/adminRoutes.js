const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, createUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

module.exports = router;

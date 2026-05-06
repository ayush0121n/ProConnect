const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, getUserPosts, followUser, unfollowUser, getUserConnections } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.get('/:id/posts', protect, getUserPosts);
router.get('/:id/connections', protect, getUserConnections);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

module.exports = router;

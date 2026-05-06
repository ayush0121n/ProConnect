const express = require('express');
const router = express.Router();
const { getNotifications, getUnread, markRead, markAllRead, deleteNotification, clearAll } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.get('/unread', protect, getUnread);
router.put('/read-all', protect, markAllRead);
router.delete('/clear-all', protect, clearAll);
router.put('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;

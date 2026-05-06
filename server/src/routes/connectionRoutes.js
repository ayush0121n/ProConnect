const express = require('express');
const router = express.Router();
const { getConnections, getConnectionRequests, sendConnectionRequest, acceptConnection, rejectConnection, removeConnection, getConnectionSuggestions } = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getConnections);
router.get('/requests', protect, getConnectionRequests);
router.get('/suggestions', protect, getConnectionSuggestions);
router.post('/send/:userId', protect, sendConnectionRequest);
router.put('/accept/:id', protect, acceptConnection);
router.put('/reject/:id', protect, rejectConnection);
router.delete('/:id', protect, removeConnection);

module.exports = router;

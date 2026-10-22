const express = require('express');
const router = express.Router();
const { getActivityLogs, getUserActivity } = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getActivityLogs);
router.get('/my-activity', protect, getUserActivity);

module.exports = router;

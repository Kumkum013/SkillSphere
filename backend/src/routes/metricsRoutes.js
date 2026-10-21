const express = require('express');
const { getCacheMetrics } = require('../controllers/metricsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/cache', protect, authorize('ADMIN'), getCacheMetrics);

module.exports = router;

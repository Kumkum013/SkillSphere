const express = require('express');
const { finishGitHubConnect } = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/callback', protect, finishGitHubConnect);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  syncContributions,
  getProjectContributions,
  getContributionSummary,
  addManualContribution,
  reviewContribution,
  linkGithubRepo
} = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Link GitHub repository to project
router.post('/projects/:projectId/link-repo', linkGithubRepo);

// Sync GitHub contributions for a project
router.post('/projects/:projectId/sync', syncContributions);

// Get all contributions for a project
router.get('/projects/:projectId', getProjectContributions);

// Get contribution summary (for project manager dashboard)
router.get('/projects/:projectId/summary', getContributionSummary);

// Add manual contribution
router.post('/projects/:projectId/manual', addManualContribution);

// Review contribution
router.put('/:contributionId/review', reviewContribution);

module.exports = router;

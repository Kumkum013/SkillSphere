const express = require('express');
const router = express.Router();
const {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { getRecommendations, getProjectRecommendations } = require('../controllers/matchController');
const {
  requestToJoin,
  getProjectJoinRequestState,
  listOwnerJoinRequests,
  decideJoinRequest
} = require('../controllers/joinRequestController');
const {
  getProjectMessages,
  sendProjectMessage,
  getPrivateMessages,
  sendPrivateMessage
} = require('../controllers/chatController');
const { beginGitHubConnect, getGitHubContributions } = require('../controllers/githubController');

const { protect } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimiter');
const { validateCreateProject } = require('../middleware/validator');

router.post('/', protect, createLimiter, validateCreateProject, createProject);
router.get('/', protect, listProjects);
router.get('/recommendations', protect, getProjectRecommendations);
router.post('/:projectId/github/connect', protect, beginGitHubConnect);
router.get('/:projectId/github/contributions', protect, getGitHubContributions);
router.get('/:projectId/chat', protect, getProjectMessages);
router.post('/:projectId/chat', protect, sendProjectMessage);
router.get('/:projectId/chat/:userId', protect, getPrivateMessages);
router.post('/:projectId/chat/:userId', protect, sendPrivateMessage);
router.post('/:projectId/join-request', protect, requestToJoin);
router.get('/:projectId/join-request', protect, getProjectJoinRequestState);
router.get('/:projectId/join-requests', protect, listOwnerJoinRequests);
router.patch('/join-requests/:requestId/decision', protect, decideJoinRequest);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.get('/:id/recommendations', protect, getRecommendations);

module.exports = router;
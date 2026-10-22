const express = require('express');
const router = express.Router();
const {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMilestone,
  updateMilestone,
  deleteMilestone
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

const { protect } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimiter');
const { validateCreateProject } = require('../middleware/validator');

router.post('/', protect, createLimiter, validateCreateProject, createProject);
router.get('/', protect, listProjects);
router.get('/my-projects', protect, listProjects);
router.get('/recommendations', protect, getProjectRecommendations);
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
router.post('/:id/milestones', protect, addMilestone);
router.put('/:id/milestones/:milestoneIndex', protect, updateMilestone);
router.delete('/:id/milestones/:milestoneIndex', protect, deleteMilestone);

module.exports = router;
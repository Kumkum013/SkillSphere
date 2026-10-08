const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getProjectMessages,
  sendProjectMessage,
  getPrivateMessages,
  sendPrivateMessage
} = require('../controllers/chatController');
const router = express.Router();

router.use(protect);
router.get('/:projectId', getProjectMessages);
router.post('/:projectId', sendProjectMessage);
router.get('/:projectId/:userId', getPrivateMessages);
router.post('/:projectId/:userId', sendPrivateMessage);

module.exports = router;

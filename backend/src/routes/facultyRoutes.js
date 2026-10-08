const express = require('express');
const router = express.Router();
const {
  getFacultyOverview,
  claimMentorship,
  toggleProjectApproval,
  endorseStudentSkill
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All faculty routes require authentication and FACULTY or ADMIN role
router.use(protect);
router.use(authorize('FACULTY', 'ADMIN'));

router.get('/overview', getFacultyOverview);
router.post('/projects/:projectId/mentor', claimMentorship);
router.patch('/projects/:projectId/approval', toggleProjectApproval);
router.post('/students/endorse-skill', endorseStudentSkill);

module.exports = router;

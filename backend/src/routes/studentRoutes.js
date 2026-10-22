const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addSkill, removeSkill, searchStudents, getStudentById, getResumeMatches } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/resume-matches', protect, getResumeMatches);
router.post('/skills', protect, addSkill);
router.delete('/skills/:skillId', protect, removeSkill);
router.get('/', protect, searchStudents);
router.get('/:id', protect, getStudentById);

module.exports = router;
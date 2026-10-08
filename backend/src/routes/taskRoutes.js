const express = require('express');
const router = express.Router();
const { createTask, listProjectTasks, getMyTasks, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/my', protect, getMyTasks);
router.get('/project/:projectId', protect, listProjectTasks);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
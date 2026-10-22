const express = require('express');
const router = express.Router();
const {
  startTimeEntry,
  stopTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getProjectTimeSummary
} = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, startTimeEntry);
router.get('/', protect, getTimeEntries);
router.post('/:id/stop', protect, stopTimeEntry);
router.put('/:id', protect, updateTimeEntry);
router.delete('/:id', protect, deleteTimeEntry);
router.get('/project/:projectId/summary', protect, getProjectTimeSummary);

module.exports = router;

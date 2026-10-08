const express = require('express');
const router = express.Router();
const { sendInvitation, getMyInvitations, respondToInvitation, sendBulkInvitations } = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendInvitation);
router.post('/bulk', protect, sendBulkInvitations);
router.get('/my', protect, getMyInvitations);
router.put('/:id/respond', protect, respondToInvitation);

module.exports = router;
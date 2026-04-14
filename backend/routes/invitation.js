const express = require('express');
const router = express.Router();
const invitation = require('../controllers/invitationController');
const { protect } = require('../middlewares/authMiddleware');

// router.use(protect);

// Routes CRUD
router.post('/envoyerInvitation', invitation.envoyerInvitation);
router.post('/accepterInvitation', invitation.accepterInvitation);

module.exports = router;
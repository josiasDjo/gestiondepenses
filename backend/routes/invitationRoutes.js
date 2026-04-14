const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { protect } = require('../middlewares/authMiddleware');

// Routes pour les invitations
router.post('/envoyer', invitationController.envoyerInvitation);
router.get('/mes-invitations', invitationController.getMesInvitations);
router.post('/:id/accepter', invitationController.accepterInvitationParId);
router.post('/:id/refuser', invitationController.refuserInvitation); 
// router.get('/menage/:id_menage', invitationController.getInvitationsByMenage); 
// router.put('/:id/annuler', invitationController.annulerInvitation);

// Route publique pour vérifier une invitation (sans authentification)
// On sort cette route du middleware protect
module.exports = router;
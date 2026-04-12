const express = require('express');
const router = express.Router();
const menageController = require('../controllers/menageController');
const { protect, isMembreMenage } = require('../middlewares/authMiddleware');

router.use(protect);

// Routes CRUD
router.post('/', menageController.createMenage);
router.get('/', menageController.getMesMenages);
router.get('/:id_menage', isMembreMenage, menageController.getMenageById);
router.put('/:id_menage', isMembreMenage, menageController.updateMenage);
router.delete('/:id_menage', isMembreMenage, menageController.deleteMenage);

// Gestion des membres
router.post('/:id_menage/membres', isMembreMenage, menageController.ajouterMembre);
router.delete('/:id_menage/membres/:id_utilisateur', isMembreMenage, menageController.retirerMembre);
router.get('/:id_menage/membres', isMembreMenage, menageController.getMembres);

module.exports = router;
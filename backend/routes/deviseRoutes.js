const express = require('express');
const router = express.Router();
const deviseController = require('../controllers/DeviseController');
const { protect } = require('../middlewares/authMiddleware');

// Routes publiques (lecture seule)
router.get('/', deviseController.getAllDevises);
router.get('/:id_devise', deviseController.getDeviseById);

// Routes protégées (admin seulement)
router.use(protect);
router.post('/', deviseController.createDevise);
router.put('/:id_devise', deviseController.updateDevise);
router.delete('/:id_devise', deviseController.deleteDevise);
router.put('/:id_devise/taux', deviseController.updateTauxExchange);

module.exports = router;
const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/AlerteController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// Routes CRUD
router.post('/', alerteController.createAlerte);
router.get('/', alerteController.getAllAlertes);
router.get('/budget/:id_budget', alerteController.getAlertesByBudget);
router.get('/:id_alerte', alerteController.getAlerteById);
router.put('/:id_alerte', alerteController.updateAlerte);
router.delete('/:id_alerte', alerteController.deleteAlerte);
router.patch('/:id_alerte/statut', alerteController.updateStatut);

module.exports = router;
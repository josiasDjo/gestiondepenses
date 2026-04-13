const express = require('express');
const router = express.Router();
const compteController = require('../controllers/compteController');
const { protect } = require('../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes principales
router.get('/all', compteController.getMesComptes);
router.get('/solde/total', compteController.getSoldeTotal);
router.get('/:id', compteController.getCompteById);

router.post('/', compteController.createCompte);
router.put('/:id', compteController.updateCompte);
router.delete('/:id', compteController.deleteCompte);

module.exports = router;
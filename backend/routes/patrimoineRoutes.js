const express = require('express');
const router = express.Router();
const patrimoineController = require('../controllers/patrimoineController');
const { protect, isMembreMenage } = require('../middlewares/authMiddleware');

router.use(protect);

// Routes CRUD
router.post('/', patrimoineController.createPatrimoine);
router.get('/', patrimoineController.getAllPatrimoine);
router.get('/menage/:id_menage', isMembreMenage, patrimoineController.getPatrimoineByMenage);
router.get('/:id_patrimoine', patrimoineController.getPatrimoineById);
router.put('/:id_patrimoine', patrimoineController.updatePatrimoine);
router.delete('/:id_patrimoine', patrimoineController.deletePatrimoine);

// Routes spécifiques
router.get('/menage/:id_menage/synthese', isMembreMenage, patrimoineController.getSynthesePatrimoine);
router.get('/menage/:id_menage/dettes', isMembreMenage, patrimoineController.getDettes);
router.get('/menage/:id_menage/creances', isMembreMenage, patrimoineController.getCreances);

module.exports = router;
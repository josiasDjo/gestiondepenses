const express = require('express');
const router = express.Router();
const compteController = require('../controllers/compteController');
const { protect } = require('../middlewares/authMiddleware');
const { validate, compteValidators } = require('../middlewares/validationMiddleware');

router.use(protect);

router.post('/', validate(compteValidators), compteController.createCompte);
router.get('/menage/:id_menage', compteController.getComptesByMenage);
router.get('/menage/:id_menage/solde', compteController.getSoldeTotal);
router.get('/:id_compte', compteController.getCompteById);
router.put('/:id_compte', compteController.updateCompte);
router.delete('/:id_compte', compteController.deleteCompte);

module.exports = router;
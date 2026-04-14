const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/AlterteController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/budgetVerification', alerteController.verifierBudgets);
router.get('/asRead', alerteController.marquerCommeLue)
router.get('/non-lues', alerteController.getAlertesNonLues)


module.exports = router;
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const { validate, transactionValidators } = require('../middlewares/validationMiddleware');

router.use(protect);

router.post('/', validate(transactionValidators), transactionController.createTransaction);
router.get('/compte/:id_compte', transactionController.getTransactionsByCompte);
router.get('/period', transactionController.getTransactionsByPeriode);
router.get('/summary', transactionController.getTransactionSummary);
router.put('/:id_transaction', transactionController.updateTransaction);
router.delete('/:id_transaction', transactionController.deleteTransaction);

module.exports = router;
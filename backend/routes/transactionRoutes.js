const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

// router.use(protect);

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getMesTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
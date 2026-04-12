const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/BudgetController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// Routes CRUD
router.post('/', budgetController.createBudget);
router.get('/', budgetController.getAllBudgets);
router.get('/menage/:id_menage', budgetController.getBudgetsByMenage);
router.get('/:id_budget', budgetController.getBudgetById);
router.put('/:id_budget', budgetController.updateBudget);
router.delete('/:id_budget', budgetController.deleteBudget);

// Routes spécifiques
router.get('/:id_budget/verifier', budgetController.verifierDepassement);
router.get('/menage/:id_menage/resume', budgetController.getResumeBudgets);

module.exports = router;
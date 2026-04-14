const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', categorieController.getCategories);
router.get('/depenses', categorieController.getDepensesParCategorie);

module.exports = router;
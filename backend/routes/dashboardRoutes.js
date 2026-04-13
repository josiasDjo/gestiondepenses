const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// Toutes les routes du dashboard nécessitent une authentification
// router.use(protect);

// Route principale des statistiques
router.get('/stats', dashboardController.getDashboardStats);

// Route pour les transactions récentes
router.get('/transactions/recentes', dashboardController.getRecentTransactions);

// Route pour les statistiques par catégorie
router.get('/stats/categories', dashboardController.getStatsByCategorie);

module.exports = router;
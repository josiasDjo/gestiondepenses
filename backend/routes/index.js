const express = require('express');
const router = express.Router();

// Import de toutes les routes
const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const compteRoutes = require('./compteRoutes');
const rapportRoutes = require('./rapportRoutes');
const categorieRoutes = require('./categorieRoutes');
const alerteRoutes = require('./alerteRoutes');
const budgetRoutes = require('./budgetRoutes');
const deviseRoutes = require('./deviseRoutes');
const menageRoutes = require('./menageRoutes');
const patrimoineRoutes = require('./patrimoineRoutes');

// Définition des endpoints
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/comptes', compteRoutes);
router.use('/rapports', rapportRoutes);
router.use('/categories', categorieRoutes);
// router.use('/alertes', alerteRoutes);
router.use('/budgets', budgetRoutes);
router.use('/devises', deviseRoutes);
router.use('/menages', menageRoutes);
router.use('/patrimoines', patrimoineRoutes);

// Route de test
router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date() });
});

module.exports = router;
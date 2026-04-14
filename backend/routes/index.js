const express = require('express');
const router = express.Router();

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
const dashboardRoutes = require('./dashboardRoutes')
const invitationRooutes = require('./invitationRoutes')

// Définition des endpoints
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/comptes', compteRoutes);
router.use('/rapports', rapportRoutes);
router.use('/categories', categorieRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/alertes', alerteRoutes);
router.use('/invitations', invitationRooutes);
router.use('/budgets', budgetRoutes);
router.use('/devises', deviseRoutes);
router.use('/menages', menageRoutes);
router.use('/patrimoines', patrimoineRoutes);

// router.use('/', menageRoutes);


module.exports = router;
const { sequelize } = require('../models/index');
const Transaction = require('../models/Transaction')
const Compte = require('../models/Compte')
const MembresMenage = require('../models/Membres_menage')
const Menage = require('../models/Menage')
const { Op } = require('sequelize');
const { getUserFromToken } = require('../utils/auth')
/**
 * Récupérer les comptes de l'utilisateur via ses ménages
 */
const getComptesByUser = async (userId) => {
  // Récupérer tous les ménages dont l'utilisateur est membre
  console.log('Utilisateur getComptesByUser : ', userId)
  const membresMenages = await MembresMenage.findAll({
    where: { id_utilisateur: userId },
    attributes: ['id_menage']
  });
  
  const menageIds = membresMenages.map(m => m.id_menage);
  
  if (menageIds.length === 0) return [];
  
  // Récupérer les comptes de ces ménages
  const comptes = await Compte.findAll({
    where: { id_menage: { [Op.in]: menageIds } }
  });
  
  return comptes;
};

/**
 * Récupérer les statistiques pour le dashboard
 */
const getDashboardStats = async (req, res) => {
  try {

    // Récupérer l'utilisateur à partir du token
    const user = await getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    console.log('Utilisateur : ', userId)
    
    console.log('=== DASHBOARD STATS ===');
    console.log('Utilisateur ID:', userId);
    
    // Récupérer les comptes de l'utilisateur via ses ménages
    const comptes = await getComptesByUser(userId);
    
    const compteIds = comptes.map(c => c.id_compte);
    console.log('Comptes trouvés:', compteIds.length);
    
    // Date du début du mois actuel
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    
    const finMois = new Date();
    finMois.setMonth(finMois.getMonth() + 1);
    finMois.setDate(0);
    finMois.setHours(23, 59, 59, 999);
    
    let totalIncome = 0;
    let totalExpense = 0;
    let totalBalance = 0;
    
    // Calculer le solde total
    comptes.forEach(compte => {
      totalBalance += parseFloat(compte.solde);
    });
    
    if (compteIds.length > 0) {
      // Récupérer les transactions du mois
      const transactionsDuMois = await Transaction.findAll({
        where: {
          id_compte: { [Op.in]: compteIds },
          date_transaction: {
            [Op.between]: [debutMois, finMois]
          }
        }
      });
      
      transactionsDuMois.forEach(transaction => {
        if (transaction.type_flux === 'Revenu') {
          totalIncome += parseFloat(transaction.montant);
        } else {
          totalExpense += parseFloat(transaction.montant);
        }
      });
      
      // Récupérer les transactions récentes
      const recentTransactions = await Transaction.findAll({
        where: { id_compte: { [Op.in]: compteIds } },
        order: [['date_transaction', 'DESC']],
        limit: 10
      });
      
      const formattedTransactions = recentTransactions.map(transaction => ({
        id: transaction.id_transaction,
        date: transaction.date_transaction,
        description: transaction.description || 'Sans description',
        category: transaction.categorie || 'Non catégorisé',
        amount: parseFloat(transaction.montant),
        type: transaction.type_flux === 'Revenu' ? 'income' : 'expense'
      }));
      
      // Données pour l'évolution (6 derniers mois)
      const evolution = await getEvolutionData(compteIds);
      
      // Dépenses par catégorie
      // const depensesParCategorie = await Transaction.findAll({
      //   attributes: [
      //     'categorie',
      //     [sequelize.fn('SUM', sequelize.col('montant')), 'total']
      //   ],
      //   where: {
      //     id_compte: { [Op.in]: compteIds },
      //     type_flux: 'Depense',
      //     date_transaction: { [Op.between]: [debutMois, finMois] }
      //   },
      //   group: ['categorie'],
      //   raw: true
      // });
      
      res.json({
        totalBalance,
        totalIncome,
        totalExpense,
        recentTransactions: formattedTransactions,
        evolution,
        // depensesParCategorie: depensesParCategorie.filter(d => d.categorie)
        depensesParCategorie: []
      });
      
    } else {
      res.json({
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        recentTransactions: [],
        evolution: { labels: [], revenus: [], depenses: [] },
        depensesParCategorie: []
      });
    }
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer l'évolution des revenus et dépenses sur 6 mois
 */
const getEvolutionData = async (compteIds) => {
  const evolution = {
    labels: [],
    revenus: [],
    depenses: []
  };
  
  const aujourdhui = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(aujourdhui.getMonth() - i);
    const mois = date.getMonth();
    const annee = date.getFullYear();
    
    const nomMois = date.toLocaleString('fr-FR', { month: 'short' });
    evolution.labels.push(nomMois);
    
    const debutMois = new Date(annee, mois, 1);
    const finMois = new Date(annee, mois + 1, 0, 23, 59, 59, 999);
    
    const revenus = await Transaction.sum('montant', {
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Revenu',
        date_transaction: { [Op.between]: [debutMois, finMois] }
      }
    });
    
    const depenses = await Transaction.sum('montant', {
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Depense',
        date_transaction: { [Op.between]: [debutMois, finMois] }
      }
    });
    
    evolution.revenus.push(revenus || 0);
    evolution.depenses.push(depenses || 0);
  }
  
  return evolution;
};

/**
 * Récupérer les transactions récentes
 */
const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const limit = parseInt(req.query.limit) || 10;
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (compteIds.length === 0) {
      return res.json([]);
    }
    
    const transactions = await Transaction.findAll({
      where: { id_compte: { [Op.in]: compteIds } },
      order: [['date_transaction', 'DESC']],
      limit: limit
    });
    
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id_transaction,
      date: transaction.date_transaction,
      description: transaction.description || 'Sans description',
      category: transaction.categorie || 'Non catégorisé',
      amount: parseFloat(transaction.montant),
      type: transaction.type_flux === 'Revenu' ? 'income' : 'expense'
    }));
    
    res.json(formattedTransactions);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer les statistiques par catégorie
 */
const getStatsByCategorie = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { periode = 'month' } = req.query;
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (compteIds.length === 0) {
      return res.json({ depenses: [], revenus: [], periode });
    }
    
    let dateCondition = {};
    const maintenant = new Date();
    
    if (periode === 'month') {
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      dateCondition = { date_transaction: { [Op.gte]: debutMois } };
    } else if (periode === 'year') {
      const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
      dateCondition = { date_transaction: { [Op.gte]: debutAnnee } };
    }
    
    const depensesParCategorie = await Transaction.findAll({
      attributes: [
        'categorie',
        [sequelize.fn('SUM', sequelize.col('montant')), 'total']
      ],
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Depense',
        ...dateCondition
      },
      group: ['categorie'],
      raw: true
    });
    
    const revenusParCategorie = await Transaction.findAll({
      attributes: [
        'categorie',
        [sequelize.fn('SUM', sequelize.col('montant')), 'total']
      ],
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Revenu',
        ...dateCondition
      },
      group: ['categorie'],
      raw: true
    });
    
    res.json({
      depenses: depensesParCategorie.filter(d => d.categorie),
      revenus: revenusParCategorie.filter(r => r.categorie),
      periode
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentTransactions,
  getStatsByCategorie,
  getComptesByUser  // Exporté pour être utilisé ailleurs
};
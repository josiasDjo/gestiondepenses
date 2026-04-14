const { Transaction, Compte, MembresMenage, Devise, sequelize } = require('../models'); // ← Ajouter Devise ici
const { Op } = require('sequelize');
const { getUserFromToken } = require('../utils/auth');

/**
 * Récupérer les comptes de l'utilisateur via ses ménages avec leur devise
 */
const getComptesByUser = async (userId) => {
  try {
    const membres = await MembresMenage.findAll({
      where: { id_utilisateur: userId },
      attributes: ['id_menage']
    });
    
    const menageIds = membres.map(m => m.id_menage);
    
    if (menageIds.length === 0) return [];
    
    const comptes = await Compte.findAll({
      where: { id_menage: { [Op.in]: menageIds } },
      include: [{ 
        model: Devise, 
        as: 'devise',
        required: false,
        attributes: ['id_devise', 'code_devise', 'nom_devise']
      }]
    });
    
    return comptes;
  } catch (error) {
    console.error('Erreur getComptesByUser:', error);
    return [];
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
 * Récupérer les statistiques pour le dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    
    // Récupérer les comptes de l'utilisateur avec leurs devises
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    // Initialiser la réponse avec des valeurs par défaut
    const response = {
      global: {
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0
      },
      parDevise: [],
      recentTransactions: [],
      depensesParCategorie: [],
      evolution: { labels: [], revenus: [], depenses: [] }
    };
    
    if (compteIds.length === 0) {
      console.log('Aucun compte trouvé');
      return res.json(response);
    }
    
    // Date du début du mois actuel
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    
    const finMois = new Date();
    finMois.setMonth(finMois.getMonth() + 1);
    finMois.setDate(0);
    finMois.setHours(23, 59, 59, 999);
    
    // Calculer les totaux globaux
    let totalIncome = 0;
    let totalExpense = 0;
    let totalBalance = 0;
    
    comptes.forEach(compte => {
      totalBalance += parseFloat(compte.solde || 0);
    });
    
    // Récupérer les transactions du mois
    const transactionsDuMois = await Transaction.findAll({
      where: {
        id_compte: { [Op.in]: compteIds },
        date_transaction: { [Op.between]: [debutMois, finMois] }
      }
    });
    
    transactionsDuMois.forEach(transaction => {
      const montant = parseFloat(transaction.montant || 0);
      if (transaction.type_flux === 'Revenu') {
        totalIncome += montant;
      } else {
        totalExpense += montant;
      }
    });
    
    response.global = {
      totalBalance,
      totalIncome,
      totalExpense
    };
    
    // Grouper les comptes par devise
    const comptesParDevise = {};
    for (const compte of comptes) {
      // Récupérer l'ID de la devise
      const deviseId = compte.id_devise || 'sans_devise';
      
      if (!comptesParDevise[deviseId]) {
        comptesParDevise[deviseId] = {
          deviseId: compte.id_devise,
          deviseCode: compte.devise?.code_devise || 'N/A',
          deviseNom: compte.devise?.nom_devise || 'Sans devise',
          compteIds: [],
          soldeTotal: 0
        };
      }
      comptesParDevise[deviseId].compteIds.push(compte.id_compte);
      comptesParDevise[deviseId].soldeTotal += parseFloat(compte.solde || 0);
    }
    
    // Calculer revenus/dépenses par devise
    for (const [deviseId, deviseInfo] of Object.entries(comptesParDevise)) {
      const revenus = await Transaction.sum('montant', {
        where: {
          id_compte: { [Op.in]: deviseInfo.compteIds },
          type_flux: 'Revenu',
          date_transaction: { [Op.between]: [debutMois, finMois] }
        }
      });
      
      const depenses = await Transaction.sum('montant', {
        where: {
          id_compte: { [Op.in]: deviseInfo.compteIds },
          type_flux: 'Depense',
          date_transaction: { [Op.between]: [debutMois, finMois] }
        }
      });
      
      response.parDevise.push({
        id_devise: deviseInfo.deviseId,
        code_devise: deviseInfo.deviseCode,
        nom_devise: deviseInfo.deviseNom,
        solde: deviseInfo.soldeTotal,
        revenus: revenus || 0,
        depenses: depenses || 0
      });
    }
    
    // Récupérer les transactions récentes AVEC la devise du compte
    const getRecentTransactions = await Transaction.findAll({
      where: { id_compte: { [Op.in]: compteIds } },
      include: [
        {
          model: Compte,
          as: 'compte',
          include: [{ 
            model: Devise, 
            as: 'devise',
            attributes: ['id_devise', 'code_devise', 'nom_devise']
          }],
          attributes: ['id_compte', 'nom_compte', 'id_devise']
        }
      ],
      order: [['date_transaction', 'DESC']],
      limit: 10
    });
    
    console.log('Recent transactions avec comptes:', getRecentTransactions.length);
    
    response.getRecentTransactions = getRecentTransactions.map(transaction => {
      // Vérifier que transaction.compte existe
      const compte = transaction.compte || {};
      const devise = compte.devise || {};
      
      return {
        id: transaction.id_transaction,
        date: transaction.date_transaction,
        description: transaction.description || 'Sans description',
        category: transaction.categorie || 'Non catégorisé',
        amount: parseFloat(transaction.montant || 0),
        type: transaction.type_flux === 'Revenu' ? 'income' : 'expense',
        id_compte: compte.id_compte,
        nom_compte: compte.nom_compte || 'Compte inconnu',
        id_devise: compte.id_devise,
        code_devise: devise.code_devise || null,
        nom_devise: devise.nom_devise || null
      };
    });
    
    // Dépenses par catégorie
    const depensesParCategorie = await Transaction.findAll({
      attributes: [
        'categorie',
        [sequelize.fn('SUM', sequelize.col('montant')), 'total']
      ],
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Depense',
        date_transaction: { [Op.between]: [debutMois, finMois] }
      },
      group: ['categorie'],
      raw: true
    });
    
    response.depensesParCategorie = depensesParCategorie.filter(d => d.categorie).map(d => ({
      categorie: d.categorie,
      total: parseFloat(d.total)
    }));
    
    // Données d'évolution
    response.evolution = await getEvolutionData(compteIds);
    
    console.log('Dashboard response - parDevise:', response.parDevise.length);
    console.log('Dashboard response - recentTransactions:', response.recentTransactions.length);
    
    res.json(response);
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    // Retourner une structure valide même en cas d'erreur
    res.status(500).json({
      global: { totalBalance: 0, totalIncome: 0, totalExpense: 0 },
      parDevise: [],
      recentTransactions: [],
      depensesParCategorie: [],
      evolution: { labels: [], revenus: [], depenses: [] }
    });
  }
};

/**
 * Récupérer les transactions récentes
 */
const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    // const limit = parseInt(req.query.limit) || 10;
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (compteIds.length === 0) {
      return res.json([]);
    }
    
    // Récupérer les transactions récentes AVEC la devise du compte
    const recentTransactions = await Transaction.findAll({
      where: { id_compte: { [Op.in]: compteIds } },
      include: [
        {
          model: Compte,
          as: 'compte',
          include: [{ 
            model: Devise, 
            as: 'devise',
            attributes: ['id_devise', 'code_devise', 'nom_devise']
          }],
          attributes: ['id_compte', 'nom_compte', 'id_devise']
        }
      ],
      order: [['date_transaction', 'DESC']],
      limit: 10
    });
    
    console.log('Recent transactions avec comptes:', recentTransactions.length);
    
    response.recentTransactions = recentTransactions.map(transaction => {
      // Vérifier que transaction.compte existe
      const compte = transaction.compte || {};
      const devise = compte.devise || {};
      
      return {
        id: transaction.id_transaction,
        date: transaction.date_transaction,
        description: transaction.description || 'Sans description',
        category: transaction.categorie || 'Non catégorisé',
        amount: parseFloat(transaction.montant || 0),
        type: transaction.type_flux === 'Revenu' ? 'income' : 'expense',
        id_compte: compte.id_compte,
        nom_compte: compte.nom_compte || 'Compte inconnu',
        id_devise: compte.id_devise,
        code_devise: devise.code_devise || null,
        nom_devise: devise.nom_devise || null
      };
    });
    
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

module.exports = { getDashboardStats, getRecentTransactions, getStatsByCategorie };

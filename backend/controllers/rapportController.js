const { Transaction, Compte, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Récupérer les comptes de l'utilisateur
 */
const getComptesByUser = async (userId) => {
  const { getComptesByUser: getComptes } = require('./compteController');
  return await getComptes(userId);
};

/**
 * Rapport mensuel détaillé
 */
const getRapportMensuel = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { mois, annee } = req.query;
    
    const moisNum = parseInt(mois) || new Date().getMonth() + 1;
    const anneeNum = parseInt(annee) || new Date().getFullYear();
    
    const debutMois = new Date(anneeNum, moisNum - 1, 1);
    const finMois = new Date(anneeNum, moisNum, 0, 23, 59, 59, 999);
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (compteIds.length === 0) {
      return res.json({ transactions: [], revenus: 0, depenses: 0, solde: 0 });
    }
    
    const transactions = await Transaction.findAll({
      where: {
        id_compte: { [Op.in]: compteIds },
        date_transaction: { [Op.between]: [debutMois, finMois] }
      },
      order: [['date_transaction', 'DESC']]
    });
    
    let revenus = 0;
    let depenses = 0;
    
    const transactionsFormatees = transactions.map(t => {
      const montant = parseFloat(t.montant);
      if (t.type_flux === 'Revenu') {
        revenus += montant;
      } else {
        depenses += montant;
      }
      return {
        id: t.id_transaction,
        date: t.date_transaction,
        description: t.description || '',
        categorie: t.categorie,
        montant: montant,
        type: t.type_flux === 'Revenu' ? 'income' : 'expense'
      };
    });
    
    // Dépenses par catégorie
    const depensesParCategorie = {};
    transactions.filter(t => t.type_flux === 'Depense').forEach(t => {
      const cat = t.categorie || 'Non catégorisé';
      depensesParCategorie[cat] = (depensesParCategorie[cat] || 0) + parseFloat(t.montant);
    });
    
    // Transactions par jour
    const transactionsParJour = {};
    transactions.forEach(t => {
      const jour = new Date(t.date_transaction).getDate();
      if (!transactionsParJour[jour]) {
        transactionsParJour[jour] = { revenus: 0, depenses: 0 };
      }
      if (t.type_flux === 'Revenu') {
        transactionsParJour[jour].revenus += parseFloat(t.montant);
      } else {
        transactionsParJour[jour].depenses += parseFloat(t.montant);
      }
    });
    
    res.json({
      periode: `${moisNum}/${anneeNum}`,
      revenus,
      depenses,
      solde: revenus - depenses,
      transactions: transactionsFormatees,
      depensesParCategorie,
      transactionsParJour,
      nombreTransactions: transactions.length
    });
  } catch (error) {
    console.error('Erreur rapport mensuel:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Rapport annuel
 */
const getRapportAnnuel = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { annee } = req.query;
    const anneeNum = parseInt(annee) || new Date().getFullYear();
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (compteIds.length === 0) {
      return res.json({ mensuel: [], totalRevenus: 0, totalDepenses: 0, economie: 0 });
    }
    
    const moisData = [];
    let totalRevenus = 0;
    let totalDepenses = 0;
    
    for (let i = 0; i < 12; i++) {
      const debutMois = new Date(anneeNum, i, 1);
      const finMois = new Date(anneeNum, i + 1, 0, 23, 59, 59, 999);
      
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
      
      const revenusVal = revenus || 0;
      const depensesVal = depenses || 0;
      
      totalRevenus += revenusVal;
      totalDepenses += depensesVal;
      
      moisData.push({
        mois: i + 1,
        nomMois: new Date(anneeNum, i, 1).toLocaleString('fr-FR', { month: 'long' }),
        revenus: revenusVal,
        depenses: depensesVal,
        economie: revenusVal - depensesVal
      });
    }
    
    res.json({
      annee: anneeNum,
      mensuel: moisData,
      totalRevenus,
      totalDepenses,
      economie: totalRevenus - totalDepenses,
      meilleurMois: moisData.reduce((best, m) => m.economie > best.economie ? m : best, moisData[0]),
      pireMois: moisData.reduce((worst, m) => m.economie < worst.economie ? m : worst, moisData[0])
    });
  } catch (error) {
    console.error('Erreur rapport annuel:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Rapport par catégorie
 */
const getRapportParCategorie = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { periode = 'month' } = req.query;
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (compteIds.length === 0) {
      return res.json({ categories: [] });
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
    
    const categories = await Transaction.findAll({
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
    
    const totalDepenses = categories.reduce((sum, c) => sum + parseFloat(c.total), 0);
    
    const categoriesFormatees = categories
      .filter(c => c.categorie)
      .map(c => ({
        nom: c.categorie,
        total: parseFloat(c.total),
        pourcentage: totalDepenses > 0 ? (parseFloat(c.total) / totalDepenses) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
    
    res.json({ categories: categoriesFormatees, totalDepenses });
  } catch (error) {
    console.error('Erreur rapport par catégorie:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export CSV
 */
const exportTransactionsCSV = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { date_debut, date_fin } = req.query;
    
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    const where = { id_compte: { [Op.in]: compteIds } };
    
    if (date_debut && date_fin) {
      where.date_transaction = {
        [Op.between]: [new Date(date_debut), new Date(date_fin)]
      };
    }
    
    const transactions = await Transaction.findAll({
      where,
      order: [['date_transaction', 'DESC']]
    });
    
    let csv = 'Date,Description,Type,Catégorie,Montant (FCFA)\n';
    
    transactions.forEach(t => {
      csv += `${new Date(t.date_transaction).toLocaleDateString()},`;
      csv += `"${(t.description || '').replace(/"/g, '""')}",`;
      csv += `${t.type_flux === 'Revenu' ? 'Revenu' : 'Dépense'},`;
      csv += `${t.categorie || 'Non catégorisé'},`;
      csv += `${parseFloat(t.montant)}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Erreur export CSV:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRapportMensuel,
  getRapportAnnuel,
  getRapportParCategorie,
  exportTransactionsCSV
};
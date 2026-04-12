const { Transaction, Compte, sequelize } = require('../models');
const { Op } = require('sequelize');

// Rapport mensuel
const getRapportMensuel = async (req, res) => {
  try {
    const { annee, mois, id_menage } = req.query;
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);
    
    const comptes = await Compte.findAll({ where: { id_menage } });
    const idsComptes = comptes.map(c => c.id_compte);
    
    const transactions = await Transaction.findAll({
      where: {
        id_compte: { [Op.in]: idsComptes },
        date_transaction: { [Op.between]: [dateDebut, dateFin] }
      }
    });
    
    const revenus = transactions.filter(t => t.type_flux === 'Revenu')
      .reduce((sum, t) => sum + parseFloat(t.montant), 0);
    const depenses = transactions.filter(t => t.type_flux === 'Depense')
      .reduce((sum, t) => sum + parseFloat(t.montant), 0);
    
    const depensesParCategorie = {};
    transactions.filter(t => t.type_flux === 'Depense').forEach(t => {
      const cat = t.categorie || 'Non catégorisé';
      depensesParCategorie[cat] = (depensesParCategorie[cat] || 0) + parseFloat(t.montant);
    });
    
    res.json({
      periode: `${mois}/${annee}`,
      revenus,
      depenses,
      economie: revenus - depenses,
      depensesParCategorie
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rapport annuel
const getRapportAnnuel = async (req, res) => {
  try {
    const { annee, id_menage } = req.query;
    
    const comptes = await Compte.findAll({ where: { id_menage } });
    const idsComptes = comptes.map(c => c.id_compte);
    
    const transactions = await Transaction.findAll({
      where: {
        id_compte: { [Op.in]: idsComptes },
        date_transaction: {
          [Op.between]: [new Date(annee, 0, 1), new Date(annee, 11, 31)]
        }
      }
    });
    
    const revenusMensuels = Array(12).fill(0);
    const depensesMensuelles = Array(12).fill(0);
    
    transactions.forEach(t => {
      const mois = new Date(t.date_transaction).getMonth();
      const montant = parseFloat(t.montant);
      if (t.type_flux === 'Revenu') {
        revenusMensuels[mois] += montant;
      } else {
        depensesMensuelles[mois] += montant;
      }
    });
    
    const totalRevenus = revenusMensuels.reduce((a, b) => a + b, 0);
    const totalDepenses = depensesMensuelles.reduce((a, b) => a + b, 0);
    
    res.json({
      annee,
      totalRevenus,
      totalDepenses,
      economie: totalRevenus - totalDepenses,
      revenusMensuels,
      depensesMensuelles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export CSV
const exportTransactionsCSV = async (req, res) => {
  try {
    const { id_compte, date_debut, date_fin } = req.query;
    
    const where = {};
    if (id_compte) where.id_compte = id_compte;
    if (date_debut && date_fin) {
      where.date_transaction = { [Op.between]: [date_debut, date_fin] };
    }
    
    const transactions = await Transaction.findAll({ where });
    
    let csv = 'ID,Date,Montant,Type,Catégorie,Description\n';
    transactions.forEach(t => {
      csv += `${t.id_transaction},${t.date_transaction},${t.montant},${t.type_flux},${t.categorie || ''},${t.description || ''}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRapportMensuel,
  getRapportAnnuel,
  exportTransactionsCSV
};
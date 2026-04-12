const { Transaction } = require('../models');
const { Op } = require('sequelize');

// Obtenir toutes les catégories uniques
const getCategories = async (req, res) => {
  try {
    const categories = await Transaction.findAll({
      attributes: ['categorie'],
      where: {
        categorie: { [Op.ne]: null }
      },
      group: ['categorie']
    });
    
    res.json(categories.map(c => c.categorie));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dépenses par catégorie
const getDepensesParCategorie = async (req, res) => {
  try {
    const { id_menage, periode } = req.query;
    
    let dateCondition = {};
    if (periode === 'month') {
      dateCondition = {
        date_transaction: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      };
    }
    
    const depenses = await Transaction.findAll({
      attributes: [
        'categorie',
        [sequelize.fn('SUM', sequelize.col('montant')), 'total']
      ],
      where: {
        type_flux: 'Depense',
        ...dateCondition
      },
      group: ['categorie']
    });
    
    res.json(depenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getDepensesParCategorie
};
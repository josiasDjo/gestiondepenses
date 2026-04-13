const { Transaction, Compte, Categorie, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Récupérer les comptes de l'utilisateur via ses ménages
 */
const getComptesByUser = async (userId) => {
  const { getComptesByUser: getComptes } = require('./compteController');
  return await getComptes(userId);
};

/**
 * Créer une transaction
 */
const createTransaction = async (req, res) => {
  try {
    const { montant, description, type_flux, categorie, date_transaction, id_compte } = req.body;
    const userId = req.user.id_utilisateur;

    // Vérifier que le compte appartient à l'utilisateur
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    
    if (!compteIds.includes(parseInt(id_compte))) {
      return res.status(403).json({ message: 'Accès non autorisé à ce compte' });
    }

    const transaction = await Transaction.create({
      montant,
      description,
      type_flux,
      categorie: categorie || 'Non catégorisé',
      date_transaction: date_transaction || new Date(),
      id_compte
    });

    // Mettre à jour le solde du compte
    const compte = await Compte.findByPk(id_compte);
    if (compte) {
      const nouveauSolde = type_flux === 'Revenu' 
        ? parseFloat(compte.solde) + parseFloat(montant)
        : parseFloat(compte.solde) - parseFloat(montant);
      await compte.update({ solde: nouveauSolde });
    }

    res.status(201).json({
      success: true,
      message: 'Transaction ajoutée avec succès',
      transaction
    });
  } catch (error) {
    console.error('Erreur création transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer toutes les transactions de l'utilisateur
 */
const getMesTransactions = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { page = 1, limit = 20, type, categorie, date_debut, date_fin } = req.query;

    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);

    if (compteIds.length === 0) {
      return res.json({ transactions: [], total: 0, page: 1, totalPages: 0 });
    }

    // Construire les filtres
    const where = { id_compte: { [Op.in]: compteIds } };
    
    if (type && type !== 'all') {
      where.type_flux = type === 'income' ? 'Revenu' : 'Depense';
    }
    
    if (categorie && categorie !== 'all') {
      where.categorie = categorie;
    }
    
    if (date_debut && date_fin) {
      where.date_transaction = {
        [Op.between]: [new Date(date_debut), new Date(date_fin)]
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Compte,
          as: 'compte',
          attributes: ['id_compte', 'nom_compte', 'type_compte']
        }
      ],
      order: [['date_transaction', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const transactions = rows.map(transaction => ({
      id: transaction.id_transaction,
      montant: parseFloat(transaction.montant),
      date: transaction.date_transaction,
      description: transaction.description || '',
      categorie: transaction.categorie,
      type: transaction.type_flux === 'Revenu' ? 'income' : 'expense',
      compte: transaction.compte
    }));

    res.json({
      transactions,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer les statistiques des transactions
 */
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    const { periode = 'month' } = req.query;

    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);

    if (compteIds.length === 0) {
      return res.json({ revenus: 0, depenses: 0, solde: 0, categories: [] });
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

    const revenus = await Transaction.sum('montant', {
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Revenu',
        ...dateCondition
      }
    });

    const depenses = await Transaction.sum('montant', {
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Depense',
        ...dateCondition
      }
    });

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

    res.json({
      revenus: revenus || 0,
      depenses: depenses || 0,
      solde: (revenus || 0) - (depenses || 0),
      categories: categories.filter(c => c.categorie).map(c => ({
        nom: c.categorie,
        total: parseFloat(c.total),
        pourcentage: depenses > 0 ? (parseFloat(c.total) / depenses) * 100 : 0
      }))
    });
  } catch (error) {
    console.error('Erreur stats transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mettre à jour une transaction
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { montant, description, categorie, date_transaction } = req.body;
    const userId = req.user.id_utilisateur;

    const transaction = await Transaction.findByPk(id, {
      include: [{ model: Compte, as: 'compte' }]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    // Vérifier l'accès
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    if (!compteIds.includes(transaction.id_compte)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const ancienMontant = transaction.montant;
    const ancienType = transaction.type_flux;

    await transaction.update({
      montant: montant || transaction.montant,
      description: description !== undefined ? description : transaction.description,
      categorie: categorie || transaction.categorie,
      date_transaction: date_transaction || transaction.date_transaction
    });

    // Ajuster le solde du compte si nécessaire
    if (montant && montant !== ancienMontant) {
      const compte = await Compte.findByPk(transaction.id_compte);
      if (compte) {
        let nouveauSolde = parseFloat(compte.solde);
        if (ancienType === 'Revenu') {
          nouveauSolde -= ancienMontant;
          nouveauSolde += parseFloat(montant);
        } else {
          nouveauSolde += ancienMontant;
          nouveauSolde -= parseFloat(montant);
        }
        await compte.update({ solde: nouveauSolde });
      }
    }

    res.json({ success: true, message: 'Transaction modifiée', transaction });
  } catch (error) {
    console.error('Erreur mise à jour transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Supprimer une transaction
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_utilisateur;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    // Vérifier l'accès
    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    if (!compteIds.includes(transaction.id_compte)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Ajuster le solde du compte
    const compte = await Compte.findByPk(transaction.id_compte);
    if (compte) {
      const nouveauSolde = transaction.type_flux === 'Revenu'
        ? parseFloat(compte.solde) - parseFloat(transaction.montant)
        : parseFloat(compte.solde) + parseFloat(transaction.montant);
      await compte.update({ solde: nouveauSolde });
    }

    await transaction.destroy();

    res.json({ success: true, message: 'Transaction supprimée' });
  } catch (error) {
    console.error('Erreur suppression transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTransaction,
  getMesTransactions,
  getTransactionStats,
  updateTransaction,
  deleteTransaction
};
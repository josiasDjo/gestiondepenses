const { Op } = require('sequelize');
const { getUserFromToken } = require('../utils/auth');
const { getComptesByUser } = require('../utils/compteUtils'); // ← Importer depuis utils
const db = require('../models');

const Transaction = db.Transaction;
const Compte = db.Compte;

/**
 * Créer une transaction
 */
const createTransaction = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    const { montant, description, type_flux, categorie, date_transaction, id_compte } = req.body;

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
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    const { page = 1, limit = 20, type, categorie, date_debut, date_fin } = req.query;

    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);

    if (compteIds.length === 0) {
      return res.json({ transactions: [], total: 0, page: 1, totalPages: 0 });
    }

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
          include: [
            {
              model: db.Devise,
              as: 'devise',
              attributes: ['id_devise', 'code_devise', 'nom_devise']
            }
          ],
          attributes: ['id_compte', 'nom_compte', 'type_compte', 'id_devise']
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
      compte: {
        id_compte: transaction.compte.id_compte,
        nom_compte: transaction.compte.nom_compte,
        type_compte: transaction.compte.type_compte,
        id_devise: transaction.compte.id_devise,
        devise: transaction.compte.devise ? {
          id_devise: transaction.compte.devise.id_devise,
          code_devise: transaction.compte.devise.code_devise,
          nom_devise: transaction.compte.devise.nom_devise
        } : null
      }
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
 * Récupérer les statistiques des transactions par devise
 */
const getTransactionStats = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    const { periode = 'month' } = req.query;

    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);

    if (compteIds.length === 0) {
      return res.json({ 
        global: { revenus: 0, depenses: 0, solde: 0 },
        parDevise: [],
        categories: []
      });
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

    // Récupérer les comptes avec leur devise
    const comptesAvecDevise = await Compte.findAll({
      where: { id_compte: { [Op.in]: compteIds } },
      include: [{ model: db.Devise, as: 'devise' }]
    });

    // Grouper les comptes par devise
    const comptesParDevise = {};
    for (const compte of comptesAvecDevise) {
      const deviseId = compte.id_devise || 'sans_devise';
      if (!comptesParDevise[deviseId]) {
        comptesParDevise[deviseId] = {
          deviseId: compte.id_devise,
          deviseCode: compte.devise?.code_devise || 'N/A',
          deviseNom: compte.devise?.nom_devise || 'Sans devise',
          compteIds: []
        };
      }
      comptesParDevise[deviseId].compteIds.push(compte.id_compte);
    }

    // Calculer les statistiques globales
    const revenusGlobal = await Transaction.sum('montant', {
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Revenu',
        ...dateCondition
      }
    });

    const depensesGlobal = await Transaction.sum('montant', {
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Depense',
        ...dateCondition
      }
    });

    // Calculer les statistiques par devise
    const statsParDevise = [];
    for (const [deviseId, deviseInfo] of Object.entries(comptesParDevise)) {
      const revenus = await Transaction.sum('montant', {
        where: {
          id_compte: { [Op.in]: deviseInfo.compteIds },
          type_flux: 'Revenu',
          ...dateCondition
        }
      });

      const depenses = await Transaction.sum('montant', {
        where: {
          id_compte: { [Op.in]: deviseInfo.compteIds },
          type_flux: 'Depense',
          ...dateCondition
        }
      });

      statsParDevise.push({
        id_devise: deviseInfo.deviseId,
        code_devise: deviseInfo.deviseCode,
        nom_devise: deviseInfo.deviseNom,
        revenus: revenus || 0,
        depenses: depenses || 0,
        solde: (revenus || 0) - (depenses || 0)
      });
    }

    // Récupérer les catégories avec leur devise associée
    const categoriesParDevise = await Transaction.findAll({
      attributes: [
        'categorie',
        'id_compte',
        [db.sequelize.fn('SUM', db.sequelize.col('montant')), 'total']
      ],
      where: {
        id_compte: { [Op.in]: compteIds },
        type_flux: 'Depense',
        ...dateCondition
      },
      group: ['categorie', 'id_compte'],
      raw: true
    });

    // Enrichir les catégories avec les infos de devise
    const categoriesEnrichies = [];
    for (const cat of categoriesParDevise) {
      const compte = comptesAvecDevise.find(c => c.id_compte === cat.id_compte);
      categoriesEnrichies.push({
        nom: cat.categorie || 'Non catégorisé',
        total: parseFloat(cat.total),
        id_devise: compte?.id_devise || null,
        code_devise: compte?.devise?.code_devise || 'N/A',
        id_compte: cat.id_compte
      });
    }

    // Regrouper les catégories par nom et devise
    const categoriesRegroupees = {};
    for (const cat of categoriesEnrichies) {
      const key = `${cat.nom}_${cat.id_devise}`;
      if (!categoriesRegroupees[key]) {
        categoriesRegroupees[key] = {
          nom: cat.nom,
          id_devise: cat.id_devise,
          code_devise: cat.code_devise,
          total: 0
        };
      }
      categoriesRegroupees[key].total += cat.total;
    }

    const categoriesFinales = Object.values(categoriesRegroupees).map(c => ({
      ...c,
      pourcentage: depensesGlobal > 0 ? (c.total / depensesGlobal) * 100 : 0
    }));

    res.json({
      global: {
        revenus: revenusGlobal || 0,
        depenses: depensesGlobal || 0,
        solde: (revenusGlobal || 0) - (depensesGlobal || 0)
      },
      parDevise: statsParDevise,
      categories: categoriesFinales,
      periode
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
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    const { id } = req.params;
    const { montant, description, categorie, date_transaction } = req.body;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

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
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    const comptes = await getComptesByUser(userId);
    const compteIds = comptes.map(c => c.id_compte);
    if (!compteIds.includes(transaction.id_compte)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

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
// const { Menage, MembresMenage } = require('../models');
const Compte = require('../models/Compte')
const Transaction = require('../models/Transaction')
const Devise = require('../models/Devise')
const Menage = require('../models/Menage')
const MembresMenage = require('../models/Membres_menage')
const { getUserFromToken } = require('../utils/auth')

const { Op } = require('sequelize');

/**
 * Récupérer les ménages de l'utilisateur
 */
const getMenagesByUser = async (userId) => {
  const membresMenages = await MembresMenage.findAll({
    where: { id_utilisateur: userId },
    attributes: ['id_menage']
  });
  return membresMenages.map(m => m.id_menage);
};

// Vérifier que l'utilisateur est membre de ce ménage
const estMembreDuMenage = async (id_utilisateur, id_menage) => {
    try {
        const membre = await MembresMenage.findOne({
            utilisateur_id: id_utilisateur,
            menage_id: id_menage
        });
        
        return membre !== null;
    } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        return false;
    }
};

/**
 * Créer un nouveau compte
 */
const createCompte = async (req, res) => {
  try {
    // Récupérer l'utilisateur à partir du token
    const user = await getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;

    const { nom_compte, type_compte, solde_initial, id_devise, id_menage } = req.body;

    // Vérifier que l'utilisateur est membre de ce ménage
    const menageIds = await estMembreDuMenage(userId, id_menage);
    if (!menageIds) {
      return res.status(403).json({ message: 'Vous n\'êtes pas membre de ce ménage' });
    }
    
    const compte = await Compte.create({
      nom_compte,
      type_compte,
      solde: solde_initial || 0,
      id_devise: id_devise || null,
      id_menage: id_menage
    });
    
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      compte
    });
  } catch (error) {
    console.error('Erreur création compte:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer tous les comptes de l'utilisateur via ses ménages
 */
const getMesComptes = async (req, res) => {
  try {
    // Récupérer l'utilisateur à partir du token
    const user = await getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;

    const menageIds = await getMenagesByUser(userId);
    
    if (menageIds.length === 0) {
      return res.json([]);
    }
    
    const comptes = await Compte.findAll({
      where: { id_menage: { [Op.in]: menageIds } },
      order: [['created_at', 'DESC']]
    });
    
    // Calculer les statistiques pour chaque compte
    const comptesAvecStats = await Promise.all(comptes.map(async (compte) => {
      const dernieresTransactions = await Transaction.findAll({
        where: { id_compte: compte.id_compte },
        order: [['date_transaction', 'DESC']],
        limit: 5
      });
      
      const debutMois = new Date();
      debutMois.setDate(1);
      debutMois.setHours(0, 0, 0, 0);
      
      const revenusMois = await Transaction.sum('montant', {
        where: {
          id_compte: compte.id_compte,
          type_flux: 'Revenu',
          date_transaction: { [Op.gte]: debutMois }
        }
      });
      
      const depensesMois = await Transaction.sum('montant', {
        where: {
          id_compte: compte.id_compte,
          type_flux: 'Depense',
          date_transaction: { [Op.gte]: debutMois }
        }
      });
      
      return {
        ...compte.toJSON(),
        revenus_mois: revenusMois || 0,
        depenses_mois: depensesMois || 0,
        dernieres_transactions: dernieresTransactions
      };
    }));
    
    res.json(comptesAvecStats);
  } catch (error) {
    console.error('Erreur récupération comptes:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Récupérer un compte par son ID
 */
const getCompteById = async (req, res) => {
  try {
    // Récupérer l'utilisateur à partir du token
    const user = await getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    console.log('Utilisateur ID:', userId);

    const { id } = req.params;
    
    const menageIds = await getMenagesByUser(userId);
    
    const compte = await Compte.findOne({
      where: { 
        id_compte: id,
        id_menage: { [Op.in]: menageIds }
      },
      include: [
        { model: Devise, as: 'devise' },
        { model: Menage, as: 'menage' }
      ]
    });
    
    if (!compte) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }
    
    const transactions = await Transaction.findAll({
      where: { id_compte: id },
      order: [['date_transaction', 'DESC']],
      limit: 20
    });
    
    res.json({ compte, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mettre à jour un compte
 */
const updateCompte = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_compte, type_compte } = req.body;

    // Récupérer l'utilisateur à partir du token
    const user = await getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = user.id_utilisateur;
    
    const menageIds = await getMenagesByUser(userId);
    
    const compte = await Compte.findOne({
      where: { 
        id_compte: id,
        id_menage: { [Op.in]: menageIds }
      }
    });
    
    if (!compte) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }
    
    await compte.update({
      nom_compte: nom_compte || compte.nom_compte,
      type_compte: type_compte || compte.type_compte
    });
    
    res.json({ success: true, message: 'Compte mis à jour', compte });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Supprimer un compte
 */
const deleteCompte = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req);
    const userId = user.id_utilisateur;
    
    const menageIds = await getMenagesByUser(userId);
    
    const compte = await Compte.findOne({
      where: { 
        id_compte: id,
        id_menage: { [Op.in]: menageIds }
      }
    });
    
    if (!compte) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }
    
    const transactionCount = await Transaction.count({
      where: { id_compte: id }
    });
    
    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer ce compte car il contient des transactions' 
      });
    }
    
    await compte.destroy();
    res.json({ success: true, message: 'Compte supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Résumé des comptes
 */
const getSoldeTotal = async (req, res) => {
  try {
    const userId = req.user.id_utilisateur;
    
    const menageIds = await getMenagesByUser(userId);
    
    if (menageIds.length === 0) {
      return res.json({ solde_total: 0, comptes: [], nombre_comptes: 0 });
    }
    
    const comptes = await Compte.findAll({
      where: { id_menage: { [Op.in]: menageIds } },
      attributes: ['id_compte', 'nom_compte', 'solde', 'type_compte']
    });
    
    const soldeTotal = comptes.reduce((total, compte) => total + parseFloat(compte.solde), 0);
    
    res.json({
      solde_total: soldeTotal,
      comptes,
      nombre_comptes: comptes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompte,
  getMesComptes,
  getCompteById,
  updateCompte,
  deleteCompte,
  getSoldeTotal,
  getMenagesByUser
};
const { Compte, Transaction, Devise } = require('../models');

// Créer un compte
const createCompte = async (req, res) => {
  try {
    const compte = await Compte.create(req.body);
    res.status(201).json(compte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir tous les comptes d'un ménage
const getComptesByMenage = async (req, res) => {
  try {
    const { id_menage } = req.params;
    const comptes = await Compte.findAll({
      where: { id_menage },
      include: ['devise', 'transactions']
    });
    res.json(comptes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un compte par ID
const getCompteById = async (req, res) => {
  try {
    const { id_compte } = req.params;
    const compte = await Compte.findByPk(id_compte, {
      include: ['devise', 'transactions']
    });
    
    if (!compte) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }
    
    res.json(compte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un compte
const updateCompte = async (req, res) => {
  try {
    const { id_compte } = req.params;
    const compte = await Compte.findByPk(id_compte);
    
    if (!compte) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }
    
    await compte.update(req.body);
    res.json(compte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un compte
const deleteCompte = async (req, res) => {
  try {
    const { id_compte } = req.params;
    const compte = await Compte.findByPk(id_compte);
    
    if (!compte) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }
    
    await compte.destroy();
    res.json({ message: 'Compte supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Solde total des comptes d'un ménage
const getSoldeTotal = async (req, res) => {
  try {
    const { id_menage } = req.params;
    const comptes = await Compte.findAll({
      where: { id_menage },
      attributes: ['id_compte', 'nom_compte', 'solde']
    });
    
    const soldeTotal = comptes.reduce((total, compte) => total + parseFloat(compte.solde), 0);
    
    res.json({
      solde_total: soldeTotal,
      comptes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createCompte,
    getComptesByMenage,
    getCompteById,
    updateCompte,
    deleteCompte,
    getSoldeTotal
};
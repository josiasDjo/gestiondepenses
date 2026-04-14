const { Op } = require('sequelize');
const db = require('../models');

const getComptesByUser = async (userId) => {
  try {
    const MembresMenage = db.MembresMenage;
    const Compte = db.Compte;
    
    if (!MembresMenage || !Compte) {
      console.error('❌ Modèles non chargés dans compteUtils');
      console.log('Modèles disponibles:', Object.keys(db));
      return [];
    }
    
    const membres = await MembresMenage.findAll({
      where: { id_utilisateur: userId },
      attributes: ['id_menage']
    });
    
    if (!membres || membres.length === 0) {
      return [];
    }
    
    const menageIds = membres.map(m => m.id_menage);
    
    const comptes = await Compte.findAll({
      where: { id_menage: { [Op.in]: menageIds } },
      attributes: ['id_compte', 'nom_compte', 'solde', 'type_compte']
    });
    
    return comptes || [];
  } catch (error) {
    console.error('Erreur getComptesByUser:', error.message);
    return [];
  }
};

module.exports = { getComptesByUser };
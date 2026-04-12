const { Membres_menage, Utilisateur, Menage } = require('../models');

// Ajouter un membre à un ménage
const ajouterMembre = async (req, res) => {
  try {
    const { id_menage, id_utilisateur } = req.body;
    
    const association = await Membres_menage.create({
      id_menage,
      id_utilisateur
    });
    
    res.status(201).json(association);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retirer un membre
const retirerMembre = async (req, res) => {
  try {
    const { id_menage, id_utilisateur } = req.params;
    
    await Membres_menage.destroy({
      where: { id_menage, id_utilisateur }
    });
    
    res.json({ message: 'Membre retiré du ménage' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir tous les membres d'un ménage
const getMembresByMenage = async (req, res) => {
  try {
    const { id_menage } = req.params;
    
    const membres = await Membres_menage.findAll({
      where: { id_menage },
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['id_utilisateur', 'nom', 'email'] }
      ]
    });
    
    res.json(membres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  ajouterMembre,
  retirerMembre,
  getMembresByMenage
};
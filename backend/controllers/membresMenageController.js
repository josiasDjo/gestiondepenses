const MembresMenage  = require('../models/Membres_menage');

const creerAssociation = async (id_utilisateur, id_menage, role = 'member') => {
  try {
    console.log(`Test menage data assoc : User = ${id_utilisateur}, Menage = ${id_menage}, Role = ${role}`)

    // Vérifier si l'association existe déjà
    const associationExistante = await MembresMenage.findOne({
      where: { id_utilisateur, id_menage }
    });
    
    console.log(`Test menage data assoc : User = ${id_utilisateur}, Menage = ${id_menage}, Role = ${role}`)
    if (associationExistante) {
      console.log(`Association déjà existante entre utilisateur ${id_utilisateur} et ménage ${id_menage}`);
      return associationExistante;
    }
    
    // Créer la nouvelle association
    const association = await MembresMenage.create({
      id_utilisateur,
      id_menage,
      role,
      date_adhesion: new Date()
    });
    
    console.log(`✅ Association créée: Utilisateur ${id_utilisateur} -> Ménage ${id_menage} (${role})`);
    return association;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'association:', error);
    throw error;
  }
};

const supprimerAssociation = async (id_utilisateur, id_menage) => {
  try {
    const deleted = await MembresMenage.destroy({
      where: { id_utilisateur, id_menage }
    });
    
    if (deleted) {
      console.log(`✅ Association supprimée: Utilisateur ${id_utilisateur} -> Ménage ${id_menage}`);
    }
    return deleted;
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'association:', error);
    throw error;
  }
};

/**
 * Récupérer tous les membres d'un ménage
 */
const getMembresByMenage = async (id_menage) => {
  try {
    const membres = await MembresMenage.findAll({
      where: { id_menage },
      include: [
        { model: require('../models').Utilisateur, as: 'utilisateur', attributes: ['id_utilisateur', 'nom', 'email', 'avatar'] }
      ]
    });
    return membres;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

/**
 * Récupérer tous les ménages d'un utilisateur
 */
const getMenagesByUtilisateur = async (id_utilisateur) => {
  try {
    const menages = await MembresMenage.findAll({
      where: { id_utilisateur },
      include: [
        { model: require('../models').Menage, as: 'menage' }
      ]
    });
    return menages;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des ménages:', error);
    throw error;
  }
};

/**
 * Vérifier si un utilisateur est membre d'un ménage
 */
const estMembre = async (id_utilisateur, id_menage) => {
  try {
    const association = await MembresMenage.findOne({
      where: { id_utilisateur, id_menage }
    });
    return !!association;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return false;
  }
};

const mettreAJourRole = async (id_utilisateur, id_menage, role) => {
  try {
    const association = await MembresMenage.findOne({
      where: { id_utilisateur, id_menage }
    });
    
    if (!association) {
      throw new Error('Association non trouvée');
    }
    
    association.role = role;
    await association.save();
    
    console.log(`✅ Rôle mis à jour: Utilisateur ${id_utilisateur} -> ${role} dans ménage ${id_menage}`);
    return association;
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du rôle:', error);
    throw error;
  }
};

module.exports = {
  creerAssociation,
  supprimerAssociation,
  getMembresByMenage,
  getMenagesByUtilisateur,
  estMembre,
  mettreAJourRole
};
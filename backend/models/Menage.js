const { DataTypes } = require('sequelize');
const sequelize = require('./database'); 

const Menage = sequelize.define('Menage', {
  id_menage: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_menage: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_devise_principale: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'devises', key: 'id_devise' }
  }
}, {
  tableName: 'menages',
  timestamps: false
});

Menage.associate = (models) => {
  // Vérifier que les modèles existent avant d'établir les associations
  if (models.Devise) {
    Menage.belongsTo(models.Devise, {
      foreignKey: 'id_devise_principale',
      as: 'devisePrincipale'
    });
  }
  
  if (models.Utilisateur) {
    Menage.belongsToMany(models.Utilisateur, {
      through: 'membres_menage',
      foreignKey: 'id_menage',
      otherKey: 'id_utilisateur',
      as: 'membres'
    });
  }
  
  if (models.Compte) {
    Menage.hasMany(models.Compte, {
      foreignKey: 'id_menage',
      as: 'comptes'
    });
  }
  
  if (models.Budget) {
    Menage.hasMany(models.Budget, {
      foreignKey: 'id_menage',
      as: 'budgets'
    });
  }
  
  if (models.Patrimoine) {
    Menage.hasMany(models.Patrimoine, {
      foreignKey: 'id_menage',
      as: 'patrimoines'
    });
  }
};

module.exports = Menage;
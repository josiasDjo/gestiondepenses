const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Compte = sequelize.define('Compte', {
  id_compte: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_compte: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  type_compte: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  solde: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  id_devise: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'devises', key: 'id_devise' }
  },
  id_menage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'menages', key: 'id_menage' }
  }
}, {
  tableName: 'comptes',
  timestamps: false
});

Compte.associate = (models) => {
  if (models.Devise) {
    Compte.belongsTo(models.Devise, {
      foreignKey: 'id_devise',
      as: 'devise'
    });
  }
  
  if (models.Menage) {
    Compte.belongsTo(models.Menage, {
      foreignKey: 'id_menage',
      as: 'menage'
    });
  }
  
  if (models.Transaction) {
    Compte.hasMany(models.Transaction, {
      foreignKey: 'id_compte',
      as: 'transactions'
    });
  }
};

module.exports = Compte;
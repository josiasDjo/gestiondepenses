const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const Utilisateur = sequelize.define('Utilisateur', {
    id_utilisateur: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: {isEmail: true}},
    mot_de_passe: { type: DataTypes.STRING(255), allowNull: true },
    google_id: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    avatar: { type: DataTypes.STRING(255), allowNull: true },
    provider: { type: DataTypes.ENUM('local', 'google'), defaultValue: 'local'},
    email_verifie: { type: DataTypes.BOOLEAN, defaultValue: false}
  }, {
    tableName: 'utilisateurs',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.mot_de_passe && user.provider === 'local') {
          user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('mot_de_passe') && user.mot_de_passe) {
          user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
        }
      }
    }
  });

  Utilisateur.prototype.verifierMotDePasse = async function(password) {
    if (!this.mot_de_passe) return false;
    return await bcrypt.compare(password, this.mot_de_passe);
  };

  Utilisateur.associate = (models) => {
    Utilisateur.belongsToMany(models.Menage, {
      through: 'membres_menage',
      foreignKey: 'id_utilisateur',
      otherKey: 'id_menage',
      as: 'menages'
    });
  };


module.exports = Utilisateur;
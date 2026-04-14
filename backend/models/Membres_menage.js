const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// module.exports = (sequelize, DataTypes) => {
    const MembresMenage = sequelize.define("MembresMenage", {
        id_utilisateur: {type: DataTypes.INTEGER,primaryKey: true,references: { model: "utilisateurs", key: "id_utilisateur" }, },
        id_menage: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "menages", key: "id_menage" }, },
        role: { type: DataTypes.ENUM("admin", "member"), defaultValue: "member" },
        date_adhesion: {  type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: "membres_menage",
        timestamps: false,
        underscored: true,
    });

  MembresMenage.associate = (models) => {
    MembresMenage.belongsTo(models.Utilisateur, {
      foreignKey: "id_utilisateur",
      as: "utilisateur",
    });

    MembresMenage.belongsTo(models.Menage, {
      foreignKey: "id_menage",
      as: "menage",
    });
  };

//   return MembresMenage;  
// };

module.exports = MembresMenage
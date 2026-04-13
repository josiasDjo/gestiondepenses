module.exports = (sequelize, DataTypes) => {
  const Patrimoine = sequelize.define('Patrimoine', {
    id_patrimoine: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    type_engagement: {type: DataTypes.ENUM('Dette', 'Creance'),allowNull: false},
    montant: {type: DataTypes.DECIMAL(15, 2),allowNull: false},
    tiers: {type: DataTypes.STRING(100),allowNull: true},
    id_menage: {type: DataTypes.INTEGER,allowNull: true,references: { model: 'menages',key: 'id_menage'}}
  }, {
    tableName: 'patrimoine',
    timestamps: false
  });

  Patrimoine.associate = (models) => {
    Patrimoine.belongsTo(models.Menage, {
      foreignKey: 'id_menage',
      as: 'menage'
    });
  };

  return Patrimoine;
};
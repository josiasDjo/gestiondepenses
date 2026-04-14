const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Alerte = sequelize.define('Alerte', {
        id_alerte: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        message: {type: DataTypes.TEXT,allowNull: true},
        date_alerte: {type: DataTypes.DATE,defaultValue: DataTypes.NOW},
        statut: {type: DataTypes.STRING(20),allowNull: true},
        id_budget: {type: DataTypes.INTEGER,allowNull: true,references: {model: 'budgets',key: 'id_budget'}}
    }, {
        tableName: 'alertes',
        timestamps: false
    });

    Alerte.associate = (models) => {
        Alerte.belongsTo(models.Budget, { foreignKey: 'id_budget',as: 'budget' });
        Alerte.belongsTo(models.Menage, { foreignKey: 'id_menage', as: 'menage' });
};

module.exports = Alerte;
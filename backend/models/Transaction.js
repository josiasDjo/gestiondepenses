const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id_transaction: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        montant: {type: DataTypes.DECIMAL(15, 2),allowNull: false,validate: {isDecimal: true,min: 0.01}},
        date_transaction: {
        type: DataTypes.DATE,defaultValue: DataTypes.NOW},
        description: {type: DataTypes.TEXT,allowNull: true},
        type_flux: {type: DataTypes.ENUM('Revenu', 'Depense'),allowNull: false},
        type_depense: {type: DataTypes.ENUM('Fixe', 'Variable'),allowNull: true},
        categorie: { type: DataTypes.STRING(100),allowNull: true},
        id_compte: {type: DataTypes.INTEGER,allowNull: true,references: {model: 'comptes',key: 'id_compte'}}
    }, {
        tableName: 'transactions',
        timestamps: false
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.Compte, {
        foreignKey: 'id_compte',
        as: 'compte'
        });
    };

//     return Transaction;
// };

module.exports = Transaction
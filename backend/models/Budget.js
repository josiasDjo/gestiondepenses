module.exports = (sequelize, DataTypes) => {
    const Budget = sequelize.define('Budget', {
        id_budget: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        categorie: {
        type: DataTypes.STRING(100),
        allowNull: true
        },
        limite_montant: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
        },
        periode: {
        type: DataTypes.STRING(50),
        allowNull: true
        },
        id_menage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'menages',
            key: 'id_menage'
        }
        }
    }, {
        tableName: 'budgets',
        timestamps: false
    });

    Budget.associate = (models) => {
        Budget.belongsTo(models.Menage, {
        foreignKey: 'id_menage',
        as: 'menage'
        });
        
        Budget.hasMany(models.Alerte, {
        foreignKey: 'id_budget',
        as: 'alertes'
        });
    };

    return Budget;
};
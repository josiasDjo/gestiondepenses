module.exports = (sequelize, DataTypes) => {
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
        references: {
            model: 'devises',
            key: 'id_devise'
        }
        }
    }, {
        tableName: 'menages',
        timestamps: false
    });

    Menage.associate = (models) => {
        Menage.belongsTo(models.Devise, {
        foreignKey: 'id_devise_principale',
        as: 'devisePrincipale'
        });
        
        Menage.belongsToMany(models.Utilisateur, {
        through: 'membres_menage',
        foreignKey: 'id_menage',
        otherKey: 'id_utilisateur',
        as: 'membres'
        });
        
        Menage.hasMany(models.Compte, {
        foreignKey: 'id_menage',
        as: 'comptes'
        });
        
        Menage.hasMany(models.Budget, {
        foreignKey: 'id_menage',
        as: 'budgets'
        });
        
        Menage.hasMany(models.Patrimoine, {
        foreignKey: 'id_menage',
        as: 'patrimoines'
        });
    };

    return Menage;
};
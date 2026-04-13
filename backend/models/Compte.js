module.exports = (sequelize, DataTypes) => {
    const Compte = sequelize.define('Compte', {
        id_compte: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        nom_compte: {type: DataTypes.STRING(50),allowNull: false},
        type_compte: {type: DataTypes.STRING(50),allowNull: true},
        solde: {type: DataTypes.DECIMAL(15, 2),defaultValue: 0.00,validate: {isDecimal: true}},
        id_devise: {type: DataTypes.INTEGER,allowNull: true,references: {model: 'devises',key: 'id_devise'}},
        id_menage: {type: DataTypes.INTEGER,allowNull: true,references: {model: 'menages',key: 'id_menage'}},
    }, {
        tableName: 'comptes',
        timestamps: false
    });

    Compte.associate = (models) => {
        Compte.belongsTo(models.Devise, {
        foreignKey: 'id_devise',
        as: 'devise'
        });
        
        Compte.belongsTo(models.Menage, {
        foreignKey: 'id_menage',
        as: 'menage'
        });
        
        Compte.hasMany(models.Transaction, {
        foreignKey: 'id_compte',
        as: 'transactions'
        });
    };
    
    // Méthode pour mettre à jour le solde
    Compte.prototype.mettreAJourSolde = async function(montant, type) {
        if (type === 'Revenu') {
        this.solde = parseFloat(this.solde) + parseFloat(montant);
        } else if (type === 'Depense') {
        this.solde = parseFloat(this.solde) - parseFloat(montant);
        }
        await this.save();
        return this.solde;
    };

    return Compte;
};
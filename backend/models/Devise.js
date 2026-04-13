module.exports = (sequelize, DataTypes) => {
    const Devise = sequelize.define('Devise', {
        id_devise: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        code_devise: {type: DataTypes.STRING(5),allowNull: false},
        nom_devise: {type: DataTypes.STRING(50),allowNull: true},
        taux_exchange: {type: DataTypes.DECIMAL(15, 4),allowNull: true}
    }, {
        tableName: 'devises',
        timestamps: false
    });

    Devise.associate = (models) => {
        Devise.hasMany(models.Compte, {
        foreignKey: 'id_devise',
        as: 'comptes'
        });
        
        Devise.hasMany(models.Menage, {
        foreignKey: 'id_devise_principale',
        as: 'menages'
        });
    };

    return Devise;
};
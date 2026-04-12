const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const Utilisateur = sequelize.define('Utilisateur', {
        id_utilisateur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
        },
        email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
        },
        mot_de_passe: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [6, 255]
        }
        }
    }, {
        tableName: 'utilisateurs',
        timestamps: false,
        hooks: {
        beforeCreate: async (user) => {
            if (user.mot_de_passe) {
            user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('mot_de_passe')) {
            user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
            }
        }
        }
    });

    Utilisateur.prototype.verifierMotDePasse = async function(password) {
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

    return Utilisateur;
};
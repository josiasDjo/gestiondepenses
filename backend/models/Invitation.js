const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Invitation = sequelize.define('Invitation', {
    id_invitation: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    id_menage: {type: DataTypes.INTEGER,allowNull: false,references: {model: 'menages',key: 'id_menage'}},
    email_invite: {type: DataTypes.STRING(150),allowNull: false,validate: { isEmail: true }},
    id_expediteur: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'utilisateurs', key: 'id_utilisateur' }},
    token: { type: DataTypes.STRING(190), allowNull: false, unique: true },
    role: { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
    statut: { type: DataTypes.ENUM('en_attente', 'acceptee', 'expiree', 'annulee'), defaultValue: 'en_attente' },
    date_expiration: { type: DataTypes.DATE, allowNull: false, defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }}, 
    {
        tableName: 'invitations',
        timestamps: true,
        underscored: true,
        createdAt: 'date_creation',
        updatedAt: 'date_modification'
    });

    Invitation.associate = (models) => {
    Invitation.belongsTo(models.Menage, { foreignKey: 'id_menage', as: 'menage' });
    Invitation.belongsTo(models.Utilisateur, { foreignKey: 'id_expediteur', as: 'expediteur' });
};

module.exports = Invitation;
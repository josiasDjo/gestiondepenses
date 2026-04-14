const { Utilisateur, Menage, MembresMenage, sequelize } = require('../models');
const { Op } = require('sequelize');

// Envoyer une invitation
const envoyerInvitation = async (req, res) => {
    try {
        const { email, id_menage, role } = req.body;
        const user = await getUserFromToken(req);
        
        // Vérifier que l'utilisateur est admin du ménage
        const estAdmin = await MembresMenage.findOne({
        where: { id_utilisateur: user.id_utilisateur, id_menage, role: 'admin' }
        });
        
        if (!estAdmin) {
        return res.status(403).json({ message: 'Seul un admin peut inviter des membres' });
        }
        
        // Vérifier si l'utilisateur existe
        const invite = await Utilisateur.findOne({ where: { email } });
        
        if (!invite) {
        return res.status(404).json({ message: 'Aucun compte associé à cet email' });
        }
        
        // Vérifier s'il est déjà membre
        const dejaMembre = await MembresMenage.findOne({
        where: { id_utilisateur: invite.id_utilisateur, id_menage }
        });
        
        if (dejaMembre) {
        return res.status(400).json({ message: 'Cet utilisateur est déjà membre du ménage' });
        }
        
        // Créer l'invitation (table invitations à créer)
        const invitation = await Invitation.create({
        id_menage,
        email_invite: email,
        id_expediteur: user.id_utilisateur,
        role: role || 'member',
        statut: 'en_attente',
        date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
        });
        
        // Envoyer un email (optionnel)
        // await sendInvitationEmail(email, menage.nom_menage);
        
        res.json({ success: true, message: 'Invitation envoyée', invitation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Accepter une invitation
    const accepterInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await getUserFromToken(req);
        
        const invitation = await Invitation.findOne({
        where: { token, statut: 'en_attente' }
        });
        
        if (!invitation) {
        return res.status(404).json({ message: 'Invitation invalide ou expirée' });
        }
        
        if (invitation.date_expiration < new Date()) {
        await invitation.update({ statut: 'expiree' });
        return res.status(400).json({ message: 'Invitation expirée' });
        }
        
        if (invitation.email_invite !== user.email) {
        return res.status(403).json({ message: 'Cette invitation ne vous est pas destinée' });
        }
        
        // Ajouter l'utilisateur au ménage
        await MembresMenage.create({
        id_utilisateur: user.id_utilisateur,
        id_menage: invitation.id_menage,
        role: invitation.role
        });
        
        await invitation.update({ statut: 'acceptee' });
        
        res.json({ success: true, message: 'Vous avez rejoint le ménage' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
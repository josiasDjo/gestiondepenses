const { Invitation, Utilisateur, Menage, MembresMenage, sequelize } = require('../../models');
const crypto = require('crypto');

describe('Modèle Invitation', () => {
    let testUser, testMenage, testInvite;

    const genererToken = () => {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(77).toString('hex');
        return (timestamp + random).substring(0, 190);
    };

    beforeEach(async () => {
        // Nettoyer les tables
        await Invitation.destroy({ where: {}, truncate: true });
        await MembresMenage.destroy({ where: {}, truncate: true });
        await Menage.destroy({ where: {}, truncate: true });
        await Utilisateur.destroy({ where: {}, truncate: true });

        // Créer un utilisateur expéditeur
        testUser = await Utilisateur.create({
        nom: 'Expéditeur Test',
        email: 'expediteur@test.com',
        mot_de_passe: 'password123',
        provider: 'local'
        });

        // Créer un utilisateur invité
        testInvite = await Utilisateur.create({
        nom: 'Invité Test',
        email: 'invite@test.com',
        mot_de_passe: 'password123',
        provider: 'local'
        });

        // Créer un ménage
        testMenage = await Menage.create({
        nom_menage: 'Ménage Test Invitation'
        });

        // Associer l'expéditeur au ménage comme admin
        await MembresMenage.create({
        id_utilisateur: testUser.id_utilisateur,
        id_menage: testMenage.id_menage,
        role: 'admin'
        });
    });

    describe('Création d\'invitation', () => {
        it('devrait créer une invitation avec succès', async () => {
        const token = genererToken();
        const invitation = await Invitation.create({
            id_menage: testMenage.id_menage,
            email_invite: testInvite.email,
            id_expediteur: testUser.id_utilisateur,
            token: token,
            role: 'member',
            statut: 'en_attente',
            date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        expect(invitation.id_invitation).toBeDefined();
        expect(invitation.email_invite).toBe(testInvite.email);
        expect(invitation.role).toBe('member');
        expect(invitation.statut).toBe('en_attente');
        });

        it('devrait avoir un token unique', async () => {
        const token1 = genererToken();
        const token2 = genererToken();

        const invitation1 = await Invitation.create({
            id_menage: testMenage.id_menage,
            email_invite: 'test1@test.com',
            id_expediteur: testUser.id_utilisateur,
            token: token1,
            role: 'member',
            statut: 'en_attente',
            date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const invitation2 = await Invitation.create({
            id_menage: testMenage.id_menage,
            email_invite: 'test2@test.com',
            id_expediteur: testUser.id_utilisateur,
            token: token2,
            role: 'member',
            statut: 'en_attente',
            date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        expect(invitation1.token).not.toBe(invitation2.token);
        });
    });

    describe('Validation des invitations', () => {
        it('devrait avoir une date d\'expiration par défaut à 7 jours', async () => {
        const token = genererToken();
        const invitation = await Invitation.create({
            id_menage: testMenage.id_menage,
            email_invite: testInvite.email,
            id_expediteur: testUser.id_utilisateur,
            token: token,
            role: 'member',
            statut: 'en_attente'
        });

        const maintenant = new Date();
        const dateExpiration = new Date(invitation.date_expiration);
        const differenceJours = (dateExpiration - maintenant) / (1000 * 60 * 60 * 24);
        
        expect(differenceJours).toBeGreaterThan(6.9);
        expect(differenceJours).toBeLessThan(7.1);
        });

        it('ne devrait pas accepter un email invité invalide', async () => {
        const token = genererToken();
        
        await expect(Invitation.create({
            id_menage: testMenage.id_menage,
            email_invite: 'email-invalide',
            id_expediteur: testUser.id_utilisateur,
            token: token,
            role: 'member',
            statut: 'en_attente'
        })).rejects.toThrow();
        });
    });

    describe('Mise à jour du statut', () => {
        let testInvitation;

        beforeEach(async () => {
        const token = genererToken();
        testInvitation = await Invitation.create({
            id_menage: testMenage.id_menage,
            email_invite: testInvite.email,
            id_expediteur: testUser.id_utilisateur,
            token: token,
            role: 'member',
            statut: 'en_attente',
            date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        });

        it('devrait passer le statut à acceptée', async () => {
        await testInvitation.update({ statut: 'acceptee' });
        expect(testInvitation.statut).toBe('acceptee');
        });

        it('devrait passer le statut à expirée', async () => {
        await testInvitation.update({ statut: 'expiree' });
        expect(testInvitation.statut).toBe('expiree');
        });

        it('devrait passer le statut à annulée', async () => {
        await testInvitation.update({ statut: 'annulee' });
        expect(testInvitation.statut).toBe('annulee');
        });
    });
});
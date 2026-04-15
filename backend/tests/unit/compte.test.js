const { Compte, Utilisateur, Menage, MembresMenage, sequelize } = require('../../models');

describe('Modèle Compte', () => {
    let testUser, testMenage;

    beforeEach(async () => {
        // Nettoyer les tables
        await Compte.destroy({ where: {}, truncate: true });
        await MembresMenage.destroy({ where: {}, truncate: true });
        await Menage.destroy({ where: {}, truncate: true });
        await Utilisateur.destroy({ where: {}, truncate: true });

        // Créer un utilisateur de test
        testUser = await Utilisateur.create({
        nom: 'Test User',
        email: 'compte@test.com',
        mot_de_passe: 'password123',
        provider: 'local'
        });

        // Créer un ménage
        testMenage = await Menage.create({
        nom_menage: 'Ménage Test Compte'
        });

        // Associer l'utilisateur au ménage
        await MembresMenage.create({
        id_utilisateur: testUser.id_utilisateur,
        id_menage: testMenage.id_menage,
        role: 'admin'
        });
    });

    describe('Création de compte', () => {
        it('devrait créer un compte avec succès', async () => {
        const compte = await Compte.create({
            nom_compte: 'Compte Courant',
            type_compte: 'BANK',
            solde: 100000,
            id_menage: testMenage.id_menage
        });

        expect(compte.id_compte).toBeDefined();
        expect(compte.nom_compte).toBe('Compte Courant');
        expect(compte.type_compte).toBe('BANK');
        expect(parseFloat(compte.solde)).toBe(100000);
        });

        it('devrait créer un compte espèces avec solde zéro par défaut', async () => {
        const compte = await Compte.create({
            nom_compte: 'Portefeuille',
            type_compte: 'CASH',
            id_menage: testMenage.id_menage
        });

        expect(parseFloat(compte.solde)).toBe(0);
        });

        it('devrait créer un compte mobile money', async () => {
        const compte = await Compte.create({
            nom_compte: 'Orange Money',
            type_compte: 'MOBILE_MONEY',
            solde: 50000,
            id_menage: testMenage.id_menage
        });

        expect(compte.type_compte).toBe('MOBILE_MONEY');
        });
    });

    describe('Mise à jour du solde', () => {
        let testCompte;

        beforeEach(async () => {
        testCompte = await Compte.create({
            nom_compte: 'Compte Test',
            type_compte: 'BANK',
            solde: 100000,
            id_menage: testMenage.id_menage
        });
        });

        it('devrait augmenter le solde pour un revenu', async () => {
        const nouveauSolde = await testCompte.mettreAJourSolde(25000, 'Revenu');
        expect(parseFloat(nouveauSolde)).toBe(125000);
        });

        it('devrait diminuer le solde pour une dépense', async () => {
        const nouveauSolde = await testCompte.mettreAJourSolde(30000, 'Depense');
        expect(parseFloat(nouveauSolde)).toBe(70000);
        });

        it('devrait mettre à jour le solde correctement après plusieurs transactions', async () => {
        await testCompte.mettreAJourSolde(50000, 'Revenu');
        await testCompte.mettreAJourSolde(20000, 'Depense');
        await testCompte.mettreAJourSolde(10000, 'Depense');
        
        const compteActualise = await Compte.findByPk(testCompte.id_compte);
        expect(parseFloat(compteActualise.solde)).toBe(120000);
        });
    });

    describe('Validation des comptes', () => {
        it('ne devrait pas créer un compte sans nom', async () => {
        await expect(Compte.create({
            type_compte: 'BANK',
            solde: 1000,
            id_menage: testMenage.id_menage
        })).rejects.toThrow();
        });

        it('devrait accepter un solde négatif', async () => {
        const compte = await Compte.create({
            nom_compte: 'Compte Découvert',
            type_compte: 'BANK',
            solde: -5000,
            id_menage: testMenage.id_menage
        });

        expect(parseFloat(compte.solde)).toBe(-5000);
        });
    });

    describe('Association avec ménage', () => {
        it('devrait appartenir à un ménage', async () => {
        const compte = await Compte.create({
            nom_compte: 'Compte Ménage',
            type_compte: 'BANK',
            solde: 0,
            id_menage: testMenage.id_menage
        });

        const menage = await compte.getMenage();
        expect(menage.id_menage).toBe(testMenage.id_menage);
        });
    });
});
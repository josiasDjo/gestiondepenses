const { Transaction, Compte, Utilisateur, Menage, MembresMenage, sequelize } = require('../../models');

describe('Modèle Transaction', () => {
    let testUser, testMenage, testCompte;

    beforeEach(async () => {
        // Nettoyer les tables
        await Transaction.destroy({ where: {}, truncate: true });
        await Compte.destroy({ where: {}, truncate: true });
        await MembresMenage.destroy({ where: {}, truncate: true });
        await Menage.destroy({ where: {}, truncate: true });
        await Utilisateur.destroy({ where: {}, truncate: true });

        // Créer un utilisateur de test
        testUser = await Utilisateur.create({
        nom: 'Test User',
        email: 'test@transaction.com',
        mot_de_passe: 'password123',
        provider: 'local'
        });

        // Créer un ménage
        testMenage = await Menage.create({
        nom_menage: 'Ménage Test'
        });

        // Associer l'utilisateur au ménage
        await MembresMenage.create({
        id_utilisateur: testUser.id_utilisateur,
        id_menage: testMenage.id_menage,
        role: 'admin'
        });

        // Créer un compte
        testCompte = await Compte.create({
        nom_compte: 'Compte Test',
        type_compte: 'BANK',
        solde: 100000,
        id_menage: testMenage.id_menage
        });
    });

    describe('Création de transaction', () => {
        it('devrait créer une transaction de dépense', async () => {
        const transaction = await Transaction.create({
            montant: 25000,
            description: 'Achat alimentation',
            type_flux: 'Depense',
            categorie: 'Alimentation',
            id_compte: testCompte.id_compte
        });

        expect(transaction.id_transaction).toBeDefined();
        expect(transaction.montant).toBe(25000);
        expect(transaction.type_flux).toBe('Depense');
        });

        it('devrait créer une transaction de revenu', async () => {
        const transaction = await Transaction.create({
            montant: 150000,
            description: 'Salaire',
            type_flux: 'Revenu',
            categorie: 'Salaire',
            id_compte: testCompte.id_compte
        });

        expect(transaction.type_flux).toBe('Revenu');
        });
    });

    describe('Validation des montants', () => {
        it('ne devrait pas accepter un montant négatif', async () => {
        await expect(Transaction.create({
            montant: -1000,
            description: 'Test négatif',
            type_flux: 'Depense',
            id_compte: testCompte.id_compte
        })).rejects.toThrow();
        });
    });
});
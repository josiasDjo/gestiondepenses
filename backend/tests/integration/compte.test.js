const request = require('supertest');
const app = require('../../app');
const { Utilisateur, Menage, Compte, MembresMenage, sequelize } = require('../../models');

describe('API Comptes', () => {
    let authToken;
    let testMenageId;

    beforeAll(async () => {
        // Nettoyer les tables
        await Compte.destroy({ where: {}, truncate: true });
        await MembresMenage.destroy({ where: {}, truncate: true });
        await Menage.destroy({ where: {}, truncate: true });
        await Utilisateur.destroy({ where: {}, truncate: true });

        // Créer un utilisateur et récupérer son token
        const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
            nom: 'Test Compte API',
            email: 'compteapi@test.com',
            mot_de_passe: 'password123'
        });

        authToken = registerResponse.body.token;
        
        // Récupérer l'ID du ménage créé par défaut
        const menageResponse = await Menage.findOne({
        where: { nom_menage: 'Ménage de Test Compte API' }
        });
        
        if (menageResponse) {
        testMenageId = menageResponse.id_menage;
        }
    });

    describe('POST /api/comptes/create', () => {
        it('devrait créer un nouveau compte', async () => {
        const response = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Mon Compte Courant',
            type_compte: 'BANK',
            solde_initial: 150000,
            id_menage: testMenageId
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.compte.nom_compte).toBe('Mon Compte Courant');
        });

        it('devrait créer un compte avec solde zéro par défaut', async () => {
        const response = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Portefeuille Espèces',
            type_compte: 'CASH',
            id_menage: testMenageId
            });

        expect(response.status).toBe(201);
        expect(parseFloat(response.body.compte.solde)).toBe(0);
        });

        it('ne devrait pas créer un compte sans nom', async () => {
        const response = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            type_compte: 'BANK',
            solde_initial: 1000,
            id_menage: testMenageId
            });

        expect(response.status).toBe(500);
        });
    });

    describe('GET /api/comptes/all', () => {
        beforeAll(async () => {
        // Créer quelques comptes de test
        await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Compte Test 1',
            type_compte: 'BANK',
            solde_initial: 10000,
            id_menage: testMenageId
            });

        await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Compte Test 2',
            type_compte: 'MOBILE_MONEY',
            solde_initial: 5000,
            id_menage: testMenageId
            });
        });

        it('devrait retourner la liste des comptes', async () => {
        const response = await request(app)
            .get('/api/comptes/all')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
        });

        it('devrait inclure les statistiques des comptes', async () => {
        const response = await request(app)
            .get('/api/comptes/all')
            .set('Authorization', `Bearer ${authToken}`);

        const compte = response.body.find(c => c.nom_compte === 'Compte Test 1');
        expect(compte).toBeDefined();
        expect(compte.revenus_mois).toBeDefined();
        expect(compte.depenses_mois).toBeDefined();
        });
    });

    describe('GET /api/comptes/:id', () => {
        let testCompteId;

        beforeAll(async () => {
        const response = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Compte Détail',
            type_compte: 'BANK',
            solde_initial: 75000,
            id_menage: testMenageId
            });

        testCompteId = response.body.compte.id_compte;
        });

        it('devrait retourner un compte par son ID', async () => {
        const response = await request(app)
            .get(`/api/comptes/${testCompteId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.compte.id_compte).toBe(testCompteId);
        expect(response.body.compte.nom_compte).toBe('Compte Détail');
        });

        it('devrait retourner les transactions associées au compte', async () => {
        const response = await request(app)
            .get(`/api/comptes/${testCompteId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.body.transactions).toBeDefined();
        expect(Array.isArray(response.body.transactions)).toBe(true);
        });

        it('devrait retourner une erreur 404 pour un compte inexistant', async () => {
        const response = await request(app)
            .get('/api/comptes/99999')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/comptes/:id', () => {
        let testCompteId;

        beforeAll(async () => {
        const response = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Compte à Modifier',
            type_compte: 'BANK',
            solde_initial: 50000,
            id_menage: testMenageId
            });

        testCompteId = response.body.compte.id_compte;
        });

        it('devrait modifier le nom du compte', async () => {
        const response = await request(app)
            .put(`/api/comptes/${testCompteId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Nouveau Nom'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.compte.nom_compte).toBe('Nouveau Nom');
        });

        it('devrait modifier le type du compte', async () => {
        const response = await request(app)
            .put(`/api/comptes/${testCompteId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            type_compte: 'MOBILE_MONEY'
            });

        expect(response.status).toBe(200);
        expect(response.body.compte.type_compte).toBe('MOBILE_MONEY');
        });
    });

    describe('DELETE /api/comptes/:id', () => {
        let emptyCompteId;
        let compteAvecTransactionId;

        beforeAll(async () => {
        // Créer un compte vide
        const emptyResponse = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Compte Vide',
            type_compte: 'BANK',
            solde_initial: 0,
            id_menage: testMenageId
            });
        emptyCompteId = emptyResponse.body.compte.id_compte;

        // Créer un compte avec transaction
        const compteResponse = await request(app)
            .post('/api/comptes/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            nom_compte: 'Compte Avec Transaction',
            type_compte: 'BANK',
            solde_initial: 10000,
            id_menage: testMenageId
            });
        compteAvecTransactionId = compteResponse.body.compte.id_compte;

        // Ajouter une transaction
        await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            montant: 5000,
            description: 'Transaction test',
            type_flux: 'Depense',
            categorie: 'Test',
            id_compte: compteAvecTransactionId
            });
        });

        it('devrait supprimer un compte sans transactions', async () => {
        const response = await request(app)
            .delete(`/api/comptes/${emptyCompteId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        });

        it('ne devrait pas supprimer un compte avec des transactions', async () => {
        const response = await request(app)
            .delete(`/api/comptes/${compteAvecTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('transactions');
        });
    });

    describe('GET /api/comptes/solde/total', () => {
        it('devrait retourner le solde total de tous les comptes', async () => {
        const response = await request(app)
            .get('/api/comptes/solde/total')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.solde_total).toBeDefined();
        expect(response.body.nombre_comptes).toBeDefined();
        expect(Array.isArray(response.body.comptes)).toBe(true);
        });
    });
});
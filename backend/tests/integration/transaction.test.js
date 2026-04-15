const request = require('supertest');
const app = require('../../app');
const { Utilisateur, Menage, Compte, Transaction, sequelize } = require('../../models');

describe('API Transactions', () => {
    let authToken;
    let testCompteId;

    beforeAll(async () => {
        // Créer un utilisateur et récupérer son token
        const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
            nom: 'Test API',
            email: 'api@test.com',
            mot_de_passe: 'password123'
        });

        authToken = registerResponse.body.token;

        // Récupérer le compte créé par défaut
        const comptesResponse = await request(app)
        .get('/api/comptes')
        .set('Authorization', `Bearer ${authToken}`);

        if (comptesResponse.body.length > 0) {
        testCompteId = comptesResponse.body[0].id_compte;
        }
    });

    describe('POST /api/transactions', () => {
        it('devrait créer une nouvelle transaction', async () => {
        const response = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            montant: 50000,
            description: 'Test transaction',
            type_flux: 'Depense',
            categorie: 'Test',
            id_compte: testCompteId
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/transactions', () => {
        it('devrait retourner la liste des transactions', async () => {
        const response = await request(app)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.transactions).toBeDefined();
        expect(Array.isArray(response.body.transactions)).toBe(true);
        });
    });
});
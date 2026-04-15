const request = require('supertest');
const app = require('../../app');
const { Utilisateur, Menage, sequelize } = require('../../models');

describe('API Authentification', () => {
    beforeEach(async () => {
        await Utilisateur.destroy({ where: {}, truncate: true });
        await Menage.destroy({ where: {}, truncate: true });
    });

    describe('POST /api/auth/register', () => {
        it('devrait créer un nouvel utilisateur avec succès', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
            nom: 'Nouveau User',
            email: 'nouveau@test.com',
            mot_de_passe: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.nom).toBe('Nouveau User');
        });

        it('ne devrait pas créer un utilisateur avec email existant', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
            nom: 'User 1',
            email: 'existant@test.com',
            mot_de_passe: 'password123'
            });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
            nom: 'User 2',
            email: 'existant@test.com',
            mot_de_passe: 'password456'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Cet email est déjà utilisé');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
            nom: 'Test Login',
            email: 'login@test.com',
            mot_de_passe: 'password123'
            });
        });

        it('devrait connecter un utilisateur avec des identifiants corrects', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
            email: 'login@test.com',
            mot_de_passe: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        });

        it('ne devrait pas connecter un utilisateur avec mauvais mot de passe', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
            email: 'login@test.com',
            mot_de_passe: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Email ou mot de passe incorrect');
        });
    });
});
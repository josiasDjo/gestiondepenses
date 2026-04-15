const request = require('supertest');
const app = require('../../app');
const { Utilisateur, Invitation, sequelize } = require('../../models');

describe('API Invitations', () => {
    let adminToken;
    let testUserId;

    beforeAll(async () => {
        // Créer un utilisateur admin
        const adminResponse = await request(app)
        .post('/api/auth/register')
        .send({
            nom: 'Admin Test',
            email: 'admin@test.com',
            mot_de_passe: 'password123'
        });

        adminToken = adminResponse.body.token;
        testUserId = adminResponse.body.user.id;
    });

    describe('POST /api/invitations/envoyer', () => {
        it('devrait envoyer une invitation', async () => {
        // Créer un utilisateur invité
        const inviteResponse = await request(app)
            .post('/api/auth/register')
            .send({
            nom: 'Invité Test',
            email: 'invite@test.com',
            mot_de_passe: 'password123'
            });

        const response = await request(app)
            .post('/api/invitations/envoyer')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            email: 'invite@test.com',
            id_menage: 1,
            role: 'member'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        });
    });
});
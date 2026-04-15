const { Utilisateur, sequelize } = require('../../models');
const bcrypt = require('bcryptjs');

describe('Modèle Utilisateur', () => {
    beforeEach(async () => {
        // Nettoyer la table avant chaque test
        await Utilisateur.destroy({ where: {}, truncate: true });
    });

    describe('Création d\'utilisateur', () => {
        it('devrait créer un utilisateur avec succès', async () => {
        const user = await Utilisateur.create({
            nom: 'Besodia Kabambi',
            email: 'besodia@test.com',
            mot_de_passe: 'password123',
            provider: 'local'
        });

        expect(user.id_utilisateur).toBeDefined();
        expect(user.nom).toBe('Besodia Kabambi');
        expect(user.email).toBe('besodia@test.com');
        });

        it('ne devrait pas créer un utilisateur avec un email dupliqué', async () => {
            await Utilisateur.create({
                nom: 'Besodia Kabambi',
                email: 'besodia@test.com',
                mot_de_passe: 'password123',
                provider: 'local'
            });

            await expect(Utilisateur.create({
                nom: 'Besodia Kabambi2',
                email: 'besodia@test.com',
                mot_de_passe: 'password456',
                provider: 'local'
            })).rejects.toThrow();
        });

        it('devrait hacher le mot de passe avant création', async () => {
        const plainPassword = 'monpassword123';
        const user = await Utilisateur.create({
            nom: 'Test Hash',
            email: 'hash@test.com',
            mot_de_passe: plainPassword,
            provider: 'local'
        });

        expect(user.mot_de_passe).not.toBe(plainPassword);
        expect(user.mot_de_passe).toMatch(/^\$2[aby]\$\d+\$/);
        });
    });

    describe('Vérification mot de passe', () => {
        it('devrait valider un mot de passe correct', async () => {
        const plainPassword = 'password123';
        const user = await Utilisateur.create({
            nom: 'Test Password',
            email: 'password@test.com',
            mot_de_passe: plainPassword,
            provider: 'local'
        });

        const isValid = await user.verifierMotDePasse(plainPassword);
        expect(isValid).toBe(true);
        });

        it('devrait rejeter un mot de passe incorrect', async () => {
        const user = await Utilisateur.create({
            nom: 'Test Password',
            email: 'mauvais@test.com',
            mot_de_passe: 'password123',
            provider: 'local'
        });

        const isValid = await user.verifierMotDePasse('wrongpassword');
        expect(isValid).toBe(false);
        });
    });
});
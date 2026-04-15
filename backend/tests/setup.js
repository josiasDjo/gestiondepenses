const { sequelize } = require('../models');

// Avant tous les tests
beforeAll(async () => {
    try {
        await sequelize.authenticate();
        console.log('Base de données de test connectée');
        
        // Synchroniser les modèles (optionnel, pour les tests)
        await sequelize.sync({ force: true });
        console.log('Tables synchronisées pour les tests');
    } catch (error) {
        console.error('Erreur de connexion à la base de données de test:', error);
    }
});

// Après chaque test
afterEach(async () => {
    // Nettoyer les tables après chaque test pour éviter les interférences
    const tables = ['invitations', 'transactions', 'comptes', 'membres_menage', 'menages', 'utilisateurs'];
    for (const table of tables) {
        try {
        await sequelize.query(`DELETE FROM ${table}`);
        } catch (e) {
            // Ignore au cas où la table n'existe pas 
        }
    }
});


afterAll(async () => {
    await sequelize.close();
    console.log('✅ Connexion base de données fermée');
});
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('./database');  // ← Importer depuis database.js

const db = {};

// Charger tous les modèles
const files = fs.readdirSync(__dirname);

files.forEach(file => {
    if (file !== 'index.js' && file !== 'database.js' && file.endsWith('.js')) {
        try {
        const model = require(path.join(__dirname, file));
        if (model && model.name) {
            db[model.name] = model;
            console.log(`✅ Modèle chargé: ${model.name}`);
        }
        } catch (error) {
        console.error(`❌ Erreur chargement ${file}:`, error.message);
        }
    }
});

// Définir les associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        try {
        db[modelName].associate(db);
        } catch (error) {
        console.error(`❌ Erreur association ${modelName}:`, error.message);
        }
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
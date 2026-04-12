require('dotenv').config();

module.exports = {
  // Serveur
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Base de données
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'gestion_financiere',
    DB_PORT: process.env.DB_PORT || 3306,
    
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'votre_secret_key_ici',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    
    // Email (optionnel)
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
};
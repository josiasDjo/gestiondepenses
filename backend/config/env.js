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

    // Google Auth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

    // Session
    SESSION_SECRET: process.env.SESSION_SECRET

};

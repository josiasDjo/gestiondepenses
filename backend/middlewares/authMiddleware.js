const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const config = require('../config/env');

const protect = async (req, res, next) => {
    let token;
    
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Headers:', req.headers);
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token reçu:', token.substring(0, 30) + '...');
        
        const decoded = jwt.verify(token, config.JWT_SECRET);
        console.log('Token décodé:', decoded);
        
        req.user = await Utilisateur.findByPk(decoded.id, {
            attributes: { exclude: ['mot_de_passe'] }
        });
        
        if (!req.user) {
            console.log('❌ Utilisateur non trouvé');
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
        
        console.log('✅ Utilisateur authentifié:', req.user.email);
        next();
        } catch (error) {
        console.error('❌ Erreur token:', error.message);
        res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    } else {
        console.log('❌ Pas de token dans les headers');
        console.log('Authorization header:', req.headers.authorization);
        res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

module.exports = { protect };
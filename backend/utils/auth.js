const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const config = require('../config/env');

const getUserFromToken = async (req) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
        return null;
        }
        
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await Utilisateur.findByPk(decoded.id, {
        attributes: { exclude: ['mot_de_passe'] }
        });
        
        return user;
    } catch (error) {
        console.error('Erreur extraction token:', error.message);
        return null;
    }
};

module.exports = { getUserFromToken };
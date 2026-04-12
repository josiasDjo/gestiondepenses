const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const config = require('../config/env');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = await Utilisateur.findByPk(decoded.id, {
            attributes: { exclude: ['mot_de_passe'] }
        });
        next();
        } catch (error) {
        res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }
    
    if (!token) {
        res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

const isMembreMenage = async (req, res, next) => {
    const menageId = req.params.id_menage || req.body.id_menage;
    const user = req.user;
    
    const menages = await user.getMenages();
    const estMembre = menages.some(m => m.id_menage === parseInt(menageId));
    
    if (!estMembre) {
        return res.status(403).json({ message: 'Accès non autorisé à ce ménage' });
    }
    next();
};

module.exports = { protect, isMembreMenage };
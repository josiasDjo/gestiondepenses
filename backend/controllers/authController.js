const jwt = require('jsonwebtoken');
const { Utilisateur, Menage, membres_menage } = require('../models');
const config = require('../config/env');

const genererToken = (id) => {
    return jwt.sign({ id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Inscription
const register = async (req, res) => {
    try {
        const { nom, email, mot_de_passe, nom_menage } = req.body;
        
        const userExists = await Utilisateur.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        
        const user = await Utilisateur.create({ nom, email, mot_de_passe });
        
        // Créer un ménage par défaut
        const menage = await Menage.create({ 
            nom_menage: nom_menage || `Ménage de ${nom}` 
        });
        
        // Associer l'utilisateur au ménage
        await user.addMenage(menage);
        
        const token = genererToken(user.id_utilisateur);
        
        res.status(201).json({
            id: user.id_utilisateur,
            nom: user.nom,
            email: user.email,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        
        const user = await Utilisateur.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
    
        const isPasswordValid = await user.verifierMotDePasse(mot_de_passe);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
    
        const token = genererToken(user.id_utilisateur);
        
        res.json({
            id: user.id_utilisateur,
            nom: user.nom,
            email: user.email,
            token
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Profil utilisateur
const getProfile = async (req, res) => {
    try {
        const user = await Utilisateur.findByPk(req.user.id_utilisateur, {
        attributes: { exclude: ['mot_de_passe'] },
        include: ['menages']
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getProfile };
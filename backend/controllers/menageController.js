const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const Menage = require('../models/Menage')
const config = require('../config/env');
const MembresMenage = require('../models/Membres_menage')
const { getUserFromToken } = require('../utils/auth')


exports.createMenage = async (req, res) => {
    try {
        //
    } catch (err) {
        //
    }
} 

// Récupérer les ménages de l'utilisateur connecté
exports.getAllMenageUser = async (req, res) => {
    try {
        // Récupérer l'utilisateur à partir du token
        const user = await getUserFromToken(req);
        
        if (!user) {
        return res.status(401).json({ message: 'Non authentifié' });
        }
        
        const userId = user.id_utilisateur;
        const membres = await MembresMenage.findAll({
        where: { id_utilisateur: userId },
        include: [
            {
            model: Menage,
            as: 'menage',
            attributes: ['id_menage', 'nom_menage']
            }
        ]
        });
        
        const menages = membres.map(m => ({
        id_menage: m.menage.id_menage,
        nom_menage: m.menage.nom_menage,
        role: m.role,
        date_adhesion: m.date_adhesion
        }));
        
        res.json(menages);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: error.message });
    }
};
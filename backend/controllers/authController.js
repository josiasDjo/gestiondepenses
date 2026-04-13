const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const Menage = require('../models/Menage')
const MembresMenage = require('../models/Membres_menage')
const membresMenageController = require('./membresMenageController')
const config = require('../config/env');
const passport = require('passport-google-oauth20')
const bcrypt = require("bcryptjs");
const { where } = require('sequelize'); 

const genererToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Inscription Normal
const register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;

    const saltRounds = 10;
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, saltRounds);

    const userExists = await Utilisateur.findOne({ where : { email }})
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    const user = await Utilisateur.create({ 
      nom, 
      email, 
      mot_de_passe : mot_de_passe_hash,
      provider: 'local'
    });
    
    // Associer l'utilisateur au ménage
    console.log('Utilisateur créé avec ID:', user.id_utilisateur);
    
    // Créer le ménage
    const menage = await Menage.create({ 
      nom_menage: `Ménage de ${nom}` 
    });
    
    console.log('Ménage créé avec ID:', menage.id_menage);
    
    // Créer l'association via le contrôleur
    const association = await membresMenageController.creerAssociation(
      user.id_utilisateur,
      menage.id_menage,
      'admin'
    );
    console.log('✅ Association créée:', association);
    const token = genererToken(user.id_utilisateur);
    
    res.status(201).json({
      id: user.id_utilisateur,
      nom: user.nom,
      email: user.email,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Erreur lors de l'inscrption : ", error)
  }
};

// Connexion Normale
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Utilisateur.findOne({ where: { email } });
    console.log('Utilisateur trouvé:', user ? user.email : 'NON TROUVÉ');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier si c'est un compte Google
    if (user.provider === 'google') {
      return res.status(401).json({ 
        message: 'Ce compte utilise Google. Veuillez vous connecter avec Google.' 
      });
    }

    console.log('Hash stocké (début):', user.mot_de_passe ? user.mot_de_passe.substring(0, 20) + '...' : 'NULL');
    console.log('Provider:', user.provider);

    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
    console.log('Résultat bcrypt.compare:', isPasswordValid);

    // Rehacher le mot de passe pour tester 
    const saltRounds = 10;
    const testHash = await bcrypt.hash(mot_de_passe, saltRounds);
    console.log('Rehash du mot de passe saisi:', testHash);
    console.log('Hash stocké:', user.mot_de_passe);
    console.log('IDENTIQUES ?', testHash === user.mot_de_passe);

    if (!isPasswordValid) {
      console.log('Erreur : Email ou mot de passe incorrect')
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const token = genererToken(user.id_utilisateur);
    
    res.json({
      id: user.id_utilisateur,
      nom: user.nom,
      email: user.email,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Routes Google OAuth ==========

// Démarrer l'authentification Google
// const googleAuth = passport.authenticate('google', {
//     scope: ['profile', 'email'],
//     session: true
// });

// // Callback après authentification Google
// const googleCallback = (req, res, next) => {
//     passport.authenticate('google', { session: true }, async (err, user, info) => {
//         if (err || !user) {
//         return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//         }
        
//         // Générer un token JWT
//         const token = genererToken(user.id_utilisateur);
        
//         // Rediriger vers le frontend avec le token
//         res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
//         id: user.id_utilisateur,
//         nom: user.nom,
//         email: user.email,
//         avatar: user.avatar
//         }))}`);
//     })(req, res, next);
// };

// Vérifier le statut de l'utilisateur connecté
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

// Déconnexion
const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
        return res.status(500).json({ message: err.message });
        }
        res.json({ message: 'Déconnexion réussie' });
    });
};

module.exports = { 
    register, 
    login, 
    // googleAuth, 
    // googleCallback, 
    getProfile,
    logout
};